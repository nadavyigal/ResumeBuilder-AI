import { createClient } from '@/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';

/**
 * Transaction context interface
 */
export interface TransactionContext {
  userId?: string;
  operation?: string;
  requestId?: string;
}

/**
 * Transaction callback function type
 */
export type TransactionCallback<T> = (client: SupabaseClient) => Promise<T>;

/**
 * Compensation action for rollback scenarios
 */
export interface CompensationAction {
  description: string;
  action: () => Promise<void>;
}

/**
 * Transaction manager for Supabase operations
 * Since Supabase doesn't have native transactions, this implements
 * a compensation pattern for rollback scenarios
 */
export class DatabaseTransaction {
  private compensationActions: CompensationAction[] = [];
  private context: TransactionContext;

  constructor(context: TransactionContext = {}) {
    this.context = context;
  }

  /**
   * Add compensation action for potential rollback
   * @param action - Compensation action
   */
  addCompensation(action: CompensationAction): void {
    this.compensationActions.push(action);
  }

  /**
   * Execute rollback by running all compensation actions in reverse order
   */
  async rollback(): Promise<void> {
    logger.warn('Executing transaction rollback', {
      actionsCount: this.compensationActions.length
    }, this.context);

    const errors: Error[] = [];

    // Execute compensation actions in reverse order
    for (let i = this.compensationActions.length - 1; i >= 0; i--) {
      const action = this.compensationActions[i];
      try {
        logger.debug('Executing compensation action', { description: action.description }, this.context);
        await action.action();
      } catch (error) {
        logger.error('Compensation action failed', error, {
          ...this.context
        });
        errors.push(error as Error);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Rollback partially failed: ${errors.length} compensation actions failed`);
    }

    logger.info('Transaction rollback completed successfully', undefined, this.context);
  }
}

/**
 * Execute operations within a transactional context with compensation pattern
 * @param callback - Transaction callback
 * @param context - Transaction context for logging
 * @returns Result of the transaction
 */
export async function withTransaction<T>(
  callback: (client: SupabaseClient, transaction: DatabaseTransaction) => Promise<T>,
  context: TransactionContext = {}
): Promise<T> {
  const supabase = await createClient();
  const transaction = new DatabaseTransaction(context);
  const startTime = Date.now();

  try {
    logger.debug('Starting database transaction', undefined, context);
    
    const result = await callback(supabase, transaction);
    
    logger.info('Database transaction completed successfully', {}, context);
    
    return result;
  } catch (error) {
    logger.error('Database transaction failed, executing rollback', error, {
      ...context
    });

    try {
      await transaction.rollback();
    } catch (rollbackError) {
      logger.error('Transaction rollback failed', rollbackError, context);
      // Re-throw original error with rollback context
      throw new Error(`Transaction failed and rollback failed: ${error}, Rollback error: ${rollbackError}`);
    }

    throw error;
  }
}

/**
 * Atomic resume creation with file metadata
 * @param resumeData - Resume data to insert
 * @param context - Transaction context
 * @returns Created resume
 */
export async function createResumeWithTransaction(
  resumeData: {
    user_id: string;
    title: string;
    content: any;
    created_at?: string;
    updated_at?: string;
  },
  context: TransactionContext
): Promise<any> {
  return withTransaction(async (supabase, transaction) => {
    // Step 1: Insert resume record
    const { data: resume, error: insertError } = await supabase
      .from('resumes')
      .insert({
        user_id: resumeData.user_id,
        title: resumeData.title,
        content: resumeData.content,
        created_at: resumeData.created_at || new Date().toISOString(),
        updated_at: resumeData.updated_at || new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Add compensation action to delete resume if subsequent operations fail
    transaction.addCompensation({
      description: `Delete resume ${resume.id}`,
      action: async () => {
        const { error } = await supabase
          .from('resumes')
          .delete()
          .eq('id', resume.id);
        
        if (error) {
          throw error;
        }
      }
    });

    logger.debug('Resume created successfully', { resumeId: resume.id }, context);

    return resume;
  }, context);
}

/**
 * Update resume content with version tracking
 * @param resumeId - Resume ID to update
 * @param content - New content
 * @param userId - User ID for authorization
 * @param context - Transaction context
 * @returns Updated resume
 */
export async function updateResumeWithTransaction(
  resumeId: string,
  content: any,
  userId: string,
  context: TransactionContext
): Promise<any> {
  return withTransaction(async (supabase, transaction) => {
    // Step 1: Get current resume for backup
    const { data: currentResume, error: fetchError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!currentResume) {
      throw new Error('Resume not found or access denied');
    }

    // Step 2: Update resume
    const { data: updatedResume, error: updateError } = await supabase
      .from('resumes')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', resumeId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Add compensation action to restore original content
    transaction.addCompensation({
      description: `Restore resume ${resumeId} to previous version`,
      action: async () => {
        const { error } = await supabase
          .from('resumes')
          .update({
            content: currentResume.content,
            updated_at: currentResume.updated_at
          })
          .eq('id', resumeId)
          .eq('user_id', userId);
        
        if (error) {
          throw error;
        }
      }
    });

    logger.debug('Resume updated successfully', { resumeId }, context);

    return updatedResume;
  }, context);
}
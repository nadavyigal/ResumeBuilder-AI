import { env } from './env';

interface LogContext {
  userId?: string;
  requestId?: string;
  timestamp?: string;
  path?: string;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = env.NODE_ENV === 'development';
  private logLevel: LogLevel = ((env as any).LOG_LEVEL as LogLevel) || 'info';
  
  /**
   * Sanitize data to remove sensitive information
   * @param data - Data to sanitize
   * @returns Sanitized data
   */
  private sanitizeData(data: any): any {
    if (!data) return data;
    
    if (typeof data === 'string') {
      // Remove potential API keys, tokens, and sensitive patterns
      return data
        .replace(/sk-[a-zA-Z0-9]{48}/g, '[OPENAI_API_KEY_REDACTED]')
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]')
        .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD_NUMBER_REDACTED]');
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      
      // Remove sensitive fields
      const sensitiveFields = [
        'password', 'token', 'apiKey', 'session', 'secret', 'key',
        'authorization', 'auth', 'credential', 'email', 'phone'
      ];
      
      sensitiveFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]';
        }
      });
      
      // Recursively sanitize nested objects
      Object.keys(sanitized).forEach(key => {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      });
      
      return sanitized;
    }
    
    return data;
  }
  
  /**
   * Format log message with context
   * @param level - Log level
   * @param message - Log message
   * @param data - Additional data
   * @param context - Log context
   * @returns Formatted log message
   */
  private formatMessage(level: LogLevel, message: string, data?: any, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${JSON.stringify(context)}]` : '';
    const dataStr = data ? ` ${JSON.stringify(this.sanitizeData(data))}` : '';
    
    return `[${timestamp}] [${level.toUpperCase()}]${contextStr} ${message}${dataStr}`;
  }
  
  /**
   * Check if log level should be output
   * @param level - Log level to check
   * @returns boolean indicating if level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    return levels[level] >= levels[this.logLevel];
  }
  
  /**
   * Log debug message (development only)
   * @param message - Debug message
   * @param data - Additional data
   * @param context - Log context
   */
  debug(message: string, data?: any, context?: LogContext): void {
    if (!this.isDevelopment || !this.shouldLog('debug')) return;
    
    console.debug(this.formatMessage('debug', message, data, context));
  }
  
  /**
   * Log info message
   * @param message - Info message
   * @param data - Additional data
   * @param context - Log context
   */
  info(message: string, data?: any, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    
    if (this.isDevelopment) {
      console.log(this.formatMessage('info', message, data, context));
    } else {
      // In production, send to logging service (e.g., Winston, Pino, or cloud logging)
      this.sendToLoggingService('info', message, data, context);
    }
  }
  
  /**
   * Log warning message
   * @param message - Warning message
   * @param data - Additional data
   * @param context - Log context
   */
  warn(message: string, data?: any, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    
    if (this.isDevelopment) {
      console.warn(this.formatMessage('warn', message, data, context));
    } else {
      this.sendToLoggingService('warn', message, data, context);
    }
  }
  
  /**
   * Log error message
   * @param message - Error message
   * @param error - Error object or additional data
   * @param context - Log context
   */
  error(message: string, error?: Error | any, context?: LogContext): void {
    if (!this.shouldLog('error')) return;
    
    const errorData = error instanceof Error ? {
      message: error.message,
      stack: this.isDevelopment ? error.stack : undefined,
      name: error.name
    } : error;
    
    if (this.isDevelopment) {
      console.error(this.formatMessage('error', message, errorData, context));
    } else {
      this.sendToLoggingService('error', message, errorData, context);
      
      // In production, also send to error monitoring service (e.g., Sentry)
      if ((env as any).ENABLE_ERROR_REPORTING === 'true') {
        this.sendToErrorMonitoring(message, error, context);
      }
    }
  }
  
  /**
   * Send log to external logging service (production)
   * @param level - Log level
   * @param message - Log message
   * @param data - Additional data
   * @param context - Log context
   */
  private sendToLoggingService(level: LogLevel, message: string, data?: any, context?: LogContext): void {
    // TODO: Implement integration with logging service (e.g., Winston, Pino, CloudWatch)
    // For now, we'll use console in production but this should be replaced
    const logMessage = this.formatMessage(level, message, data, context);
    
    if (level === 'error') {
      console.error(logMessage);
    } else if (level === 'warn') {
      console.warn(logMessage);
    } else {
      console.log(logMessage);
    }
  }
  
  /**
   * Send error to error monitoring service
   * @param message - Error message
   * @param error - Error object
   * @param context - Log context
   */
  private sendToErrorMonitoring(message: string, error?: Error | any, context?: LogContext): void {
    // TODO: Implement integration with error monitoring service (e.g., Sentry, Bugsnag)
    // This would capture and send errors for production monitoring
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for external use
export type { LogContext, LogLevel };
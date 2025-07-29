-- Migration: Add chat_interactions table for AI assistant tracking
-- Version: 003
-- Date: 2025-07-15

-- Create chat_interactions table
CREATE TABLE IF NOT EXISTS chat_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    step VARCHAR(50),
    template_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_interactions_user_id ON chat_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_interactions_created_at ON chat_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_interactions_step ON chat_interactions(step);

-- Enable RLS
ALTER TABLE chat_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own chat interactions" ON chat_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat interactions" ON chat_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_interactions_updated_at 
    BEFORE UPDATE ON chat_interactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE chat_interactions IS 'Stores user interactions with the AI chat assistant';
COMMENT ON COLUMN chat_interactions.user_id IS 'Reference to the user who had this interaction';
COMMENT ON COLUMN chat_interactions.message IS 'The user message sent to the AI';
COMMENT ON COLUMN chat_interactions.response IS 'The AI response to the user';
COMMENT ON COLUMN chat_interactions.step IS 'The current step in the resume creation process';
COMMENT ON COLUMN chat_interactions.template_id IS 'The template ID if relevant to the conversation';

-- DOWN
-- Rollback script for migration 003

-- Drop trigger
DROP TRIGGER IF EXISTS update_chat_interactions_updated_at ON chat_interactions;

-- Drop policies
DROP POLICY IF EXISTS "Users can insert their own chat interactions" ON chat_interactions;
DROP POLICY IF EXISTS "Users can view their own chat interactions" ON chat_interactions;

-- Disable RLS
ALTER TABLE chat_interactions DISABLE ROW LEVEL SECURITY;

-- Drop indexes
DROP INDEX IF EXISTS idx_chat_interactions_step;
DROP INDEX IF EXISTS idx_chat_interactions_created_at;
DROP INDEX IF EXISTS idx_chat_interactions_user_id;

-- Drop table
DROP TABLE IF EXISTS chat_interactions; 
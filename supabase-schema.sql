-- IPMA Certification Prep Database Schema
-- This file contains all the database tables needed for the application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'trainer', 'trainee', 'user')),
    company_code TEXT,
    company_name TEXT,
    subscription_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    plan_type TEXT DEFAULT 'trial',
    auto_renew BOOLEAN DEFAULT false,
    reminder_sent JSONB DEFAULT '{"sevenDays": false, "oneDay": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topics table
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subtopic table
CREATE TABLE IF NOT EXISTS public.subtopics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    subtopic_id UUID REFERENCES public.subtopics(id) ON DELETE SET NULL,
    prompt TEXT NOT NULL,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    time_limit INTEGER DEFAULT 300, -- seconds
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPIs table
CREATE TABLE IF NOT EXISTS public.kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    weight DECIMAL(3,2) DEFAULT 1.00 CHECK (weight >= 0 AND weight <= 5),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question-KPI relationships
CREATE TABLE IF NOT EXISTS public.question_kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    kpi_id UUID REFERENCES public.kpis(id) ON DELETE CASCADE,
    weight DECIMAL(3,2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(question_id, kpi_id)
);

-- Sample answers table
CREATE TABLE IF NOT EXISTS public.sample_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    quality_score DECIMAL(3,2) DEFAULT 3.00 CHECK (quality_score >= 1 AND quality_score <= 5),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training examples table
CREATE TABLE IF NOT EXISTS public.training_examples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    example_text TEXT NOT NULL,
    quality_score DECIMAL(3,2) DEFAULT 3.00 CHECK (quality_score >= 1 AND quality_score <= 5),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company codes table
CREATE TABLE IF NOT EXISTS public.company_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam attempts table
CREATE TABLE IF NOT EXISTS public.attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    selected_question_ids UUID[] NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    total_score DECIMAL(5,2),
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attempt items table (individual question answers)
CREATE TABLE IF NOT EXISTS public.attempt_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID REFERENCES public.attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    kpi_scores JSONB DEFAULT '{}',
    total_score DECIMAL(5,2),
    time_spent INTEGER DEFAULT 0, -- seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data backup table (for automatic backup/restore)
CREATE TABLE IF NOT EXISTS public.data_backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backup_name TEXT NOT NULL,
    backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'manual')),
    data_snapshot JSONB NOT NULL,
    version TEXT DEFAULT '1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- User sessions table
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON public.questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON public.attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempt_items_attempt_id ON public.attempt_items(attempt_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Admins can see all data
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Similar policies for other tables...
CREATE POLICY "Users can view own attempts" ON public.attempts
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own attempts" ON public.attempts
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON public.topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kpis_updated_at BEFORE UPDATE ON public.kpis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attempts_updated_at BEFORE UPDATE ON public.attempts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attempt_items_updated_at BEFORE UPDATE ON public.attempt_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

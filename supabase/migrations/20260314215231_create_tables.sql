-- ============================
-- Jobs table
-- ============================
CREATE TABLE IF NOT EXISTS public.jobs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_name TEXT,
    customer_phone TEXT,
    postcode TEXT,
    address TEXT,
    type TEXT,
    duration INTEGER,
    notes TEXT,
    vehicle_reg TEXT,
    vehicle_info JSONB,
    price_quoted NUMERIC DEFAULT 0,
    vat_applied BOOLEAN DEFAULT false,
    vat_rate NUMERIC DEFAULT 0,
    date TEXT,
    time TEXT,
    priority TEXT DEFAULT 'normal',
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_date ON public.jobs(date);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs" ON public.jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own jobs" ON public.jobs FOR DELETE USING (auth.uid() = user_id);

-- ============================
-- Settings table
-- ============================
CREATE TABLE IF NOT EXISTS public.settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    work_start TEXT DEFAULT '08:00',
    work_end TEXT DEFAULT '18:00',
    working_days JSONB DEFAULT '[1,2,3,4,5]',
    lunch_enabled BOOLEAN DEFAULT true,
    lunch_start TEXT DEFAULT '12:00',
    lunch_duration INTEGER DEFAULT 60,
    home_postcode TEXT,
    default_travel INTEGER DEFAULT 30,
    buffer_time INTEGER DEFAULT 15,
    vat_registered BOOLEAN DEFAULT false,
    vat_rate NUMERIC DEFAULT 20,
    job_durations JSONB DEFAULT '{}',
    job_labels JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON public.settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON public.settings FOR DELETE USING (auth.uid() = user_id);

-- ============================
-- Jotter notes table
-- ============================
CREATE TABLE IF NOT EXISTS public.jotter_notes (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jotter_user_id ON public.jotter_notes(user_id);

ALTER TABLE public.jotter_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jotter" ON public.jotter_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jotter" ON public.jotter_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jotter" ON public.jotter_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own jotter" ON public.jotter_notes FOR DELETE USING (auth.uid() = user_id);

-- ============================
-- Time blocks table
-- ============================
CREATE TABLE IF NOT EXISTS public.time_blocks (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT,
    date TEXT,
    start_time TEXT,
    end_time TEXT,
    repeat TEXT DEFAULT 'none',
    color TEXT DEFAULT '#6b7280'
);

CREATE INDEX IF NOT EXISTS idx_blocks_user_id ON public.time_blocks(user_id);

ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blocks" ON public.time_blocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own blocks" ON public.time_blocks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own blocks" ON public.time_blocks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own blocks" ON public.time_blocks FOR DELETE USING (auth.uid() = user_id);

-- ============================
-- Customers table
-- ============================
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    postcode TEXT,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT customers_user_name_phone_unique UNIQUE NULLS NOT DISTINCT (user_id, name, phone)
);

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customers" ON public.customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own customers" ON public.customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own customers" ON public.customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own customers" ON public.customers FOR DELETE USING (auth.uid() = user_id);

-- ============================
-- Add customer_id FK to jobs
-- ============================
ALTER TABLE public.jobs
    ADD COLUMN IF NOT EXISTS customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON public.jobs(customer_id);

-- ============================
-- Retroactive migration: create customers from existing jobs
-- (idempotent — safe to re-run)
-- ============================
INSERT INTO public.customers (id, user_id, name, phone, address, postcode, created_at, updated_at)
SELECT DISTINCT ON (user_id, customer_name, customer_phone)
    'cust_' || md5(user_id::text || customer_name || coalesce(customer_phone, '')) AS id,
    user_id,
    customer_name AS name,
    customer_phone AS phone,
    address,
    postcode,
    now() AS created_at,
    now() AS updated_at
FROM public.jobs
WHERE customer_name IS NOT NULL AND customer_name <> ''
ON CONFLICT (user_id, name, phone) DO NOTHING;

-- Link jobs back to their newly created customer records
UPDATE public.jobs j
SET customer_id = c.id
FROM public.customers c
WHERE j.user_id = c.user_id
  AND j.customer_name = c.name
  AND (j.customer_phone = c.phone OR (j.customer_phone IS NULL AND c.phone IS NULL))
  AND j.customer_id IS NULL;

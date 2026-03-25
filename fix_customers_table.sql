-- 修复 customers 表缺失的字段
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS status VARCHAR(100);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS product VARCHAR(255);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS concerns TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS solution TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS competitors TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS last_follow_up VARCHAR(50);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS source VARCHAR(255);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS contact_role VARCHAR(255);

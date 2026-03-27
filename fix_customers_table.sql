-- Add missing columns to the customers table to support commercial tracking and improved project management.
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT '线索',
ADD COLUMN IF NOT EXISTS product TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS estimated_purchase_time TEXT,
ADD COLUMN IF NOT EXISTS estimated_purchase_amount NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS concerns TEXT,
ADD COLUMN IF NOT EXISTS solution TEXT,
ADD COLUMN IF NOT EXISTS competitors TEXT,
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS last_follow_up VARCHAR(50),
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index on status to improve filtering performance
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);

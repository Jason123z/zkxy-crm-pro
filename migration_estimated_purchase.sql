-- Add estimated purchase fields to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS estimated_purchase_time VARCHAR(255);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS estimated_purchase_amount NUMERIC(15, 2);

-- Update RLS if necessary (usually not needed for new columns if policy is FOR ALL)

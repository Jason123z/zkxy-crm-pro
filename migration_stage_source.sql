-- 1. 为 customers 表增加 source 字段
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS source VARCHAR(255);

-- 2. 插入初始的销售阶段配置
INSERT INTO public.system_settings (category, label, value, sort_order)
VALUES 
  ('sales_stage', '线索', '线索', 1),
  ('sales_stage', '初步拜访', '初步拜访', 2),
  ('sales_stage', '需求调研', '需求调研', 3),
  ('sales_stage', '询价', '询价', 4),
  ('sales_stage', '合同', '合同', 5)
ON CONFLICT DO NOTHING;

-- 3. 插入初始的客户来源配置
INSERT INTO public.system_settings (category, label, value, sort_order)
VALUES 
  ('customer_source', '广告投放', '广告投放', 1),
  ('customer_source', '官网咨询', '官网咨询', 2),
  ('customer_source', '线下活动', '线下活动', 3),
  ('customer_source', '转介绍', '转介绍', 4),
  ('customer_source', '电话开发', '电话开发', 5),
  ('customer_source', '其他', '其他', 6)
ON CONFLICT DO NOTHING;

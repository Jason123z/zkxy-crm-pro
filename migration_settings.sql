-- 插入初始的产品下拉项配置
INSERT INTO public.system_settings (category, label, value, sort_order)
VALUES 
  ('product', '企业ERP管理系统 v4.0', '企业ERP管理系统 v4.0', 1),
  ('product', '智能物流调度模块', '智能物流调度模块', 2),
  ('product', 'CRM基础云服务', 'CRM基础云服务', 3)
ON CONFLICT DO NOTHING;

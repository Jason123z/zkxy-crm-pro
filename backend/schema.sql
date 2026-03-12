-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if needed
-- DROP TABLE IF EXISTS tasks;
-- DROP TABLE IF EXISTS visit_records;
-- DROP TABLE IF EXISTS contacts;
-- DROP TABLE IF EXISTS customers;

-- 1. Create customers table
CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name VARCHAR(255) NOT NULL,
  level VARCHAR(50) NOT NULL,
  industry VARCHAR(255),
  size VARCHAR(255),
  contact_person VARCHAR(255),
  contact_role VARCHAR(255),
  last_follow_up VARCHAR(50),
  status VARCHAR(100),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create contacts table
CREATE TABLE contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  is_key BOOLEAN DEFAULT false,
  phone VARCHAR(50),
  email VARCHAR(255),
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create visit_records table
CREATE TABLE visit_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  type VARCHAR(100),
  title VARCHAR(255),
  date VARCHAR(50),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  deadline VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create check_ins table
CREATE TABLE check_ins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  customer VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  time VARCHAR(50),
  date VARCHAR(50),
  location TEXT,
  notes TEXT,
  photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create visit_plans table
CREATE TABLE visit_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  customer VARCHAR(255) NOT NULL,
  time VARCHAR(50),
  date VARCHAR(50),
  type VARCHAR(100),
  completed BOOLEAN DEFAULT false,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create reports table
CREATE TABLE reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  type VARCHAR(50) NOT NULL,
  date VARCHAR(100) NOT NULL,
  summary TEXT,
  next_plan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create client_progress table
CREATE TABLE client_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  customer_id VARCHAR(255),
  customer_name VARCHAR(255),
  status VARCHAR(100),
  progress TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_progress ENABLE ROW LEVEL SECURITY;

-- Create Policies (Only access own data)
CREATE POLICY "Users can only access their own customers" ON customers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own contacts" ON contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own visit_records" ON visit_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own check_ins" ON check_ins FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own visit_plans" ON visit_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own reports" ON reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own client_progress" ON client_progress FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_contacts_customer_id ON contacts(customer_id);
CREATE INDEX idx_visit_records_customer_id ON visit_records(customer_id);
CREATE INDEX idx_tasks_customer_id ON tasks(customer_id);
CREATE INDEX idx_client_progress_report_id ON client_progress(report_id);

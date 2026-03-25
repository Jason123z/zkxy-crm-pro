-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if needed
-- DROP TABLE IF EXISTS tasks;
-- DROP TABLE IF EXISTS visit_records;
-- DROP TABLE IF EXISTS contacts;
-- DROP TABLE IF EXISTS customers;

-- 1. Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  name VARCHAR(255) NOT NULL,
  level VARCHAR(50) NOT NULL,
  industry VARCHAR(255),
  size VARCHAR(255),
  address TEXT,
  budget_level VARCHAR(255),
  budget_amount NUMERIC(15, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.1 Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(100),
  product VARCHAR(255),
  budget_level VARCHAR(255),
  budget_amount NUMERIC(15, 2),
  description TEXT,
  competitors TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  decision_role VARCHAR(100),
  is_key BOOLEAN DEFAULT false,
  phone VARCHAR(50),
  email VARCHAR(255),
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create visit_records table
CREATE TABLE IF NOT EXISTS visit_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type VARCHAR(100),
  title VARCHAR(255),
  date VARCHAR(50),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  deadline VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create check_ins table
CREATE TABLE IF NOT EXISTS check_ins (
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
CREATE TABLE IF NOT EXISTS visit_plans (
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
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  type VARCHAR(50) NOT NULL,
  date VARCHAR(100) NOT NULL,
  summary TEXT,
  next_plan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create client_progress table
CREATE TABLE IF NOT EXISTS client_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  customer_id VARCHAR(255),
  customer_name VARCHAR(255),
  status VARCHAR(100),
  progress TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create profiles table (Public duplicate of auth.users metadata)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name VARCHAR(255),
  role VARCHAR(255),
  employee_id VARCHAR(50),
  avatar TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  department VARCHAR(255),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
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
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create Policies (Only access own data)
DROP POLICY IF EXISTS "Users can only access their own customers" ON customers;
CREATE POLICY "Users can only access their own customers" ON customers FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only access their own contacts" ON contacts;
CREATE POLICY "Users can only access their own contacts" ON contacts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only access their own visit_records" ON visit_records;
CREATE POLICY "Users can only access their own visit_records" ON visit_records FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only access their own tasks" ON tasks;
CREATE POLICY "Users can only access their own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only access their own check_ins" ON check_ins;
CREATE POLICY "Users can only access their own check_ins" ON check_ins FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only access their own visit_plans" ON visit_plans;
CREATE POLICY "Users can only access their own visit_plans" ON visit_plans FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only access their own reports" ON reports;
CREATE POLICY "Users can only access their own reports" ON reports FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only access their own client_progress" ON client_progress;
CREATE POLICY "Users can only access their own client_progress" ON client_progress FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only access their own projects" ON projects;
CREATE POLICY "Users can only access their own projects" ON projects FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only access their own profile" ON profiles;
CREATE POLICY "Users can only access their own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_customer_id ON contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_visit_records_customer_id ON visit_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_customer_id ON tasks(customer_id);
CREATE INDEX IF NOT EXISTS idx_client_progress_report_id ON client_progress(report_id);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '新用户'),
    NEW.email,
    'https://picsum.photos/seed/salesman/200/200',
    '销售人员'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

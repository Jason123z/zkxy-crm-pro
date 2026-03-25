-- 允许 'admin' 角色查看所有主要业务表
CREATE POLICY "Admins can view all contacts" ON contacts FOR SELECT USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );
CREATE POLICY "Admins can view all visit_records" ON visit_records FOR SELECT USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );
CREATE POLICY "Admins can view all projects" ON projects FOR SELECT USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );
CREATE POLICY "Admins can view all tasks" ON tasks FOR SELECT USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );

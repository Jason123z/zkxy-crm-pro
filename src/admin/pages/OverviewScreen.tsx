import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Target,
  ArrowUpRight,
  UserPlus
} from 'lucide-react';
import { getDashboardStats, getAllCustomers } from '../lib/api';
import { AdminPage } from '../types';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, Copy, Check, Info } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function OverviewScreen({ onNavigate }: { onNavigate: (page: AdminPage, filter?: string) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState<any[]>([]);
  const [salesStages, setSalesStages] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUserEmail(session?.user?.email || '未登录');

        const [s, customers, stages] = await Promise.all([
          getDashboardStats(),
          getAllCustomers(),
          supabase.from('system_settings').select('*').eq('category', 'sales_stage').order('sort_order', { ascending: true })
        ]);
        setStats(s);
        setCustomerData(customers);
        setSalesStages(stages.data || []);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const [copied, setCopied] = useState(false);

  const sqlScript = `-- 允许 'admin' 角色查看所有数据
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );
CREATE POLICY "Admins can view all customers" ON customers FOR SELECT USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );
CREATE POLICY "Admins can view all check_ins" ON check_ins FOR SELECT USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );
CREATE POLICY "Admins can view all reports" ON reports FOR SELECT USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );
-- ... 其他表类似`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const levelData = [
    { name: 'A类', value: stats?.customersA || 0 },
    { name: 'B类', value: stats?.customersB || 0 },
    { name: 'C类', value: stats?.customersC || 0 },
    { name: 'D类', value: stats?.customersD || 0 },
  ];

  // Calculated stage data based on real records
  const stages = salesStages.length > 0 
    ? salesStages.map(s => s.label) 
    : ['线索', '初步拜访', '需求调研', '询价', '合同'];
    
  const stageData = stages.map(stage => ({
    name: stage,
    value: customerData.filter(c => c.status === stage).length
  }));

  // Calculate new B-class customers this month (Mock logic for demonstration)
  const newBthisMonth = customerData.filter(c => {
    const created = new Date((c as any).createdAt || new Date());
    const now = new Date();
    return c.level === 'B' && created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  // Real inquiry stage customers (matching '询价' in the status string)
  const inquiryCustomers = customerData
    .filter(c => (c.status || '').includes('询价'))
    .sort((a, b) => new Date((b as any).updatedAt || b.createdAt || 0).getTime() - new Date((a as any).updatedAt || a.createdAt || 0).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">数据大屏</h2>
          <p className="text-slate-500">全量销售数据实时监控</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 shadow-sm flex items-center gap-2">
          <Clock size={16} />
          最后更新: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Debug Info Footer */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[10px] text-slate-500 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Info size={12} />
          <span>当前登录身份: <b>{userEmail}</b></span>
          {userEmail === 'admin@admin.com' && (
            <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded ml-2">管理权限就绪</span>
          )}
        </div>
        <div>
          数据同步状态: {(!stats || stats.totalCustomers === 0) ? '🔴 未同步' : '🟢 正常'}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '总客户量', value: stats?.totalCustomers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: '本月新增B类', value: newBthisMonth, icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: '有效签到', value: stats?.totalCheckIns, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: '活跃项目', value: stats?.totalProjects, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((item, idx) => (
          <div 
            key={idx} 
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md cursor-pointer group"
            onClick={() => {
              if (item.label === '总客户量') onNavigate('customers', 'all');
              if (item.label === '本月新增B类') onNavigate('customers', 'B');
              if (item.label === '活跃项目') onNavigate('reports');
              if (item.label === '有效签到') onNavigate('reports');
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${item.bg} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                <item.icon className={item.color} size={24} />
              </div>
              <div className="flex items-center text-emerald-600 text-xs font-bold">
                <ArrowUpRight size={14} />
                <span>12%</span>
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{item.label}</h3>
            <p className="text-2xl font-bold text-slate-800 mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Levels */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">客户等级分布 (ABCD)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={levelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {levelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Stage Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">销售阶段转化图</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      </div>
    );
}

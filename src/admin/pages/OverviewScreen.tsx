import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Target,
  ArrowUpRight,
  UserPlus,
  Info,
  X,
  ExternalLink
} from 'lucide-react';
import { getDashboardStats, getAllCustomers, getSystemSettings } from '../lib/api';
import { AdminPage } from '../types';
import { api } from '../../lib/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function OverviewScreen({ onNavigate }: { onNavigate: (page: AdminPage, filter?: string) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState<any[]>([]);
  const [salesStages, setSalesStages] = useState<any[]>([]);
  const [funnelStats, setFunnelStats] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const me = await api.get('/auth/me');
        setUserEmail(me?.email || '未登录');

        // Fetch primary stats, customers and stages
        const [s, customers, stages] = await Promise.all([
          getDashboardStats().catch(err => { console.error(err); return null; }),
          getAllCustomers().catch(err => { console.error(err); return []; }),
          getSystemSettings('sales_stage').catch(err => { console.error(err); return []; })
        ]);

        setStats(s);
        setCustomerData(customers);
        setSalesStages(stages || []);

        // Fetch funnel stats separately so a 500 here doesn't break the whole dashboard
        try {
          const fStats = await api.get('/admin/funnel-stats');
          setFunnelStats(fStats);
        } catch (fError) {
          console.error("Funnel stats fetch failed:", fError);
        }
      } catch (error) {
        console.error("Critical dashboard data fetch failed:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const levelData = [
    { name: 'A类客户', value: stats?.customersA || 0 },
    { name: 'B类客户', value: stats?.customersB || 0 },
    { name: 'C类客户', value: stats?.customersC || 0 },
    { name: 'D类客户', value: stats?.customersD || 0 },
  ];

  const stages = salesStages.length > 0 
    ? salesStages.map(s => s.label) 
    : ['线索', '初步拜访', '需求调研', '询价', '合同'];
    
  const stageData = stages.map(stage => ({
    name: stage,
    value: customerData.filter(c => c.status === stage).length
  }));

  const newBthisMonth = customerData.filter(c => {
    const created = new Date((c as any).createdAt || new Date());
    const now = new Date();
    return c.level === 'B' && created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">数据大屏 (MySQL)</h2>
          <p className="text-slate-500">全量销售数据实时监控</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 shadow-sm flex items-center gap-2 self-start sm:self-auto">
          <Clock size={16} />
          最后更新: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[10px] text-slate-500 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Info size={12} />
          <span>当前登录身份: <b>{userEmail}</b></span>
          <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded ml-2">管理权限已就绪</span>
        </div>
        <div>
          数据同步状态: {loading ? '⚪ 加载中' : (stats?.totalCustomers > 0 || funnelStats?.newBThisMonth >= 0) ? '🟢 正常' : '🟡 暂无数据'}
        </div>
      </div>

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
                <span>稳定</span>
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{item.label}</h3>
            <p className="text-2xl font-bold text-slate-800 mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6">月度漏斗动态跟踪</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div 
              className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-100 transition-colors"
              onClick={() => setActiveModal('newB')}
            >
              <span className="text-emerald-600 font-bold text-3xl">{funnelStats?.newBThisMonth || 0}</span>
              <span className="text-emerald-800 text-sm mt-1">本月新增B类</span>
            </div>
            <div 
              className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => setActiveModal('advanced')}
            >
              <span className="text-blue-600 font-bold text-3xl">{funnelStats?.advancedCount || 0}</span>
              <span className="text-blue-800 text-sm mt-1">进入下一阶段</span>
            </div>
            <div 
              className="bg-amber-50 rounded-lg p-4 border border-amber-100 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-100 transition-colors"
              onClick={() => setActiveModal('stagnant')}
            >
              <span className="text-amber-600 font-bold text-3xl">{funnelStats?.stagnantCount || 0}</span>
              <span className="text-amber-800 text-sm mt-1">阶段停滞(&gt;14天)</span>
            </div>
            <div 
              className="bg-red-50 rounded-lg p-4 border border-red-100 flex flex-col items-center justify-center cursor-pointer hover:bg-red-100 transition-colors"
              onClick={() => setActiveModal('backward')}
            >
              <span className="text-red-600 font-bold text-3xl">{funnelStats?.backwardCount || 0}</span>
              <span className="text-red-800 text-sm mt-1">退回上一阶段</span>
            </div>
          </div>

          <h4 className="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">近期变动记录</h4>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {!funnelStats?.recentHistory || funnelStats.recentHistory.length === 0 ? (
              <p className="text-slate-400 text-center py-4 text-sm">暂无本月变动记录</p>
            ) : (
             funnelStats.recentHistory.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                  <div>
                    <span className="font-bold text-slate-800 mr-2">{item.customerName}</span>
                    <span className="text-slate-500 text-xs">
                      {item.fieldName === 'level' ? '客户等级' : '销售阶段'}变化
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs line-through">{item.oldValue || '空'}</span>
                    <span className="text-slate-400">→</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">{item.newValue || '空'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

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
                  label={({ name, value }) => `${name}: ${value}`}
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

      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">
                {activeModal === 'newB' && '本月新增B类客户'}
                {activeModal === 'advanced' && '本月销售阶段推进明细'}
                {activeModal === 'stagnant' && '销售阶段停滞预警列表'}
                {activeModal === 'backward' && '本月销售阶段退回明细'}
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 text-sm uppercase tracking-wider">
                    <th className="pb-4 font-semibold">客户名称</th>
                    {(activeModal === 'advanced' || activeModal === 'backward') && (
                      <th className="pb-4 font-semibold">变动详情</th>
                    )}
                    {activeModal === 'stagnant' && (
                      <th className="pb-4 font-semibold">当前阶段</th>
                    )}
                    <th className="pb-4 font-semibold">负责销售</th>
                    <th className="pb-4 font-semibold">日期</th>
                    <th className="pb-4 font-semibold text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeModal === 'newB' && funnelStats?.newBDetails?.map((c: any) => (
                    <tr key={c.id} className="text-sm hover:bg-slate-50 transition-colors group">
                      <td className="py-4 font-medium text-slate-900">{c.name}</td>
                      <td className="py-4 text-slate-600">{c.salesperson}</td>
                      <td className="py-4 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 text-right">
                        <button className="text-blue-600 hover:underline inline-flex items-center gap-1">查看详情<ExternalLink size={14}/></button>
                      </td>
                    </tr>
                  ))}
                  {activeModal === 'advanced' && funnelStats?.advancedDetails?.map((item: any, idx: number) => (
                    <tr key={idx} className="text-sm hover:bg-slate-50 transition-colors group">
                      <td className="py-4 font-medium text-slate-900">{item.customerName}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">{item.oldValue}</span>
                          <span className="text-slate-400">→</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">{item.newValue}</span>
                        </div>
                      </td>
                      <td className="py-4 text-slate-600">{item.salesperson}</td>
                      <td className="py-4 text-slate-500">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="py-4 text-right">
                        <button className="text-blue-600 hover:underline inline-flex items-center gap-1">查看详情<ExternalLink size={14}/></button>
                      </td>
                    </tr>
                  ))}
                  {activeModal === 'backward' && funnelStats?.backwardDetails?.map((item: any, idx: number) => (
                    <tr key={idx} className="text-sm hover:bg-slate-50 transition-colors group">
                      <td className="py-4 font-medium text-slate-900">{item.customerName}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs line-through">{item.oldValue}</span>
                          <span className="text-slate-400">→</span>
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold">{item.newValue}</span>
                        </div>
                      </td>
                      <td className="py-4 text-slate-600">{item.salesperson}</td>
                      <td className="py-4 text-slate-500">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="py-4 text-right">
                        <button className="text-blue-600 hover:underline inline-flex items-center gap-1">查看详情<ExternalLink size={14}/></button>
                      </td>
                    </tr>
                  ))}
                  {activeModal === 'stagnant' && funnelStats?.stagnantDetails?.map((c: any) => (
                    <tr key={c.id} className="text-sm hover:bg-slate-50 transition-colors group">
                      <td className="py-4 font-medium text-slate-900">{c.name}</td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">{c.status}</span>
                      </td>
                      <td className="py-4 text-slate-600">{c.salesperson}</td>
                      <td className="py-4 text-slate-500">
                        {Math.floor((new Date().getTime() - new Date(c.lastUpdate).getTime()) / (1000 * 3600 * 24))}天前更新
                      </td>
                      <td className="py-4 text-right">
                        <button className="text-blue-600 hover:underline inline-flex items-center gap-1 text-xs">催办跟进<ExternalLink size={12}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!funnelStats || 
                (activeModal === 'newB' && (!funnelStats.newBDetails || funnelStats.newBDetails.length === 0)) ||
                (activeModal === 'advanced' && (!funnelStats.advancedDetails || funnelStats.advancedDetails.length === 0)) ||
                (activeModal === 'stagnant' && (!funnelStats.stagnantDetails || funnelStats.stagnantDetails.length === 0)) ||
                (activeModal === 'backward' && (!funnelStats.backwardDetails || funnelStats.backwardDetails.length === 0))
              ) && (
                <div className="py-20 text-center flex flex-col items-center">
                  <div className="bg-slate-50 p-4 rounded-full mb-4">
                    <Users size={48} className="text-slate-200" />
                  </div>
                  <p className="text-slate-400">本月内暂无相关变动记录</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-50 text-right bg-slate-50/50 rounded-b-2xl">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

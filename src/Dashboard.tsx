import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  MapPin, 
  FileText, 
  UserPlus, 
  Calendar, 
  Clock, 
  Home, 
  Users, 
  User,
  ChevronRight
} from 'lucide-react';
import BottomNav from './components/BottomNav';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { cn } from './lib/utils';

import { 
  getCustomers,
  getVisitPlans,
  getUserProfile,
  updateUserProfile,
  checkOverdueVisits,
  getAllTasks,
  getSystemSettings,
  getFunnelStats,
  DEFAULT_USER
} from './lib/data';

interface DashboardProps {
  onNavigate: (page: string) => void;
  onShowToast: (message: string) => void;
  onSelectTask?: (customerId: string, projectId?: string) => void;
}

const LEVEL_COLORS = {
  A: '#2563eb',
  B: '#3b82f6',
  C: '#60a5fa',
  D: '#93c5fd',
};

const STAGE_COLORS: Record<string, string> = {
  '线索': '#94a3b8',
  '初步拜访': '#10b981',
  '需求调研': '#3b82f6',
  '询价': '#f59e0b',
  '合同': '#8b5cf6',
};

export default function Dashboard({ onNavigate, onShowToast, onSelectTask }: DashboardProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [user, setUser] = useState(DEFAULT_USER);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [globalTasks, setGlobalTasks] = useState<any[]>([]);
  const [salesStages, setSalesStages] = useState<any[]>([]);
  const [funnelStats, setFunnelStats] = useState<any>(null);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return '早上好';
    if (hour >= 12 && hour < 14) return '中午好';
    if (hour >= 14 && hour < 18) return '下午好';
    return '晚上好';
  };

  React.useEffect(() => {
    const fetchData = async () => {
      const customersData = await getCustomers();
      const plansData = await getVisitPlans();
      setCustomers(customersData);
      setAllPlans(plansData);

      // 加载用户信息
      const profile = await getUserProfile();
      setUser(profile);

      // 检查逾期拜访
      const overdue = await checkOverdueVisits();
      setNotifications(overdue);

        try {
          const [tasks, stages, fStats] = await Promise.all([
            getAllTasks(),
            getSystemSettings('sales_stage'),
            getFunnelStats()
          ]);
          setGlobalTasks(tasks.filter((t: any) => t.status !== 'completed'));
          setSalesStages(stages || []);
          setFunnelStats(fStats);
        } catch (err) {
          console.error('Failed to load global data:', err);
        } finally {
          setLoadingTasks(false);
        }
    };
    fetchData();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayPlans = (allPlans || []).filter(p => p && p.date === today);
  
  // Level Data (Sales Funnel)
  const levelData = [
    { name: 'A类客户', value: customers.filter(c => c.level === 'A').length, color: LEVEL_COLORS.A },
    { name: 'B类客户', value: customers.filter(c => c.level === 'B').length, color: LEVEL_COLORS.B },
    { name: 'C类客户', value: customers.filter(c => c.level === 'C').length, color: LEVEL_COLORS.C },
    { name: 'D类客户', value: customers.filter(c => c.level === 'D').length, color: LEVEL_COLORS.D },
  ].filter(item => item.value > 0);

  // Stage Data (Sales Stage)
  const currentStages = salesStages.length > 0 
    ? salesStages.map(s => s.label) 
    : ['线索', '初步拜访', '需求调研', '询价', '合同'];
    
  const stageData = currentStages.map((stage, index) => {
    const predefinedColors = ['#94a3b8', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    return {
      name: stage,
      value: customers.filter(c => c.status === stage).length,
      color: STAGE_COLORS[stage] || predefinedColors[index % predefinedColors.length]
    };
  }).filter(item => item.value > 0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24 md:pb-8">
      {/* Header Section */}
      <div className="sticky top-0 z-20 flex items-center bg-white/80 backdrop-blur-md p-4 pb-2 justify-between border-b border-slate-100 px-4 md:px-8">
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 flex items-center justify-center rounded-full size-10 text-blue-600">
            <User size={24} />
          </div>
          <div>
            <h2 className="text-slate-900 text-lg font-bold">{getGreeting()}，{user.name}</h2>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className="flex items-center justify-center rounded-lg h-10 w-10 text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 z-[100] p-4 max-h-[400px] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900">消息通知</h3>
                <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold">{notifications.length}条新提醒</span>
              </div>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-center text-slate-400 py-8 text-sm">暂无新通知</p>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-lg border-l-4 border-red-500">
                      <p className="text-sm font-bold text-slate-900">拜访逾期预警</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {n.name}（{n.level}级）已超过{n.threshold}天未拜访（实际未拜访{n.daysSinceLastVisit}天）。
                      </p>
                      <div className="flex justify-end mt-2">
                        <button 
                          onClick={() => {
                            setShowNotifications(false);
                            onNavigate(`customers`); // Simple jump to customers
                          }}
                          className="text-[10px] text-blue-600 font-bold hover:underline"
                        >
                          立即处理
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 md:px-8 py-3 bg-white sticky top-[61px] z-10 border-b border-slate-100">
        <div className="relative flex items-center h-11 w-full bg-slate-100 rounded-xl px-4 max-w-2xl mx-auto focus-within:ring-2 focus-within:ring-blue-600 transition-all">
          <Search className="text-slate-400 mr-2" size={18} />
          <input 
            className="bg-transparent border-none outline-none w-full text-sm placeholder:text-slate-400" 
            placeholder="搜索客户、任务或报表" 
            onKeyDown={(e) => {
              if (e.key === 'Enter') onShowToast('搜索功能开发中...');
            }}
          />
        </div>
      </div>

      {/* Main Content Area in Grid */}
      <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Actions & Tasks */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-4">
        <button onClick={() => onNavigate('checkin')} className="flex flex-col items-center gap-2 group">
          <div className="size-12 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm group-active:scale-95 transition-transform border border-slate-100">
            <MapPin size={20} />
          </div>
          <span className="text-xs font-medium text-slate-600">签到打卡</span>
        </button>
        <button onClick={() => onNavigate('report')} className="flex flex-col items-center gap-2 group">
          <div className="size-12 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm group-active:scale-95 transition-transform border border-slate-100">
            <FileText size={20} />
          </div>
          <span className="text-xs font-medium text-slate-600">日报</span>
        </button>
        <button onClick={() => onNavigate('add-customer')} className="flex flex-col items-center gap-2 group">
          <div className="size-12 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm group-active:scale-95 transition-transform border border-slate-100">
            <UserPlus size={20} />
          </div>
          <span className="text-xs font-medium text-slate-600">添加客户</span>
        </button>
        <button onClick={() => onNavigate('visit-plan')} className="flex flex-col items-center gap-2 group">
          <div className="size-12 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm group-active:scale-95 transition-transform border border-slate-100">
            <Calendar size={20} />
          </div>
          <span className="text-xs font-medium text-slate-600">拜访计划</span>
        </button>
      </div>

      {/* Tasks for the Week */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-900 text-lg font-bold">今日拜访任务</h2>
          <button onClick={() => onNavigate('visit-plan')} className="text-blue-600 text-sm font-medium flex items-center">
            查看全部 <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {todayPlans.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
              <Calendar size={32} className="mb-2 opacity-20" />
              <p className="text-xs">今日暂无拜访任务</p>
            </div>
          ) : (
            todayPlans.map((plan) => (
              <div 
                key={plan.id}
                className={cn(
                  "bg-white p-4 rounded-xl shadow-sm border-l-4 cursor-pointer",
                  plan.completed ? "border-emerald-500 opacity-60" : "border-blue-600"
                )}
                onClick={() => onNavigate('visit-plan')}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900">{plan.customer}</h3>
                    <div className="flex items-center gap-1 mt-1 text-slate-500 text-sm">
                      <Clock size={14} />
                      <span>{plan.time}</span>
                    </div>
                  </div>
                  <span className={cn(
                    "px-2 py-1 text-[10px] font-bold rounded uppercase",
                    plan.completed ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                  )}>
                    {plan.completed ? '已完成' : '待办'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-900 text-lg font-bold">所有待办汇总</h2>
          <button onClick={() => onNavigate('all-tasks')} className="text-blue-600 text-sm font-medium flex items-center">
            查看全部 <ChevronRight size={14} />
          </button>
        </div>
        <div className="space-y-3">
          {loadingTasks ? (
            <div className="bg-white p-6 rounded-xl border border-slate-100 flex justify-center">
              <span className="text-xs text-slate-400">加载中...</span>
            </div>
          ) : globalTasks.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
              <FileText size={24} className="mb-2 opacity-20" />
              <p className="text-xs">当前无待办事项</p>
            </div>
          ) : (
            globalTasks.slice(0, 5).map((task) => (
              <div 
                key={task.id} 
                className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => {
                  if (task.customerId && onSelectTask) {
                    onSelectTask(task.customerId, task.projectId);
                  } else {
                    onNavigate('customers');
                  }
                }}
              >
                <div className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  task.status === 'pending' ? "bg-amber-400" : "bg-blue-500"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{task.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {task.customer?.name || '个人/通用'} · 截止日期: {task.deadline}
                  </p>
                </div>
                <ChevronRight className="text-slate-300" size={16} />
              </div>
            ))
          )}
        </div>
        </div> {/* End of Global Tasks */}
      </div> {/* End of Left Column */}

      {/* Right Column: Analytics & Charts */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-slate-900 text-lg font-bold">业绩看板</h2>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1 mt-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">月度漏斗动态评估</h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 flex flex-col items-center justify-center">
              <span className="text-emerald-600 font-bold text-2xl">{funnelStats?.newBThisMonth || 0}</span>
              <span className="text-emerald-800 text-xs mt-1">本月新增B类</span>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex flex-col items-center justify-center">
              <span className="text-blue-600 font-bold text-2xl">{funnelStats?.advancedCount || 0}</span>
              <span className="text-blue-800 text-xs mt-1">进入下一阶段</span>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 flex flex-col items-center justify-center">
              <span className="text-amber-600 font-bold text-2xl">{funnelStats?.stagnantCount || 0}</span>
              <span className="text-amber-800 text-xs mt-1">阶段停滞(&gt;14天)</span>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-100 flex flex-col items-center justify-center">
              <span className="text-red-600 font-bold text-2xl">{funnelStats?.backwardCount || 0}</span>
              <span className="text-red-800 text-xs mt-1">退回上一阶段</span>
            </div>
          </div>

          <h4 className="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">本月变动</h4>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {!funnelStats?.recentHistory || funnelStats.recentHistory.length === 0 ? (
              <p className="text-slate-400 text-center py-4 text-xs">暂无本月变动记录</p>
            ) : (
             funnelStats.recentHistory.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 mr-2">{item.customerName}</span>
                    <span className="text-slate-500">
                      {item.fieldName === 'level' ? '客户等级' : '销售阶段'}变化
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded line-through">{item.oldValue || '空'}</span>
                    <span className="text-slate-400">→</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-bold">{item.newValue || '空'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sales Stage Pie Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-slate-900 text-base font-bold">销售阶段分布</h2>
            <span className="text-xs text-slate-400 font-medium">实时统计</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  dataKey="value"
                >
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Sales Funnel Pie Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-slate-900 text-base font-bold">销售漏斗 (客户等级)</h2>
            <span className="text-xs text-slate-400 font-medium">本月数据</span>
          </div>
          <div className="h-64 w-full">
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>

      {/* Bottom Navigation Bar */}
      <BottomNav currentPage="dashboard" onNavigate={onNavigate} />
    </div>
  );
}

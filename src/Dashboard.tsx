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
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { cn } from './lib/utils';

import { getCustomers, getVisitPlans } from './lib/data';

interface DashboardProps {
  onNavigate: (page: string) => void;
  onShowToast: (message: string) => void;
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

export default function Dashboard({ onNavigate, onShowToast }: DashboardProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [allPlans, setAllPlans] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const customersData = await getCustomers();
      const plansData = await getVisitPlans();
      setCustomers(customersData);
      setAllPlans(plansData);
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
  const stages = ['线索', '初步拜访', '需求调研', '询价', '合同'];
  const stageData = stages.map(stage => ({
    name: stage,
    value: customers.filter(c => c.status === stage).length,
    color: STAGE_COLORS[stage] || '#cbd5e1'
  })).filter(item => item.value > 0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      {/* Header Section */}
      <div className="flex items-center bg-white p-4 pb-2 justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 flex items-center justify-center rounded-full size-10 text-blue-600">
            <User size={24} />
          </div>
          <h2 className="text-slate-900 text-lg font-bold">早上好，张三</h2>
        </div>
        <button onClick={() => onShowToast('暂无新通知')} className="flex items-center justify-center rounded-lg h-10 w-10 text-slate-900 hover:bg-slate-100 transition-colors">
          <Bell size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 bg-white">
        <div className="relative flex items-center h-11 w-full bg-slate-100 rounded-lg px-4">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2 px-4 py-6">
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

      {/* Charts Section */}
      <div className="px-4 py-2 space-y-4">
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
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white/90 backdrop-blur-md px-4 pb-6 pt-2">
        <div className="flex gap-2 max-w-md mx-auto">
          <button className="flex flex-1 flex-col items-center justify-end gap-1 text-blue-600">
            <Home size={24} />
            <p className="text-[10px] font-bold">首页</p>
          </button>
          <button onClick={() => onNavigate('customers')} className="flex flex-1 flex-col items-center justify-end gap-1 text-slate-400">
            <Users size={24} />
            <p className="text-[10px] font-medium">客户</p>
          </button>
          <button onClick={() => onNavigate('report')} className="flex flex-1 flex-col items-center justify-end gap-1 text-slate-400">
            <FileText size={24} />
            <p className="text-[10px] font-medium">日报</p>
          </button>
          <button onClick={() => onNavigate('profile')} className="flex flex-1 flex-col items-center justify-end gap-1 text-slate-400">
            <User size={24} />
            <p className="text-[10px] font-medium">我的</p>
          </button>
        </div>
      </div>
    </div>
  );
}

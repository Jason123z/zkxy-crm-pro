import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Bell, 
  MoreVertical, 
  Calendar, 
  ChevronDown, 
  Plus,
  Home,
  Users,
  FileText,
  User
} from 'lucide-react';
import BottomNav from './components/BottomNav';
import { cn } from './lib/utils';

import { getCustomers, getSystemSettings } from './lib/data';
import { Customer } from './types';

interface CustomerListProps {
  onBack: () => void;
  onSelectCustomer: (id: string) => void;
  onNavigate: (page: string) => void;
  onShowToast: (message: string) => void;
}

export default function CustomerList({ onBack, onSelectCustomer, onNavigate, onShowToast }: CustomerListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('全部');
  const [selectedStage, setSelectedStage] = useState('全部');
  const [isStageFilterOpen, setIsStageFilterOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesStages, setSalesStages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [cData, sData] = await Promise.all([
          getCustomers(),
          getSystemSettings('sales_stage')
        ]);
        setCustomers(cData);
        setSalesStages(sData || []);
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stages = ['全部', ...(salesStages.map(s => s.label))];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      '线索': 'bg-slate-100 text-slate-600',
      '初步拜访': 'bg-emerald-100 text-emerald-800',
      '需求调研': 'bg-blue-100 text-blue-800',
      '询价': 'bg-amber-100 text-amber-800',
      '合同': 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-slate-50 text-slate-500 border border-slate-100';
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (c.contactPerson || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === '全部' || c.level === selectedLevel;
    const matchesStage = selectedStage === '全部' || c.status === selectedStage;
    return matchesSearch && matchesLevel && matchesStage;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 md:px-8 py-3">
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-blue-600 flex size-10 items-center justify-center rounded-lg hover:bg-slate-100">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold tracking-tight">客户列表</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onShowToast('暂无新通知')} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100">
              <Bell size={20} />
            </button>
            <button onClick={() => onShowToast('更多选项开发中...')} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative block w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="text-slate-400" size={18} />
            </span>
            <input 
              className="block w-full rounded-xl border-none bg-slate-100 py-3 pl-10 pr-3 text-base placeholder:text-slate-500 focus:ring-2 focus:ring-blue-600 outline-none" 
              placeholder="搜索客户名称、联系人..." 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        {/* Filter Section */}
        <div className="mt-4 space-y-3">
          {/* Level Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar px-1">
            {['全部', 'A', 'B', 'C', 'D'].map((level) => (
              <button 
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                  selectedLevel === level ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                {level === '全部' ? '全部等级' : `等级 ${level}`}
              </button>
            ))}
          </div>

          {/* Stage Filter Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsStageFilterOpen(!isStageFilterOpen)} 
              className={cn(
                "flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium transition-all",
                selectedStage !== '全部' ? "border-blue-600 text-blue-600 ring-1 ring-blue-600" : "text-slate-700 hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-400">销售阶段:</span>
                <span className={cn(selectedStage !== '全部' && "font-bold")}>
                  {selectedStage === '全部' ? '全部阶段' : selectedStage}
                </span>
              </div>
              <ChevronDown size={18} className={cn("text-slate-400 transition-transform", isStageFilterOpen && "rotate-180")} />
            </button>
            
            {isStageFilterOpen && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setIsStageFilterOpen(false)}
                />
                <div className="absolute left-0 right-0 mt-2 rounded-xl bg-white shadow-2xl border border-slate-100 py-2 z-30 animate-in fade-in zoom-in duration-200">
                  {stages.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => {
                        setSelectedStage(stage);
                        setIsStageFilterOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between",
                        selectedStage === stage ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {stage === '全部' ? '全部阶段' : stage}
                      {selectedStage === stage && <div className="size-2 rounded-full bg-blue-600" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>

      {/* Main Content */}
      <main className="flex-1 px-4 md:px-8 py-6 md:py-10 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {isLoading ? (
            <div className="flex justify-center py-12 text-slate-400">加载中...</div>
          ) : filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
            <div 
              key={customer.id}
              onClick={() => onSelectCustomer(customer.id)}
              className="group relative rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">{customer.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-black text-white shadow-sm">等级 {customer.level}</span>
                    <span className="text-xs text-slate-500 font-medium">{customer.industry || '未分类'} · {customer.size || '规模未知'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", getStatusColor(customer.status))}>
                    {customer.status}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar size={14} />
                  最近跟进: {customer.lastFollowUp}
                </div>
                <button className="text-blue-600 text-sm font-semibold">查看详情</button>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Search size={48} className="mb-4 opacity-20" />
              <p>未找到匹配的客户</p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => onNavigate('add-customer')}
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/40 active:scale-95 transition-transform z-30"
      >
        <Plus size={30} />
      </button>

      {/* Bottom Navigation Bar */}
      <BottomNav currentPage="customers" onNavigate={onNavigate} />
    </div>
  );
}

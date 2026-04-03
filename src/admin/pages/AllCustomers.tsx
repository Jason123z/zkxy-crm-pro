import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  User, 
  Building2, 
  MapPin,
  History,
  Tag,
  Briefcase
} from 'lucide-react';
import { getAllCustomers, getAllProfiles, getSystemSettings } from '../lib/api';
import { Customer, UserProfile } from '../../types';

interface AllCustomersProps {
  initialFilter?: string;
  onSelectCustomer: (id: string) => void;
}

export default function AllCustomers({ initialFilter = 'all', onSelectCustomer }: AllCustomersProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>(initialFilter === 'all' ? 'all' : initialFilter);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [salesStages, setSalesStages] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [c, p, stages] = await Promise.all([
          getAllCustomers(),
          getAllProfiles(),
          getSystemSettings('sales_stage')
        ]);
        setCustomers(c);
        setProfiles(p);
        setSalesStages(stages || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredCustomers = (customers || []).filter(c => {
    const name = c.name || '';
    const industry = c.industry || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPersonnel = selectedPersonnel === 'all' || (c as any).userId === selectedPersonnel;
    const matchesLevel = selectedLevel === 'all' || c.level === selectedLevel;
    const matchesStage = selectedStage === 'all' || c.status === selectedStage;
    
    return matchesSearch && matchesPersonnel && matchesLevel && matchesStage;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">全员客户列表</h2>
          <p className="text-slate-500">查看及管理所有销售人员的客户资产</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="搜索客户名称或行业..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium whitespace-nowrap">
          <Filter size={16} className="text-slate-400" />
          <span>筛选:</span>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <select 
            value={selectedPersonnel}
            onChange={e => setSelectedPersonnel(e.target.value)}
            className="flex-1 sm:flex-none text-sm bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">所有人员</option>
            {profiles.map(p => (
              <option key={(p as any).id} value={(p as any).id}>{p.name}</option>
            ))}
          </select>
  
          <select 
            value={selectedLevel}
            onChange={e => setSelectedLevel(e.target.value)}
            className="flex-1 sm:flex-none text-sm bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">等级</option>
            <option value="A">A类</option>
            <option value="B">B类</option>
            <option value="C">C类</option>
            <option value="D">D类</option>
          </select>
  
          <select 
            value={selectedStage}
            onChange={e => setSelectedStage(e.target.value)}
            className="flex-1 sm:flex-none text-sm bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">阶段</option>
            {salesStages.map(s => (
              <option key={s.id} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="hidden sm:block flex-1 text-right text-xs text-slate-400 pr-2">
          共 {filteredCustomers.length} 个客户
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(customer => (
          <div 
            key={customer.id} 
            onClick={() => {
              console.log("Card clicked for customer:", customer.id);
              onSelectCustomer(customer.id);
            }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-pointer"
          >
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    {(customer.name || '?')[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                      {customer.name}
                    </h3>
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Briefcase size={10} />
                      {customer.industry}
                    </span>
                    <div className="mt-1 flex flex-col gap-1">
                      <span className="w-fit text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-bold border border-emerald-100">
                        {customer.status || '线索'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium ml-1">
                        创建于: {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '-'}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded text-xs font-bold tracking-wider uppercase shadow-sm
                  ${customer.level === 'A' ? 'bg-red-50 text-red-600 border border-red-100' : 
                    customer.level === 'B' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    customer.level === 'C' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                    'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                  {customer.level}级
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-400" />
                  <span className="font-medium text-slate-700">所属负责人:</span>
                  <span>{(customer as any).ownerName || '测试人员'}</span>
                </div>
                <div className="flex items-start gap-2 pt-1 border-t border-slate-50">
                  <History size={14} className="text-slate-400 mt-1 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-medium text-slate-700">最近跟进记录:</span>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {customer.lastFollowUp || '暂无跟进记录'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center group-hover:bg-blue-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">预计预算</span>
                  <span className="text-sm font-bold text-slate-700">
                    {customer.budgetAmount ? `¥${customer.budgetAmount.toLocaleString()}` : '-'}
                  </span>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCustomer(customer.id);
                }}
                className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline"
              >
                查看详情
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}

        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-12 bg-white rounded-xl border border-dotted border-slate-300 flex flex-col items-center justify-center text-slate-400">
            <Building2 size={48} className="mb-4 opacity-20" />
            <p className="text-lg">未找到符合条件的客户</p>
            <button onClick={() => {setSearchTerm(''); setSelectedPersonnel('all'); setSelectedLevel('all'); setSelectedStage('all');}} className="mt-2 text-blue-600 text-sm hover:underline">
              清除所有筛选
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

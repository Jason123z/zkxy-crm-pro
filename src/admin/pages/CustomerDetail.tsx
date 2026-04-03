import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  User, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Briefcase,
  History,
  CheckCircle2,
  Clock,
  Target,
  Calendar
} from 'lucide-react';
import { getCustomerDetail, getCustomerContacts, getCustomerVisits, getCustomerTasks } from '../lib/api';
import { Customer, Contact, VisitRecord, Task } from '../../types';

interface CustomerDetailProps {
  customerId: string;
  onBack: () => void;
}

export default function CustomerDetail({ customerId, onBack }: CustomerDetailProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerName, setOwnerName] = useState<string>('加载中...');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [detailRes, contactsRes, visitsRes, tasksRes] = await Promise.all([
          getCustomerDetail(customerId),
          getCustomerContacts(customerId),
          getCustomerVisits(customerId),
          getCustomerTasks(customerId)
        ]);

        setCustomer(detailRes.customer);
        setOwnerName(detailRes.ownerName);
        setContacts(contactsRes);
        setVisits(visitsRes);
        setTasks(tasksRes);

      } catch (error) {
        console.error("Failed to fetch customer details:", error);
      } finally {
        setLoading(false);
      }
    }

    if (customerId) fetchData();
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">未找到客户信息</p>
        <button onClick={onBack} className="mt-4 text-blue-600 font-bold">返回列表</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{customer.name}</h2>
          <div className="flex items-center gap-3 mt-1">
             <span className="text-sm text-slate-500 flex items-center gap-1">
                <User size={14} className="text-slate-400" />
                所属销售: <b className="text-slate-700">{ownerName}</b>
             </span>
             <span className="px-3 py-1 rounded bg-blue-50 text-blue-600 text-xs font-bold uppercase shadow-sm">
                {customer.level}级客户
             </span>
             <span className="px-3 py-1 rounded bg-emerald-50 text-emerald-600 text-xs font-bold uppercase shadow-sm">
                当前阶段: {customer.status}
             </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info Card */}
        {/* Recent Interaction History - Moved to Top */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <History size={18} className="text-blue-600" />
                最近跟进记录
              </h3>
            </div>
            <div className="p-6 space-y-6 relative">
               <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-slate-100" />
               {visits.length > 0 ? visits.slice(0, 5).map((visit, idx) => (
                 <div key={visit.id} className="relative flex gap-4 pl-2">
                    <div className="w-6 h-6 rounded-full bg-white border-2 border-blue-600 z-10 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                           <p className="text-sm font-bold text-slate-800">{visit.title}</p>
                           <span className="text-[10px] text-slate-400">{visit.date}</span>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{visit.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded font-bold uppercase">
                               跟进人: {visit.salespersonName || '系统'}
                           </span>
                           <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded font-medium">
                               {visit.type}
                           </span>
                        </div>
                    </div>
                 </div>
               )) : (
                 <p className="text-center text-slate-400 text-sm py-4">暂无跟进记录</p>
               )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Building2 size={18} className="text-blue-600" />
                基本信息
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">所属行业</p>
                <p className="text-slate-700 font-medium">{customer.industry || '未填写'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">企业规模</p>
                <p className="text-slate-700 font-medium">{customer.size || '未知'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">预算级别</p>
                <p className="text-slate-700 font-medium">{customer.budgetLevel || '未设定'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">业务状态</p>
                <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                   {customer.status}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">客户来源</p>
                <p className="text-slate-700 font-medium">{customer.source || '未维护'}</p>
              </div>
              <div className="md:col-span-2 space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">联系地址</p>
                <div className="flex items-start gap-1.5 text-slate-700">
                  <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <p>{customer.address || '暂无详细地址'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Intention & Needs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Target size={18} className="text-blue-600" />
                意向与需求
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">意向产品</p>
                <p className="text-slate-700 font-medium">{customer.product || '未明确'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">预算金额</p>
                <p className="text-slate-700 font-medium">{customer.budgetAmount ? `¥${customer.budgetAmount.toLocaleString()}` : '未确定'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">预计采购时间</p>
                <p className="text-slate-700 font-medium">{customer.estimatedPurchaseTime || '未填写'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">预计采购金额</p>
                <p className="text-slate-700 font-medium">{customer.estimatedPurchaseAmount ? `¥${customer.estimatedPurchaseAmount.toLocaleString()}` : '未确定'}</p>
              </div>
              <div className="md:col-span-2 space-y-1 border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">需求/痛点</p>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{customer.description || '未记录'}</p>
              </div>
              <div className="md:col-span-2 space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">客户顾虑点</p>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{customer.concerns || '未记录'}</p>
              </div>
              <div className="md:col-span-2 space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">解决方案</p>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{customer.solution || '未记录'}</p>
              </div>
              <div className="md:col-span-2 space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">倾向竞品</p>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{customer.competitors || '未记录'}</p>
              </div>
            </div>
          </div>
 
          {/* Tasks & Next Follow-up Plan */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                待办&下次跟进计划
              </h3>
            </div>
            <div className="p-6 space-y-3">
              {tasks.length > 0 ? tasks.map(task => (
                <div key={task.id} className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg group transition-all hover:bg-slate-100">
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                    {task.status === 'completed' && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={12} className="text-slate-400" />
                      <span className={`text-[10px] font-bold ${task.deadline.includes('今天') ? 'text-red-500' : 'text-slate-500'}`}>
                        {task.deadline}
                      </span>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-center text-slate-400 text-sm py-4">暂无待办任务</p>
              )}
            </div>
          </div>


          </div>
        </div>

        {/* Sidebar: Contacts & Recent Visits */}
        <div className="space-y-6">
          {/* Key Contacts */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <User size={16} className="text-blue-600" />
                关键联系人
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {contacts.length > 0 ? contacts.map(contact => (
                <div key={contact.id} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                    {contact.avatar ? <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" /> : <User size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-800 truncate">{contact.name}</p>
                        {contact.decisionRole && (
                          <span className={`${contact.isKey ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'} text-[8px] font-bold px-1 rounded uppercase`}>
                            {contact.decisionRole}
                          </span>
                        )}
                    </div>
                    <p className="text-[10px] text-slate-500">{contact.role}</p>
                  </div>
                  <div className="flex gap-1">
                    {contact.phone && <button className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md"><Phone size={14} /></button>}
                    {contact.email && (
                      <div className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md" title={`微信: ${contact.email}`}>
                        <MessageCircle size={14} />
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-center text-slate-400 text-xs py-4">暂无联系人</p>
              )}
            </div>
          </div>
          {/* Removed Recent Visit History from sidebar as it moved to top */}
        </div>
      </div>
    );
}

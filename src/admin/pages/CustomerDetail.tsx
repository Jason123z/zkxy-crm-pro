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
  Target
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Customer, Project, Contact, VisitRecord } from '../../types';
import { toCamelCase } from '../../lib/data'; // We can reuse the utility

interface CustomerDetailProps {
  customerId: string;
  onBack: () => void;
}

export default function CustomerDetail({ customerId, onBack }: CustomerDetailProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerName, setOwnerName] = useState<string>('加载中...');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch basic customer info
        const { data: custData, error: custError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', customerId)
          .single();
        
        if (custError) throw custError;
        setCustomer(toCamelCase<Customer>(custData));

        // Fetch owner name
        if (custData.user_id) {
          const { data: profData } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', custData.user_id)
            .single();
          if (profData) setOwnerName(profData.name);
        }

        // Fetch related data
        const [contRes, visitRes] = await Promise.all([
          supabase.from('contacts').select('*').eq('customer_id', customerId),
          supabase.from('visit_records').select('*').eq('customer_id', customerId).order('date', { ascending: false })
        ]);

        setContacts((contRes.data || []).map(c => toCamelCase<Contact>(c)));
        setVisits((visitRes.data || []).map(v => toCamelCase<VisitRecord>(v)));

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
             <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase">
                {customer.level}级客户
             </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info Card */}
        <div className="lg:col-span-2 space-y-6">
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

          {/* Recent Interaction History */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <History size={16} className="text-blue-600" />
                最近跟进记录
              </h3>
            </div>
            <div className="p-5 space-y-6 relative">
               <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-100" />
               {visits.slice(0, 5).map((visit, idx) => (
                 <div key={visit.id} className="relative flex gap-4 pl-2">
                    <div className="w-6 h-6 rounded-full bg-white border-2 border-blue-600 z-10 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                           <p className="text-xs font-bold text-slate-800">{visit.title}</p>
                           <span className="text-[10px] text-slate-400">{visit.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{visit.content}</p>
                        <span className="inline-block mt-2 px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded font-medium">
                            {visit.type}
                        </span>
                    </div>
                 </div>
               ))}
               {visits.length === 0 && <p className="text-center text-slate-400 text-xs py-4">暂无跟进记录</p>}
            </div>
          </div>
        </div>
      </div>
    );
}

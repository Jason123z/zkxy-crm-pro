import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  User, 
  Phone, 
  MapPin, 
  ChevronDown, 
  Check,
  Plus,
  MessageCircle,
  X
} from 'lucide-react';

import { createCustomer, createContact, getSystemSettings } from './lib/data';
import { Customer } from './types';
import { useEffect } from 'react';

interface AddCustomerProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function AddCustomer({ onBack, onSuccess }: AddCustomerProps) {
  const [formData, setFormData] = useState({
    name: '',
    level: 'B',
    contactPerson: '',
    phone: '',
    address: '',
    industry: '行政事业单位',
    size: '100-500人',
    budgetLevel: '',
    budgetAmount: '',
    estimatedPurchaseTime: '',
    estimatedPurchaseAmount: '',
    wechat: '',
    source: ''
  });

  const [industries, setIndustries] = useState<{label: string, value: string}[]>([]);
  const [sources, setSources] = useState<{label: string, value: string}[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [indData, sourceData] = await Promise.all([
          getSystemSettings('industry'),
          getSystemSettings('customer_source')
        ]);
        setIndustries(indData);
        setSources(sourceData);
        
        setFormData(prev => ({ 
          ...prev, 
          industry: prev.industry || (indData.length > 0 ? indData[0].value : '行政事业单位'),
          source: prev.source || (sourceData.length > 0 ? sourceData[0].value : '官网咨询')
        }));
      } catch (error) {
        console.error('Failed to fetch settings', error);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCustomer = {
      name: formData.name,
      level: formData.level as any,
      industry: formData.industry,
      size: formData.size,
      contactPerson: formData.contactPerson,
      contactRole: '主要联系人',
      lastFollowUp: new Date().toISOString().split('T')[0],
      status: '初步拜访',
      address: formData.address,
      source: formData.source,
      budgetLevel: formData.budgetLevel,
      budgetAmount: formData.budgetAmount && !isNaN(parseFloat(formData.budgetAmount)) 
        ? parseFloat(formData.budgetAmount) 
        : undefined,
      estimatedPurchaseTime: formData.estimatedPurchaseTime,
      estimatedPurchaseAmount: formData.estimatedPurchaseAmount && !isNaN(parseFloat(formData.estimatedPurchaseAmount))
        ? parseFloat(formData.estimatedPurchaseAmount)
        : undefined
    };

    try {
        const customer = await createCustomer(newCustomer);
        
        // Sync contact info to contacts table
        try {
          await createContact(customer.id, {
            name: formData.contactPerson,
            phone: formData.phone,
            email: formData.wechat, // Use email field for wechat
            role: '主要联系人',
            decisionRole: '核心决策人',
            isKey: true,
            avatar: `https://picsum.photos/seed/${customer.id}/100/100`
          });
        } catch (contactErr: any) {
          console.error('Failed to sync contact info', contactErr);
          // If contact sync fails, we still consider the customer created but alert the user
          alert(`客户信息已保存，但联系人同步失败: ${contactErr.message || '未知错误'}`);
        }

        onSuccess();
    } catch(err: any) {
        console.error('Failed to create customer', err);
        const errorMsg = err.response?.data?.detail || err.message || '未知错误';
        alert(`保存失败: ${errorMsg}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24 max-w-md mx-auto shadow-xl">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-900">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold tracking-tight">新增客户</h1>
        </div>
        <button onClick={onBack} className="text-slate-400">
          <X size={24} />
        </button>
      </header>

      {/* Main Content */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
              <Building2 size={16} className="text-blue-600" />
              客户名称 <span className="text-red-500">*</span>
            </label>
            <input 
              required
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" 
              placeholder="请输入完整的公司名称" 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">客户等级</label>
              <div className="relative">
                <select 
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white appearance-none focus:ring-2 focus:ring-blue-600 outline-none"
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                >
                  <option value="A">A级 (核心)</option>
                  <option value="B">B级 (重点)</option>
                  <option value="C">C级 (普通)</option>
                  <option value="D">D级 (潜在)</option>
                </select>
                <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">所属行业</label>
              <div className="relative">
                <select 
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white appearance-none focus:ring-2 focus:ring-blue-600 outline-none"
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                >
                  {industries.length > 0 ? (
                    industries.map(ind => (
                      <option key={ind.value} value={ind.value}>{ind.label}</option>
                    ))
                  ) : (
                    <option value="其他">其他</option>
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">客户来源</label>
            <div className="relative">
              <select 
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white appearance-none focus:ring-2 focus:ring-blue-600 outline-none"
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value})}
              >
                {sources.length > 0 ? (
                  sources.map(src => (
                    <option key={src.value} value={src.value}>{src.label}</option>
                  ))
                ) : (
                  <option value="其他">其他</option>
                )}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={20} />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
              <User size={16} className="text-blue-600" />
              主要联系人 <span className="text-red-500">*</span>
            </label>
            <input 
              required
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" 
              placeholder="请输入联系人姓名" 
              type="text" 
              value={formData.contactPerson}
              onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
              <Phone size={16} className="text-blue-600" />
              联系电话 <span className="text-red-500">*</span>
            </label>
            <input 
              required
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" 
              placeholder="请输入联系电话" 
              type="tel" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
              <MessageCircle size={16} className="text-blue-600" />
              微信
            </label>
            <input 
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" 
              placeholder="请输入微信号" 
              type="text" 
              value={formData.wechat}
              onChange={(e) => setFormData({...formData, wechat: e.target.value})}
            />
          </div>
        </div>

        {/* Commercial Info */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">预计采购时间</label>
            <input 
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" 
              placeholder="例如：2024年Q4" 
              type="text" 
              value={formData.estimatedPurchaseTime}
              onChange={(e) => setFormData({...formData, estimatedPurchaseTime: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">预计采购金额 (元)</label>
            <input 
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" 
              placeholder="请输入预计采购金额" 
              type="number" 
              value={formData.estimatedPurchaseAmount}
              onChange={(e) => setFormData({...formData, estimatedPurchaseAmount: e.target.value})}
            />
          </div>
        </div>

        {/* Address */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
            <MapPin size={16} className="text-blue-600" />
            客户地址
          </label>
          <div className="relative">
            <textarea 
              className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" 
              placeholder="请输入详细办公地址..." 
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
            <button type="button" className="absolute right-3 bottom-3 text-blue-600 text-xs font-bold flex items-center gap-1">
              <MapPin size={12} /> 定位
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button 
            type="submit"
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Check size={20} />
            保存并创建客户
          </button>
        </div>
      </form>
    </div>
  );
}

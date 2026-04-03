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
  X,
  History
} from 'lucide-react';

import { createCustomer, createContact, getSystemSettings, searchCustomers } from './lib/data';
import { Customer } from './types';
import { useEffect, useCallback } from 'react';

interface AddCustomerProps {
  onBack: () => void;
  onSuccess: () => void;
  onSelectCustomer: (id: string) => void;
}

export default function AddCustomer({ onBack, onSuccess, onSelectCustomer }: AddCustomerProps) {
  const [formData, setFormData] = useState({
    name: '',
    industry: '行政事业单位',
    level: 'B',
    size: '',
    source: '',
    product: '',
    projectName: '' // Used when product is "项目"
  });

  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.name.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchCustomers(formData.name);
          setSuggestions(results);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.name]);

  const [industries, setIndustries] = useState<{label: string, value: string}[]>([]);
  const [sources, setSources] = useState<{label: string, value: string}[]>([]);
  const [products, setProducts] = useState<{label: string, value: string}[]>([]);
  const [levels, setLevels] = useState<{label: string, value: string}[]>([]);
  const [sizes, setSizes] = useState<{label: string, value: string}[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [indData, sourceData, productData, levelData, sizeData] = await Promise.all([
          getSystemSettings('industry'),
          getSystemSettings('customer_source'),
          getSystemSettings('product'),
          getSystemSettings('customer_level'),
          getSystemSettings('customer_size')
        ]);
        setIndustries(indData);
        setSources(sourceData);
        setProducts(productData);
        setLevels(levelData.length > 0 ? levelData : [
          {label: 'A级', value: 'A'},
          {label: 'B级', value: 'B'},
          {label: 'C级', value: 'C'},
          {label: 'D级', value: 'D'}
        ]);
        setSizes(sizeData.length > 0 ? sizeData : [
          {label: '20人以下', value: '20人以下'},
          {label: '20-99人', value: '20-99人'},
          {label: '100-499人', value: '100-499人'},
          {label: '500人以上', value: '500人以上'}
        ]);
        
        setFormData(prev => ({ 
          ...prev, 
          industry: prev.industry || (indData.length > 0 ? indData[0].value : '行政事业单位'),
          source: prev.source || (sourceData.length > 0 ? sourceData[0].value : '官网咨询'),
          product: prev.product || (productData.length > 0 ? productData[0].value : ''),
          level: prev.level || 'B',
          size: prev.size || (sizeData.length > 0 ? sizeData[0].value : '20-99人')
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
      source: formData.source,
      product: formData.product === '项目' ? formData.projectName : formData.product,
      size: formData.size,
      status: '初步拜访',
      lastFollowUp: ''
    };

    try {
        await createCustomer(newCustomer);
        onSuccess();
    } catch(err: any) {
        console.error('Failed to create customer', err);
        const errorMsg = err.response?.data?.detail || err.message || '未知错误';
        alert(`保存失败: ${errorMsg}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24 md:pb-8 max-w-2xl mx-auto md:my-12 md:min-h-0 md:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
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
          {/* 1. Customer Name */}
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
              autoComplete="off"
            />
            {/* Existing Customer Suggestions */}
            {suggestions.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mt-2 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                    <History size={14} />
                    库中已存在相似客户:
                  </span>
                  {isSearching && <div className="size-3 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>}
                </div>
                <div className="space-y-2">
                  {suggestions.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => onSelectCustomer(s.id)}
                      className="flex items-center justify-between p-2 bg-white rounded-lg border border-amber-200 hover:border-blue-600 cursor-pointer shadow-sm group transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800 truncate">{s.name}</p>
                        <p className="text-[10px] text-slate-500">{s.industry} · {s.level}级</p>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        点击查看/跟进
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Customer Level */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
              <Plus size={16} className="text-blue-600" />
              客户等级 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['A', 'B', 'C', 'D'].map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setFormData({...formData, level: l})}
                  className={`py-2 rounded-lg border font-bold text-sm transition-all ${formData.level === l ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600'}`}
                >
                  {l}级
                </button>
              ))}
            </div>
          </div>

          {/* 3. Intended Product & Project Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">意向产品</label>
            <div className="space-y-3">
              <div className="relative">
                <select 
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white appearance-none focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  value={formData.product}
                  onChange={(e) => setFormData({...formData, product: e.target.value})}
                >
                   <option value="">请选择产品</option>
                   <option value="项目">项目 (自定义填空)</option>
                  {products.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={20} />
              </div>
              
              {formData.product === '项目' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <input 
                    required
                    className="w-full h-12 px-4 rounded-xl border-2 border-blue-100 bg-blue-50/30 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium" 
                    placeholder="请输入自定义项目名称" 
                    type="text" 
                    value={formData.projectName}
                    onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 4. Customer Source & Industry */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">客户来源</label>
              <div className="relative">
                <select 
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white appearance-none focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                >
                   <option value="">请选择来源</option>
                   {sources.map(src => (
                      <option key={src.value} value={src.value}>{src.label}</option>
                   ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">所属行业</label>
              <div className="relative">
                <select 
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white appearance-none focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                >
                  <option value="">请选择行业</option>
                  {industries.map(ind => (
                    <option key={ind.value} value={ind.value}>{ind.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>
          </div>

          {/* 5. Customer Size */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">客户规模 (人数)</label>
            <div className="relative">
                <select 
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white appearance-none focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                >
                  <option value="">请选择规模</option>
                  {sizes.map(sz => (
                    <option key={sz.value} value={sz.value}>{sz.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={20} />
            </div>
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

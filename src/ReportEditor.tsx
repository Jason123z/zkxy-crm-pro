import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  ChevronDown, 
  Edit3, 
  Users, 
  Plus, 
  CalendarDays,
  Home,
  FileText,
  User,
  History,
  ChevronRight,
  X,
  Search
} from 'lucide-react';
import { cn } from './lib/utils';
import { addReport, getReports, getCustomers } from './lib/data';
import { DailyReport as ReportType, ClientProgress, Customer } from './types';

interface ReportEditorProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  onShowToast: (message: string) => void;
}

export default function ReportEditor({ onBack, onNavigate, onShowToast }: ReportEditorProps) {
  const [reportType, setReportType] = useState<'daily' | 'weekly'>('daily');
  const [view, setView] = useState<'edit' | 'history' | 'detail'>('edit');
  const [summary, setSummary] = useState('');
  const [nextPlan, setNextPlan] = useState('');
  const [history, setHistory] = useState<ReportType[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  
  // New states for customer progress
  const [clientProgress, setClientProgress] = useState<ClientProgress[]>([]);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // New states for date selection
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setHistory(await getReports());
        const data = await getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const handleAddCustomerProgress = (customer: Customer) => {
    if (clientProgress.some(cp => cp.customerId === customer.id)) {
      onShowToast('该客户已在列表中');
      return;
    }

    const newProgress: ClientProgress = {
      customerId: customer.id,
      customerName: customer.name,
      status: '跟进中',
      progress: ''
    };

    setClientProgress([...clientProgress, newProgress]);
    setShowCustomerSelector(false);
  };

  const handleRemoveCustomerProgress = (id: string) => {
    setClientProgress(clientProgress.filter(cp => cp.customerId !== id));
  };

  const handleUpdateProgress = (id: string, field: keyof ClientProgress, value: string) => {
    setClientProgress(clientProgress.map(cp => 
      cp.customerId === id ? { ...cp, [field]: value } : cp
    ));
  };

  const handleShowDetail = (report: ReportType) => {
    setSelectedReport(report);
    setView('detail');
  };

  const handleSubmit = async () => {
    if (!summary || !nextPlan) {
      onShowToast('请填写完整报表内容');
      return;
    }

    let finalDate = reportDate;
    if (reportType === 'weekly') {
      if (!startDate || !endDate) {
        onShowToast('请选择周报时间范围');
        return;
      }
      finalDate = `${startDate} 至 ${endDate}`;
    }

    const report: ReportType = {
      id: Date.now().toString(),
      type: reportType,
      date: finalDate,
      summary,
      nextPlan,
      clientProgress: clientProgress.length > 0 ? clientProgress : undefined,
      createdAt: new Date().toISOString()
    };

    try {
      const result = await addReport(report);
      if (!result) throw new Error('提交返回内容为空');
      
      setHistory(await getReports());
      onShowToast(`${reportType === 'daily' ? '日报' : '周报'}提交成功！`);
      setView('history');
      setSummary('');
      setNextPlan('');
      setClientProgress([]);
    } catch (err: any) {
      console.error('Failed to submit report:', err);
      const errorMsg = err.response?.data?.detail || err.message || '未知错误';
      onShowToast(`提交失败: ${errorMsg}`);
    }
  };

  const filteredCustomers = customers.filter(c => 
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24 max-w-md mx-auto shadow-xl">
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="flex items-center p-4 justify-between">
          <button onClick={() => view === 'detail' ? setView('history') : onBack()} className="text-slate-700 flex size-10 items-center justify-center rounded-full hover:bg-slate-100">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-slate-900 text-lg font-bold flex-1 text-center">
            {view === 'edit' ? '销售报表编辑' : view === 'history' ? '报表历史' : '报表详情'}
          </h2>
          {view !== 'detail' && (
            <button 
              onClick={() => setView(view === 'edit' ? 'history' : 'edit')} 
              className="text-blue-600 font-semibold text-sm px-2 flex items-center gap-1"
            >
              {view === 'edit' ? <History size={18} /> : <Edit3 size={18} />}
              {view === 'edit' ? '历史' : '写报表'}
            </button>
          )}
        </div>
        
        {view === 'edit' && (
          <div className="flex px-4">
            <button 
              onClick={() => setReportType('daily')}
              className={cn(
                "flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 flex-1 transition-all",
                reportType === 'daily' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"
              )}
            >
              <span className="text-sm font-bold tracking-wide">日报</span>
            </button>
            <button 
              onClick={() => setReportType('weekly')}
              className={cn(
                "flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 flex-1 transition-all",
                reportType === 'weekly' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"
              )}
            >
              <span className="text-sm font-bold tracking-wide">周报</span>
            </button>
          </div>
        )}
      </div>

      {view === 'edit' ? (
        <div className="flex flex-col gap-6 p-4">
          {/* Date Picker Section */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex flex-col w-full">
              <p className="text-slate-700 text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-blue-600" />
                {reportType === 'daily' ? '选择日期' : '选择周报周期'}
              </p>
              
              {reportType === 'daily' ? (
                <div className="relative">
                  <input 
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 h-12 px-4 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 rounded-lg border-slate-200 bg-slate-50 text-slate-900 h-12 px-3 text-sm focus:ring-blue-600 focus:border-blue-600 outline-none"
                  />
                  <span className="text-slate-400">至</span>
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1 rounded-lg border-slate-200 bg-slate-50 text-slate-900 h-12 px-3 text-sm focus:ring-blue-600 focus:border-blue-600 outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Work Summary */}
          <div className="flex flex-col gap-2">
            <h3 className="text-slate-900 text-base font-bold flex items-center gap-2 px-1">
              <Edit3 className="text-blue-600" size={18} />
              工作总结
            </h3>
            <textarea 
              className="w-full min-h-[120px] rounded-xl border-slate-200 bg-white p-4 text-slate-900 placeholder:text-slate-400 focus:ring-blue-600 focus:border-blue-600 shadow-sm outline-none" 
              placeholder={reportType === 'daily' ? "请输入今日工作内容、完成情况及感悟..." : "请输入本周工作内容、完成情况及感悟..."}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          {/* Key Client Progress */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-slate-900 text-base font-bold flex items-center gap-2">
                <Users className="text-blue-600" size={18} />
                核心客户进展
              </h3>
              <button 
                onClick={() => setShowCustomerSelector(true)}
                className="text-blue-600 text-sm flex items-center font-medium gap-1"
              >
                <Plus size={16} /> 选择客户
              </button>
            </div>
            <div className="space-y-3">
              {clientProgress.length === 0 ? (
                <div className="p-8 bg-white rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                  <Users size={32} className="mb-2 opacity-20" />
                  <p className="text-xs">暂未添加核心客户进展</p>
                </div>
              ) : (
                clientProgress.map((cp) => (
                  <div key={cp.customerId} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm relative">
                    <button 
                      onClick={() => handleRemoveCustomerProgress(cp.customerId)}
                      className="absolute top-2 right-2 text-slate-300 hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-slate-900">{cp.customerName}</span>
                      <select 
                        value={cp.status}
                        onChange={(e) => handleUpdateProgress(cp.customerId, 'status', e.target.value)}
                        className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] rounded-full font-bold border-none outline-none appearance-none"
                      >
                        <option value="高意向">高意向</option>
                        <option value="跟进中">跟进中</option>
                        <option value="已签约">已签约</option>
                        <option value="流失">流失</option>
                      </select>
                    </div>
                    <textarea 
                      className="w-full text-sm text-slate-600 bg-slate-50 rounded-lg p-2 border-none focus:ring-1 focus:ring-blue-100 outline-none"
                      placeholder="请输入该客户的最新进展..."
                      rows={2}
                      value={cp.progress}
                      onChange={(e) => handleUpdateProgress(cp.customerId, 'progress', e.target.value)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Next Plan */}
          <div className="flex flex-col gap-2">
            <h3 className="text-slate-900 text-base font-bold flex items-center gap-2 px-1">
              <CalendarDays className="text-blue-600" size={18} />
              后续计划
            </h3>
            <textarea 
              className="w-full min-h-[100px] rounded-xl border-slate-200 bg-white p-4 text-slate-900 placeholder:text-slate-400 focus:ring-blue-600 focus:border-blue-600 shadow-sm outline-none" 
              placeholder="请输入下一步工作重点和目标..."
              value={nextPlan}
              onChange={(e) => setNextPlan(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 pb-8">
            <button 
              onClick={handleSubmit}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all"
            >
              提交报表
            </button>
          </div>
        </div>
      ) : view === 'detail' && selectedReport ? (
        <div className="flex flex-col gap-6 p-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-3 py-1 text-xs font-bold rounded-full",
                  selectedReport.type === 'daily' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                )}>
                  {selectedReport.type === 'daily' ? '日报' : '周报'}
                </span>
                <span className="text-slate-900 font-bold text-lg">{selectedReport.date}</span>
              </div>
              <span className="text-slate-400 text-xs">{selectedReport.createdAt && !isNaN(new Date(selectedReport.createdAt).valueOf()) ? new Date(selectedReport.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '未知时间'}</span>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-slate-900 text-base font-bold flex items-center gap-2">
                  <Edit3 className="text-blue-600" size={18} />
                  工作总结
                </h3>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedReport.summary}</p>
                </div>
              </div>

              {selectedReport.clientProgress && selectedReport.clientProgress.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-slate-900 text-base font-bold flex items-center gap-2">
                    <Users className="text-blue-600" size={18} />
                    核心客户进展
                  </h3>
                  <div className="space-y-3">
                    {selectedReport.clientProgress.map((cp) => (
                      <div key={cp.customerId} className="bg-slate-50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-slate-900 text-sm">{cp.customerName}</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] rounded-full font-bold">{cp.status}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{cp.progress || '暂无详细进展描述'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <h3 className="text-slate-900 text-base font-bold flex items-center gap-2">
                  <CalendarDays className="text-blue-600" size={18} />
                  后续计划
                </h3>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedReport.nextPlan}</p>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setView('history')}
            className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-xl active:scale-[0.98] transition-all"
          >
            返回历史
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <FileText size={48} className="mb-4 opacity-20" />
              <p>暂无提交历史</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-0.5 text-[10px] font-bold rounded-full",
                      item.type === 'daily' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                    )}>
                      {item.type === 'daily' ? '日报' : '周报'}
                    </span>
                    <span className="text-slate-900 font-bold text-sm">{item.date}</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">{item.createdAt && !isNaN(new Date(item.createdAt).valueOf()) ? new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '未知时间'}</span>
                </div>
                <div className="space-y-2">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">{item.summary}</p>
                  </div>
                  {item.clientProgress && item.clientProgress.length > 0 && (
                    <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                      {item.clientProgress.map(cp => (
                        <span key={cp.customerId} className="whitespace-nowrap px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] rounded-md">
                          {cp.customerName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => handleShowDetail(item)}
                  className="w-full mt-3 pt-3 border-t border-slate-50 text-blue-600 text-xs font-bold flex items-center justify-center gap-1"
                >
                  查看详情 <ChevronRight size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Customer Selector Modal */}
      {showCustomerSelector && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">选择核心客户</h3>
              <button onClick={() => setShowCustomerSelector(false)} className="text-slate-400 p-1">
                <X size={24} />
              </button>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="搜索客户名称..."
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="max-h-[40vh] overflow-y-auto space-y-2 mb-6">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">未找到匹配客户</div>
              ) : (
                filteredCustomers.map(customer => (
                  <button 
                    key={customer.id}
                    onClick={() => handleAddCustomerProgress(customer)}
                    className="w-full p-4 flex justify-between items-center bg-slate-50 hover:bg-blue-50 rounded-xl transition-colors text-left"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{customer.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{customer.industry} | {customer.contactPerson}</p>
                    </div>
                    <Plus size={18} className="text-blue-600" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-md border-t border-slate-200">
        <div className="grid grid-cols-4 w-full h-16">
          <button onClick={() => onNavigate('dashboard')} className="flex flex-col items-center justify-center gap-1 text-slate-400">
            <Home size={20} />
            <span className="text-[10px] font-medium">首页</span>
          </button>
          <button onClick={() => onNavigate('customers')} className="flex flex-col items-center justify-center gap-1 text-slate-400">
            <Users size={20} />
            <span className="text-[10px] font-medium">客户</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-blue-600">
            <FileText size={20} />
            <span className="text-[10px] font-bold">日报</span>
          </button>
          <button onClick={() => onNavigate('profile')} className="flex flex-col items-center justify-center gap-1 text-slate-400">
            <User size={20} />
            <span className="text-[10px] font-medium">我的</span>
          </button>
        </div>
      </div>
    </div>
  );
}

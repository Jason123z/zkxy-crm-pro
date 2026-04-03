import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  ChevronRight,
  Search,
  CheckCircle2,
  Circle,
  X
} from 'lucide-react';
import { getVisitPlans, addVisitPlan, updateVisitPlan, getCustomers } from './lib/data';
import { VisitPlan as VisitPlanType } from './types';

interface VisitPlanProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  onShowToast: (message: string) => void;
}

export default function VisitPlan({ onBack, onNavigate, onShowToast }: VisitPlanProps) {
  const [plans, setPlans] = useState<VisitPlanType[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    customer: '',
    time: '09:00',
    date: new Date().toISOString().split('T')[0],
    type: '日常拜访'
  });

  useEffect(() => {
    const fetchPlans = async () => {
      setPlans(await getVisitPlans());
      setCustomers(await getCustomers());
    };
    fetchPlans();
  }, []);

  const toggleComplete = async (id: string) => {
    const plan = plans.find(p => p.id === id);
    if (!plan) return;
    const updatedPlan = { ...plan, completed: !plan.completed };
    await updateVisitPlan(updatedPlan);
    setPlans(await getVisitPlans());
    if (updatedPlan.completed) {
      onShowToast('任务已标记为完成！');
    }
  };

  const handleAddPlan = async () => {
    if (!newPlan.customer) {
      onShowToast('请选择客户');
      return;
    }
    const plan: VisitPlanType = {
      id: Date.now().toString(),
      customer: newPlan.customer,
      time: newPlan.time,
      date: newPlan.date,
      type: newPlan.type,
      completed: false,
      address: '上海市...'
    };
    await addVisitPlan(plan);
    setPlans(await getVisitPlans());
    setShowAddModal(false);
    onShowToast('拜访计划添加成功');
  };

  const handleCompleteAll = async () => {
    const filteredPlans = plans.filter(p => p.date === selectedDate);
    for (const p of filteredPlans) {
      if (!p.completed) {
        await updateVisitPlan({ ...p, completed: true });
      }
    }
    setPlans(await getVisitPlans());
    onShowToast('今日任务已全部完成！');
  };


  // Generate week dates
  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    // Start from 3 days ago to 3 days later
    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      dates.push({
        full: d.toISOString().split('T')[0],
        day: d.getDate().toString(),
        weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
      });
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const filteredPlans = plans.filter(p => p.date === selectedDate);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24 md:pb-8 max-w-2xl mx-auto md:my-12 md:min-h-0 md:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-slate-900 flex size-10 items-center justify-center rounded-lg hover:bg-slate-100">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold tracking-tight">拜访计划</h1>
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white p-2 rounded-lg shadow-lg shadow-blue-600/20 active:scale-95 transition-transform">
            <Plus size={20} />
          </button>
        </div>
        {/* Date Selector */}
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar px-1">
          {weekDates.map((dateObj) => (
            <button 
              key={dateObj.full} 
              onClick={() => setSelectedDate(dateObj.full)}
              className={`flex flex-col items-center min-w-[50px] py-2 rounded-xl transition-all ${selectedDate === dateObj.full ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              <span className="text-[10px] font-bold uppercase">{dateObj.weekday}</span>
              <span className="text-lg font-bold">{dateObj.day}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-slate-900 font-bold">
            {selectedDate === new Date().toISOString().split('T')[0] ? '今日任务' : '当日任务'} 
            ({filteredPlans.filter(p => !p.completed).length})
          </h2>
          {filteredPlans.length > 0 && (
            <button onClick={handleCompleteAll} className="text-blue-600 text-xs font-bold px-2 py-1 rounded-lg hover:bg-blue-50">全部完成</button>
          )}
        </div>

        {filteredPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Calendar size={48} className="mb-4 opacity-20" />
            <p>该日期暂无拜访计划</p>
          </div>
        ) : (
          filteredPlans.map((plan) => (
            <div 
              key={plan.id}
              className={`bg-white rounded-2xl p-4 border border-slate-100 shadow-sm transition-all ${plan.completed ? 'opacity-60' : ''}`}
            >
              <div className="flex gap-4">
                <button 
                  onClick={() => toggleComplete(plan.id)}
                  className={`mt-1 flex-shrink-0 transition-colors ${plan.completed ? 'text-emerald-500' : 'text-slate-300'}`}
                >
                  {plan.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold text-slate-900 ${plan.completed ? 'line-through' : ''}`}>{plan.customer}</h3>
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">{plan.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <div className="flex items-center gap-1 text-slate-500 text-[10px] font-medium">
                      <Clock size={12} />
                      <span>{plan.time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-[10px] font-medium">
                      <MapPin size={12} />
                      <span>{plan.address || '上海市...'}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => onShowToast('查看详情功能开发中...')} className="text-slate-300 hover:text-slate-500">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ))
        )}

        <button onClick={() => setShowAddModal(true)} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:border-blue-600 hover:text-blue-600 transition-all">
          <Plus size={20} />
          添加新的拜访计划
        </button>
      </main>

      {/* Add Plan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">新建拜访计划</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">选择客户</label>
                  <select 
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-600 outline-none"
                    value={newPlan.customer}
                    onChange={(e) => setNewPlan({...newPlan, customer: e.target.value})}
                  >
                    <option value="">请选择客户</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">日期</label>
                    <input 
                      type="date" 
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-600 outline-none"
                      value={newPlan.date}
                      onChange={(e) => setNewPlan({...newPlan, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">时间</label>
                    <input 
                      type="time" 
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-600 outline-none"
                      value={newPlan.time}
                      onChange={(e) => setNewPlan({...newPlan, time: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">拜访类型</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['日常拜访', '商务洽谈', '技术支持'].map(type => (
                      <button
                        key={type}
                        onClick={() => setNewPlan({...newPlan, type})}
                        className={`py-2 text-xs font-bold rounded-lg border-2 transition-all ${newPlan.type === type ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-500'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleAddPlan}
                  className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                >
                  确认添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  ChevronRight, 
  Calendar, 
  CheckCircle2, 
  Circle,
  Clock,
  User,
  Layout
} from 'lucide-react';
import { cn } from './lib/utils';
import { getAllTasks } from './lib/data';
import BottomNav from './components/BottomNav';

interface TaskListProps {
  onBack: () => void;
  onSelectTask: (customerId: string, projectId?: string) => void;
  onNavigate: (page: any) => void;
}

export default function TaskList({ onBack, onSelectTask, onNavigate }: TaskListProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getAllTasks();
        setTasks(data);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24 md:pb-8 max-w-2xl mx-auto md:my-12 md:min-h-0 md:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <header className="bg-white px-4 pt-4 pb-2 sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-slate-900">所有待办汇总</h1>
        </div>

        {/* Search */}
        <div className="relative flex items-center h-10 w-full bg-slate-100 rounded-lg px-3 mb-3">
          <Search className="text-slate-400 mr-2" size={16} />
          <input 
            className="bg-transparent border-none outline-none w-full text-sm" 
            placeholder="搜索任务或客户"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 pb-2">
          {['all', 'pending', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f as any)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                statusFilter === f 
                  ? "bg-blue-600 text-white" 
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}
            >
              {f === 'all' ? '全部' : f === 'pending' ? '进行中' : '已完成'}
            </button>
          ))}
        </div>
      </header>

      {/* List */}
      <main className="flex-1 p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-sm text-slate-400">加载中...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Calendar size={48} className="mb-4 opacity-20" />
            <p className="text-sm">暂无匹配的待办事项</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div 
                key={task.id}
                className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
                onClick={() => {
                  if (task.customerId) {
                    onSelectTask(task.customerId, task.projectId);
                  }
                }}
              >
                <div className="shrink-0">
                  {task.status === 'completed' ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 size={14} />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-300">
                      <Circle size={14} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={cn(
                      "text-sm font-bold text-slate-900 truncate",
                      task.status === 'completed' && "line-through text-slate-400"
                    )}>
                      {task.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <User size={12} />
                      <span>{task.customer?.name || '个人'}</span>
                    </div>
                    {task.projectId && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Layout size={12} />
                        <span>项目任务</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock size={12} />
                      <span>{task.deadline}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="text-slate-300" size={16} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <BottomNav currentPage="dashboard" onNavigate={onNavigate} />
    </div>
  );
}

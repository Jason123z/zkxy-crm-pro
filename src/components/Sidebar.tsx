import React from 'react';
import { Home, Users, FileText, User, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { NavPage } from './BottomNav';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: any) => void;
  userName: string;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: '首页', icon: Home },
  { id: 'customers', label: '客户管理', icon: Users },
  { id: 'report', label: '工作日报', icon: FileText },
  { id: 'profile', label: '个人中心', icon: User },
];

export default function Sidebar({ currentPage, onNavigate, userName }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-slate-200 shrink-0">
      <div className="p-6 border-b border-slate-50">
        <h1 className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          ZKXY CRM
        </h1>
        <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-1 uppercase">Sales Edition</p>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon size={20} className={cn(isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
              <span className="font-bold flex-1 text-left">{item.label}</span>
              {isActive && <ChevronRight size={16} className="text-white/70" />}
            </button>
          );
        })}
      </div>

      <div className="p-4 mt-auto border-t border-slate-50">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <User size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
            <p className="text-[10px] text-slate-500 font-medium capitalize">Sales Professional</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

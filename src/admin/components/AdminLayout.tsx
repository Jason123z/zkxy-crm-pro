import React, { ReactNode } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  LogOut, 
  BarChart2,
  Users, 
  FileText,
  Settings
} from 'lucide-react';
import { AdminPage } from '../types';

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
}

export default function AdminLayout({ children, currentPage, onNavigate, onLogout }: AdminLayoutProps) {
  const handleLogout = async () => {
    onLogout();
  };


  const navItems = [
    { id: 'overview' as const, label: '大屏展板', icon: BarChart2 },
    { id: 'customers' as const, label: '全员客户', icon: Users },
    { id: 'reports' as const, label: '工作汇总', icon: FileText },
    { id: 'settings' as const, label: '系统维护', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col hidden md:flex shrink-0">
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            控制台管理
          </h1>
          <p className="text-xs text-slate-400 mt-1">全局数据总览</p>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors
                  ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <Icon size={20} className={active ? 'text-blue-200' : ''} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-white w-full px-4 py-2 rounded-md hover:bg-slate-800 transition"
          >
            <LogOut size={18} />
            <span>退出系统</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header (simplified for admin, assuming mostly PC) */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
        <h1 className="text-lg font-bold">控制台管理</h1>
        <div className="flex gap-2 text-sm overflow-x-auto">
           {navItems.map(item => (
             <button
               key={item.id}
               onClick={() => onNavigate(item.id)}
               className={`px-3 py-1 rounded-full whitespace-nowrap ${currentPage === item.id ? 'bg-blue-600' : 'bg-slate-800'}`}
             >
               {item.label}
             </button>
           ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50/50 p-6 relative">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}

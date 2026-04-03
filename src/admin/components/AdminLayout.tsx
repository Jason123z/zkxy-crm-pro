import React, { ReactNode, useState } from 'react';
import { 
  LogOut, 
  BarChart2,
  Users, 
  FileText,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { AdminPage } from '../types';

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
}

export default function AdminLayout({ children, currentPage, onNavigate, onLogout }: AdminLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    onLogout();
  };


  const navItems = [
    { id: 'overview' as const, label: '大屏展板', icon: BarChart2 },
    { id: 'management' as const, label: '客户管理', icon: Users },
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

      {/* Mobile Header */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shrink-0 shadow-lg">
        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">控制台管理</h1>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          <aside className="fixed top-0 right-0 bottom-0 w-72 bg-slate-900 text-white z-50 md:hidden animate-in slide-in-from-right duration-300 shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="font-bold">功能导航</h2>
              <button onClick={() => setIsMenuOpen(false)} className="text-slate-400"><X size={20} /></button>
            </div>
            <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
              {navItems.map(item => {
                const Icon = item.icon;
                const active = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-6 py-4 transition-all
                      ${active ? 'bg-blue-600 text-white border-l-4 border-blue-300' : 'text-slate-400 hover:text-white hover:bg-slate-800 border-l-4 border-transparent'}`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-6 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 w-full font-medium"
              >
                <LogOut size={18} />
                <span>退出登录</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50/50 p-6 relative">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}

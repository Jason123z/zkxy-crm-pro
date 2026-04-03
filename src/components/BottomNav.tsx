import React from 'react';
import { Home, Users, FileText, User } from 'lucide-react';
import { cn } from '../lib/utils';

export type NavPage = 'dashboard' | 'customers' | 'report' | 'profile';

interface BottomNavProps {
  currentPage: NavPage;
  onNavigate: (page: any) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: '首页', icon: Home },
  { id: 'customers', label: '客户', icon: Users },
  { id: 'report', label: '日报', icon: FileText },
  { id: 'profile', label: '我的', icon: User },
];

export default function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white/90 backdrop-blur-md px-4 pb-6 pt-2 md:hidden">
      <div className="flex gap-2 max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-1 flex-col items-center justify-end gap-1 transition-all duration-200 active:scale-90",
                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon 
                size={24} 
                className={cn(
                  "transition-transform duration-200",
                  isActive && "scale-110"
                )} 
              />
              <p className={cn(
                "text-[10px] transition-all duration-200",
                isActive ? "font-bold" : "font-medium"
              )}>
                {item.label}
              </p>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

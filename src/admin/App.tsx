import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

// 我们会在后面实现具体的页面组件
import AdminLayout from './components/AdminLayout';
import OverviewScreen from './pages/OverviewScreen';
import AllCustomers from './pages/AllCustomers';
import AllReports from './pages/AllReports';
import AdminLogin from './components/AdminLogin';
import CustomerDetail from './pages/CustomerDetail';
import SystemMaintenance from './pages/SystemMaintenance';
import { AdminPage } from './types';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // 优先从环境变量/缓存判断是否曾登录过，但会通过 profile 进行最终验证
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('admin_session_active') === 'true';
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // 进一步校验角色
        checkAdminRole(session.user.id);
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkAdminRole(session.user.id);
      } else {
        setIsAdminLoggedIn(false);
        localStorage.removeItem('admin_session_active');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (data?.role === 'admin') {
        setIsAdminLoggedIn(true);
        localStorage.setItem('admin_session_active', 'true');
      } else {
        setIsAdminLoggedIn(false);
        localStorage.removeItem('admin_session_active');
      }
    } catch (err) {
      console.error('Role check error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const [currentPage, setCurrentPage] = useState<AdminPage>(() => {
    const saved = localStorage.getItem('admin_current_page');
    return (saved as AdminPage) || 'overview';
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerFilter, setCustomerFilter] = useState<string>('all');

  useEffect(() => {
    localStorage.setItem('admin_current_page', currentPage);
  }, [currentPage]);

  const handleAdminLogin = (username: string) => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('admin_session_active', 'true');
  };

  const handleLogout = async () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('admin_session_active');
    // 如果有 Supabase session 也一并清除
    await supabase.auth.signOut();
    // 强制刷新状态
    window.location.reload();
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewScreen onNavigate={(page, filter) => {
          if (filter) setCustomerFilter(filter);
          setCurrentPage(page as AdminPage);
        }} />;
      case 'customers':
        console.log("Rendering AllCustomers page");
        return <AllCustomers 
          initialFilter={customerFilter} 
          onSelectCustomer={(id) => {
            console.log("Customer selected in App:", id);
            setSelectedCustomerId(id);
            setCurrentPage('customer-detail');
          }} 
        />;
      case 'reports':
        return <AllReports />;
      case 'customer-detail':
        console.log("Rendering CustomerDetail page for ID:", selectedCustomerId);
        return <CustomerDetail 
          customerId={selectedCustomerId || ''} 
          onBack={() => setCurrentPage('customers')} 
        />;
      case 'settings':
        return <SystemMaintenance />;
      default:
        return <OverviewScreen onNavigate={(page) => setCurrentPage(page as AdminPage)} />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 优先展示管理员专用登录页 (admin/123456)
  if (!isAdminLoggedIn) {
    return <AdminLogin onLogin={handleAdminLogin} />;
  }

  return (
    <AdminLayout currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout}>
      {renderPage()}
    </AdminLayout>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { api, getAuthToken, removeAuthToken } from '../lib/api';

// 我们会在后面实现具体的页面组件
import AdminLayout from './components/AdminLayout';
import OverviewScreen from './pages/OverviewScreen';
import AllCustomers from './pages/AllCustomers';
import AllReports from './pages/AllReports';
import AdminLogin from './components/AdminLogin';
import CustomerDetail from './pages/CustomerDetail';
import SystemMaintenance from './pages/SystemMaintenance';
import CustomerManagement from './pages/CustomerManagement';
import { AdminPage } from './types';

export default function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const checkAdminRole = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setIsAdminLoggedIn(false);
      setAuthLoading(false);
      return;
    }

    try {
      const data = await api.get('/auth/me');
      if (data && data.role === 'admin') {
        setIsAdminLoggedIn(true);
      } else {
        setIsAdminLoggedIn(false);
        removeAuthToken();
      }
    } catch (err) {
      console.error('Role check error:', err);
      setIsAdminLoggedIn(false);
      removeAuthToken();
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAdminRole();
  }, [checkAdminRole]);

  const [currentPage, setCurrentPage] = useState<AdminPage>(() => {
    const saved = sessionStorage.getItem('crm_admin_current_page');
    return (saved as AdminPage) || 'overview';
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerFilter, setCustomerFilter] = useState<string>('all');

  useEffect(() => {
    sessionStorage.setItem('crm_admin_current_page', currentPage);
  }, [currentPage]);

  const handleAdminLogin = () => {
    // 登录组件已经处理了 token 存储，这里只需要重新检查角色
    checkAdminRole();
  };

  const handleLogout = async () => {
    setIsAdminLoggedIn(false);
    removeAuthToken();
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
        return <AllCustomers 
          initialFilter={customerFilter} 
          onSelectCustomer={(id) => {
            setSelectedCustomerId(id);
            setCurrentPage('customer-detail');
          }} 
        />;
      case 'reports':
        return <AllReports />;
      case 'customer-detail':
        return <CustomerDetail 
          customerId={selectedCustomerId || ''} 
          onBack={() => setCurrentPage('customers')} 
        />;
      case 'settings':
        return <SystemMaintenance />;
      case 'management':
        return <CustomerManagement />;
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

  // 优先展示管理员专用登录页
  if (!isAdminLoggedIn) {
    return <AdminLogin onLogin={handleAdminLogin} />;
  }

  return (
    <AdminLayout currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout}>
      {renderPage()}
    </AdminLayout>
  );
}

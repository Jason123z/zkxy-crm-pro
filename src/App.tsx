import React, { useState, useCallback, useEffect } from 'react';
import Dashboard from './Dashboard';
import CustomerList from './CustomerList';
import CustomerDetails from './CustomerDetails';
import ReportEditor from './ReportEditor';
import Profile from './Profile';
import CheckIn from './CheckIn';
import VisitPlan from './VisitPlan';
import AddCustomer from './AddCustomer';
import AuthPage from './AuthPage';
import TaskList from './TaskList';
import Toast, { ToastType } from './components/Toast';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

// 定义页面类型
type Page = 'login' | 'dashboard' | 'customers' | 'customer-details' | 'report' | 'profile' | 'checkin' | 'visit-plan' | 'add-customer' | 'all-tasks';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // 获取当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // 监听状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 从 localStorage 加载初始状态
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const saved = localStorage.getItem('crm_current_page');
    return (saved as Page) || 'dashboard';
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(() => {
    return localStorage.getItem('crm_selected_customer_id');
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
    return localStorage.getItem('crm_selected_project_id');
  });

  // 当页面或选中客户变化时，保存到 localStorage
  useEffect(() => {
    localStorage.setItem('crm_current_page', currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (selectedCustomerId) {
      localStorage.setItem('crm_selected_customer_id', selectedCustomerId);
    } else {
      localStorage.removeItem('crm_selected_customer_id');
    }
  }, [selectedCustomerId]);

  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('crm_selected_project_id', selectedProjectId);
    } else {
      localStorage.removeItem('crm_selected_project_id');
    }
  }, [selectedProjectId]);

  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true });
  }, []);

  // 纯内存导航，不触发任何浏览器存储操作，不使用 window.scrollTo
  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const handleSelectCustomer = useCallback((id: string, projectId?: string) => {
    setSelectedCustomerId(id);
    setSelectedProjectId(projectId || null);
    setCurrentPage('customer-details');
  }, []);

  const handleBackToDashboard = useCallback(() => navigateTo('dashboard'), [navigateTo]);
  const handleBackToCustomers = useCallback(() => navigateTo('customers'), [navigateTo]);
  const handleAddCustomerSuccess = useCallback(() => {
    navigateTo('customers');
    showToast('添加成功');
  }, [navigateTo, showToast]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} onShowToast={showToast} onSelectTask={handleSelectCustomer} />;
      case 'customers':
        return (
          <CustomerList 
            onBack={handleBackToDashboard} 
            onSelectCustomer={handleSelectCustomer}
            onNavigate={navigateTo}
            onShowToast={showToast}
          />
        );
      case 'customer-details':
        return (
          <CustomerDetails 
            customerId={selectedCustomerId} 
            initialProjectId={selectedProjectId}
            onBack={handleBackToCustomers} 
            onShowToast={showToast} 
          />
        );
      case 'report':
        return <ReportEditor onBack={handleBackToDashboard} onNavigate={navigateTo} onShowToast={showToast} />;
      case 'profile':
        return <Profile onNavigate={navigateTo} onShowToast={showToast} />;
      case 'checkin':
        return <CheckIn onBack={handleBackToDashboard} onNavigate={navigateTo} onShowToast={showToast} />;
      case 'visit-plan':
        return <VisitPlan onBack={handleBackToDashboard} onNavigate={navigateTo} onShowToast={showToast} />;
      case 'add-customer':
        return (
          <AddCustomer 
            onBack={handleBackToCustomers} 
            onSuccess={handleAddCustomerSuccess} 
          />
        );
      case 'all-tasks':
        return (
          <TaskList 
            onBack={handleBackToDashboard}
            onSelectTask={handleSelectCustomer}
            onNavigate={navigateTo}
          />
        );
      default:
        return <Dashboard onNavigate={navigateTo} onShowToast={showToast} />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage onLoginSuccess={() => navigateTo('dashboard')} onShowToast={showToast} />;
  }

  return (
    <div className="app-container">
      {renderPage()}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />
    </div>
  );
}

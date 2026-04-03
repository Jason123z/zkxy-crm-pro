import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Star, 
  Mail, 
  Bell, 
  User, 
  Shield, 
  Headset, 
  Info, 
  LogOut, 
  ChevronRight,
  Home,
  Users,
  FileText,
  X,
  Camera
} from 'lucide-react';
import BottomNav from './components/BottomNav';
import { cn } from './lib/utils';
import { getUserProfile, updateUserProfile, getAllTasks, DEFAULT_USER } from './lib/data';
import { removeAuthToken } from './lib/api';
import { UserProfile, Task } from './types';
import Modal from './components/Modal';
interface ProfileProps {
  onNavigate: (page: string) => void;
  onShowToast: (message: string) => void;
  onLogout: () => void;
}

export default function Profile({ onNavigate, onShowToast, onLogout }: ProfileProps) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile>(user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await getUserProfile();
        setUser(profile);
        setEditForm(profile);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      removeAuthToken();
      // Remove other session keys
      sessionStorage.removeItem('crm_sales_current_page');
      sessionStorage.removeItem('crm_sales_selected_customer_id');
      sessionStorage.removeItem('crm_sales_selected_project_id');
      
      onShowToast('已退出登录');
      onLogout();
    } catch (error: any) {
      onShowToast('退出失败');
    }
  };

  const handleToolClick = (name: string) => {
    onShowToast(`${name}功能开发中...`);
  };

  const handleEditProfile = () => {
    setEditForm(user);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      onShowToast('姓名不能为空');
      return;
    }

    try {
      // 调用新的异步更新函数（内部已处理 DB 和 Auth 同步）
      await updateUserProfile(editForm);
      setUser(editForm);
      setIsEditModalOpen(false);
      onShowToast('个人资料已成功保存并同步');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      onShowToast(`保存失败: ${err.message || '未知错误'}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full max-w-2xl mx-auto bg-white md:my-12 md:min-h-0 md:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden pb-24 md:pb-8">
      {/* Header Section */}
      <header className="relative p-6 bg-gradient-to-br from-blue-50 via-blue-50/50 to-transparent">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold tracking-tight">个人中心</h1>
          <button onClick={() => handleToolClick('设置')} className="p-2 rounded-full hover:bg-white/50 transition-colors">
            <Settings className="text-slate-600" size={20} />
          </button>
        </div>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-white shadow-lg overflow-hidden bg-slate-200">
              <img 
                alt="Profile Avatar" 
                className="w-full h-full object-cover" 
                src={user.avatar} 
              />
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
              <button 
                onClick={handleEditProfile}
                className="text-xs text-blue-600 font-bold px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                编辑
              </button>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-medium text-sm">{user.role}</span>
                {user.department && (
                  <span className="text-slate-400 text-xs px-1.5 py-0.5 bg-slate-100 rounded">
                    {user.department}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-xs mt-1">
                <span>工号: {user.employeeId}</span>
                {user.phone && <span>{user.phone}</span>}
              </div>
              {user.email && <span className="text-slate-400 text-[10px]">{user.email}</span>}
            </div>
          </div>
        </div>
      </header>

      {/* Statistics Row */}
      <div className="px-4 -mt-4">
        <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] text-slate-500 mb-1">本月销售额</span>
            <span className="text-base font-bold text-slate-900">¥128.4k</span>
            <span className="text-[10px] text-green-600 font-bold">+12.5%</span>
          </div>
          <div className="flex flex-col items-center text-center border-x border-slate-100">
            <span className="text-[10px] text-slate-500 mb-1">拜访完成率</span>
            <span className="text-base font-bold text-slate-900">92%</span>
            <span className="text-[10px] text-green-600 font-bold">+5.4%</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] text-slate-500 mb-1">新增客户</span>
            <span className="text-base font-bold text-slate-900">45</span>
            <span className="text-[10px] text-green-600 font-bold">+8.2%</span>
          </div>
        </div>
      </div>

      {/* Quick Tools */}
      <section className="mt-8 px-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-1">常用工具</h3>
        <div className="grid grid-cols-3 gap-4">
          <button onClick={() => handleToolClick('我的收藏')} className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-blue-50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
              <Star className="text-orange-500" size={20} />
            </div>
            <span className="text-xs font-medium">我的收藏</span>
          </button>
          <button onClick={() => handleToolClick('草稿箱')} className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-blue-50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Mail className="text-blue-500" size={20} />
            </div>
            <span className="text-xs font-medium">草稿箱</span>
          </button>
          <button onClick={() => handleToolClick('待办提醒')} className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-blue-50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Bell className="text-purple-500" size={20} />
            </div>
            <span className="text-xs font-medium">待办提醒</span>
          </button>
        </div>
      </section>



      {/* Main Menu */}
      <section className="mt-8 px-4">
        <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
          <button onClick={handleEditProfile} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <User className="text-indigo-500" size={18} />
              </div>
              <span className="font-medium text-slate-700">个人资料</span>
            </div>
            <ChevronRight className="text-slate-300" size={18} />
          </button>
          <button onClick={() => handleToolClick('安全中心')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <Shield className="text-red-500" size={18} />
              </div>
              <span className="font-medium text-slate-700">安全中心</span>
            </div>
            <ChevronRight className="text-slate-300" size={18} />
          </button>
          <button onClick={() => handleToolClick('消息设置')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <Bell className="text-teal-500" size={18} />
              </div>
              <span className="font-medium text-slate-700">消息设置</span>
            </div>
            <ChevronRight className="text-slate-300" size={18} />
          </button>
          <button onClick={() => handleToolClick('在线客服')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Headset className="text-amber-500" size={18} />
              </div>
              <span className="font-medium text-slate-700">在线客服</span>
            </div>
            <ChevronRight className="text-slate-300" size={18} />
          </button>
          <button onClick={() => handleToolClick('关于我们')} className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Info className="text-slate-500" size={18} />
              </div>
              <span className="font-medium text-slate-700">关于我们</span>
            </div>
            <ChevronRight className="text-slate-300" size={18} />
          </button>
        </div>
      </section>

      {/* Logout Action */}
      <div className="mt-8 px-4">
        <button onClick={handleLogout} className="w-full py-4 text-red-500 font-bold bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center justify-center gap-2">
          <LogOut size={20} />
          退出登录
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNav currentPage="profile" onNavigate={onNavigate} />

      {/* Edit Profile Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title="编辑个人资料"
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-50 bg-slate-100">
                <img src={editForm.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
              </div>
              <button 
                onClick={() => onShowToast('头像修改功能开发中...')}
                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              >
                <Camera size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-400">点击图标更换头像</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">姓名</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 outline-none"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                placeholder="请输入姓名"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">职位</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 outline-none"
                value={editForm.role}
                onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                placeholder="请输入职位"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">部门</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 outline-none"
                value={editForm.department || ''}
                onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                placeholder="请输入部门"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">工号</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 outline-none"
                value={editForm.employeeId}
                onChange={(e) => setEditForm({...editForm, employeeId: e.target.value})}
                placeholder="请输入工号"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">手机号</label>
              <input 
                type="tel" 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 outline-none"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                placeholder="请输入手机号"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">邮箱</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 outline-none"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                placeholder="请输入邮箱"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              取消
            </button>
            <button 
              onClick={handleSaveProfile}
              className="flex-1 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

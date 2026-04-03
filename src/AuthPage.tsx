import React, { useState } from 'react';
import { api, setAuthToken } from './lib/api';
import { LogIn, User, Lock, Loader2, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: () => void;
  onShowToast: (msg: string) => void;
}

export default function AuthPage({ onLoginSuccess, onShowToast }: AuthPageProps) {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await api.login(username, password);
      if (data.access_token) {
        setAuthToken(data.access_token);
        
        if (data.must_change_password) {
          setShowPasswordChange(true);
          onShowToast('首次登錄或密碼已重置，請修改默認密碼');
        } else {
          onShowToast('登錄成功');
          onLoginSuccess();
        }
      } else {
        throw new Error('鑑權未返回有效 Token');
      }
    } catch (error: any) {
      onShowToast(error.message || '登錄失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      onShowToast('兩次輸入的新密碼不一致');
      return;
    }
    if (newPassword.length < 6) {
      onShowToast('新密碼長度不能少於 6 位');
      return;
    }
    if (newPassword === '123456') {
      onShowToast('不能使用默認密碼，請設置一個更安全的密碼');
      return;
    }

    setLoading(true);
    try {
      await api.changePassword(password, newPassword);
      onShowToast('密碼修改成功，請重新登錄');
      setShowPasswordChange(false);
      onLoginSuccess();
    } catch (error: any) {
      onShowToast(error.message || '密碼修改失敗');
    } finally {
      setLoading(false);
    }
  };

  if (showPasswordChange) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-blue-100 overflow-hidden border border-slate-100">
          <div className="p-8 pb-4">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-200">
              <ShieldCheck className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">安全驗證</h1>
            <p className="text-slate-500 font-medium">為了您的賬號安全，請修改初始密碼</p>
          </div>

          <form onSubmit={handleChangePassword} className="p-8 pt-4 space-y-5">
            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  disabled
                  className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl text-slate-500 font-medium cursor-not-allowed"
                  value={password}
                />
              </div>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-slate-900 font-medium"
                  placeholder="新密碼 (至少 6 位)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-slate-900 font-medium"
                  placeholder="確認新密碼"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-700 active:scale-95 transition-all shadow-lg shadow-orange-100 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : '確認修改並進入系統'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-blue-100 overflow-hidden border border-slate-100">
        <div className="p-8 pb-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 rotate-3">
            <LogIn className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">歡迎回來</h1>
          <p className="text-slate-500 font-medium">銷售精英管理系統 v2.0</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 pt-4 space-y-5">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-slate-900 font-medium"
                placeholder="用戶名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-slate-900 font-medium"
                placeholder="登錄密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>立即登錄 <ArrowRight size={20} /></>
            )}
          </button>

          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-slate-400 text-sm font-medium">請聯絡管理員獲取或重置賬號</p>
          </div>
        </form>

        <div className="bg-slate-50 p-6 text-center text-[10px] text-slate-400 font-bold tracking-widest uppercase">
          ZKXY CRM PRO &copy; 2026 基於 MySQL 高級架構
        </div>
      </div>
    </div>
  );
}

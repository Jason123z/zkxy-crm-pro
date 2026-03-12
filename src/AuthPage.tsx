import React, { useState } from 'react';
import { supabase } from './lib/supabase';
import { LogIn, UserPlus, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: () => void;
  onShowToast: (msg: string) => void;
}

export default function AuthPage({ onLoginSuccess, onShowToast }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onShowToast('登录成功');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        onShowToast('注册成功，请查收确认邮件（如开启）并登录');
        setIsLogin(true);
        setLoading(false);
        return;
      }
      onLoginSuccess();
    } catch (error: any) {
      onShowToast(error.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-blue-100 overflow-hidden border border-slate-100">
        <div className="p-8 pb-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 rotate-3">
            <LogIn className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            {isLogin ? '欢迎回来' : '开启新征程'}
          </h1>
          <p className="text-slate-500 font-medium">
            {isLogin ? '销售精英管理系统 v2.0' : '加入志坤行业 CRM 团队'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-5">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-slate-900 font-medium"
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-slate-900 font-medium"
                placeholder="登录密码"
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
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {isLogin ? '立即登录' : '创建账号'}
                <ArrowRight size={20} />
              </>
            )}
          </button>

          <div className="text-center pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 font-bold hover:underline"
            >
              {isLogin ? '没有账号？点击注册' : '已有账号？返回登录'}
            </button>
          </div>
        </form>

        <div className="bg-slate-50 p-6 text-center text-[10px] text-slate-400 font-bold tracking-widest uppercase">
          ZKXY CRM PRO &copy; 2026 基于 Supabase 高级架构
        </div>
      </div>
    </div>
  );
}

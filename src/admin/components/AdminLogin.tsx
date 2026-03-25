import React, { useState } from 'react';
import { Lock, User, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdminLoginProps {
  onLogin: (username: string) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 将 admin 映射为数据库中的正式账号 admin@admin.com
      const email = username === 'admin' ? 'admin@admin.com' : username;
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 验证通过，通知父组件
      onLogin(username);
    } catch (err: any) {
      setError(err.message || '登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50">
        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 p-10 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/10 rounded-full -ml-8 -mb-8 blur-xl"></div>
          
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 shadow-xl border border-white/20">
            <ShieldCheck size={40} className="text-blue-100" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">后台管理中心</h1>
          <p className="text-blue-200/80 text-sm mt-3 font-medium">CRM PRO ADMIN CONSOLE</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-4 rounded-xl border border-red-100 flex items-center gap-2 animate-pulse">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            <div className="group">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                管理账号
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-800 font-medium"
                  required
                />
              </div>
            </div>
            
            <div className="group">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                安全密码
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-800 tracking-widest"
                  required
                />
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-500/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                登录控制台
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          <div className="pt-4 text-center">
             <div className="h-px bg-slate-100 w-full mb-6"></div>
             <a href="/" className="text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-blue-600 transition-colors">
                ← 返回系统首页
             </a>
          </div>
        </form>
      </div>
    </div>
  );
}

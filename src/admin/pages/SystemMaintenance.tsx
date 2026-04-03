import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  GripVertical,
  ShieldAlert,
  UserCheck,
  UserMinus,
  RefreshCw
} from 'lucide-react';
import { 
  getSystemSettings, 
  addSystemSetting, 
  updateSystemSetting, 
  deleteSystemSetting,
  getSalesAccounts,
  createSalesAccount,
  updateSalesAccount,
  deleteSalesAccount,
  resetSalesAccountPassword
} from '../lib/api';

type Setting = {
  id: number | string;
  category: string;
  label: string;
  value: string;
  sort_order: number;
};

export default function SystemMaintenance() {
  const [activeTab, setActiveTab] = useState<'industry' | 'visit_type' | 'product' | 'sales_stage' | 'customer_source' | 'sales_accounts'>('industry');
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    label: '',
    value: '',
    sortOrder: 0,
    // For sales accounts
    username: '',
    fullName: '',
    isActive: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'sales_accounts') {
        const data = await getSalesAccounts();
        setSettings(data || []);
      } else {
        const data = await getSystemSettings(activeTab);
        setSettings(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'sales_accounts') {
        if (editingItem) {
          await updateSalesAccount(editingItem.id, {
            username: formData.username,
            fullName: formData.fullName,
            isActive: formData.isActive
          });
        } else {
          await createSalesAccount(formData.username, formData.fullName);
        }
      } else {
        if (editingItem) {
          await updateSystemSetting(editingItem.id, {
            label: formData.label,
            value: formData.value || formData.label,
            sort_order: Number(formData.sortOrder)
          });
        } else {
          await addSystemSetting(activeTab, formData.label, formData.value || formData.label, Number(formData.sortOrder));
        }
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ label: '', value: '', sortOrder: 0, username: '', fullName: '', isActive: true });
      fetchData();
    } catch (error: any) {
      console.error('Save error:', error);
      const detail = error?.response?.data?.detail || error?.message || '未知错误';
      alert(`保存失败: ${typeof detail === 'object' ? JSON.stringify(detail) : detail}`);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm('确定要删除吗？')) return;
    try {
      if (activeTab === 'sales_accounts') {
        await deleteSalesAccount(id as string);
      } else {
        await deleteSystemSetting(id);
      }
      fetchData();
    } catch (error: any) {
      console.error('Delete error:', error);
      const detail = error?.response?.data?.detail || error?.message || '未知错误';
      alert(`删除失败: ${typeof detail === 'object' ? JSON.stringify(detail) : detail}`);
    }
  };

  const handleResetPassword = async (id: string, username: string) => {
    if (!window.confirm(`确定要将账号 ${username} 的密码重置为 123456 吗？`)) return;
    try {
      await resetSalesAccountPassword(id);
      alert('密码已成功重置为 123456');
      fetchData();
    } catch (error: any) {
      console.error('Reset password error:', error);
      alert('重置密码失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">系统维护 (MySQL)</h2>
          <p className="text-slate-500 text-sm mt-1">管理销售端应用中使用的词典与下拉选项</p>
        </div>
        <button 
          onClick={() => {
            setEditingItem(null);
            if (activeTab === 'sales_accounts') {
              setFormData({ label: '', value: '', sortOrder: 0, username: '', fullName: '', isActive: true });
            } else {
              setFormData({ label: '', value: '', sortOrder: settings.length + 1, username: '', fullName: '', isActive: true });
            }
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          {activeTab === 'sales_accounts' ? '新增賬號' : '新增選項'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-xl border border-slate-200 w-fit overflow-x-auto max-w-full">
        <button 
          onClick={() => setActiveTab('industry')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'industry' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          客户行业
        </button>
        <button 
          onClick={() => setActiveTab('visit_type')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'visit_type' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          拜访类型
        </button>
        <button 
          onClick={() => setActiveTab('product')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'product' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          意向产品
        </button>
        <button 
          onClick={() => setActiveTab('sales_stage')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'sales_stage' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          销售阶段
        </button>
        <button 
          onClick={() => setActiveTab('customer_source')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'customer_source' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          客户来源
        </button>
        <button 
          onClick={() => setActiveTab('sales_accounts')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'sales_accounts' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          销售账号
        </button>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {activeTab === 'sales_accounts' ? (
                <>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">用戶名</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">姓名</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">狀態</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">創建時間</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-16 text-center">排序</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">显示文字 (Label)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">数据库值 (Value)</th>
                </>
              )}
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-40 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={activeTab === 'sales_accounts' ? 5 : 4} className="px-6 py-12 text-center text-slate-400">正在加载数据...</td>
              </tr>
            ) : settings.length === 0 ? (
              <tr>
                <td colSpan={activeTab === 'sales_accounts' ? 5 : 4} className="px-6 py-12 text-center text-slate-400">暂无数据，请点击右上角新增</td>
              </tr>
            ) : (
              settings.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  {activeTab === 'sales_accounts' ? (
                    <>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">{item.username}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-700">{item.full_name || item.username}</span>
                      </td>
                      <td className="px-6 py-4">
                        {item.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            <UserCheck size={12} /> 启用中
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                            <UserMinus size={12} /> 已禁用
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-sm text-slate-500 text-center font-medium">
                        {item.sort_order}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-700">{item.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">{item.value}</code>
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {activeTab === 'sales_accounts' && (
                        <button 
                          onClick={() => handleResetPassword(item.id, item.username)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition" title="重置密码"
                        >
                          <RefreshCw size={16} />
                        </button>
                      )}
                      <button 
                         onClick={() => {
                           setEditingItem(item);
                           if (activeTab === 'sales_accounts') {
                             setFormData({ 
                               ...formData,
                               username: item.username, 
                               fullName: item.full_name, 
                               isActive: item.is_active 
                             });
                           } else {
                             setFormData({ 
                               ...formData,
                               label: item.label, 
                               value: item.value, 
                               sortOrder: item.sort_order 
                             });
                           }
                           setIsModalOpen(true);
                         }}
                         className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="编辑"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="删除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">{editingItem ? '编辑选项' : '新增选项'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {activeTab === 'sales_accounts' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">用户名</label>
                    <input 
                      required
                      className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none" 
                      placeholder="例如：sales01" 
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">真实姓名</label>
                    <input 
                      required
                      className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none" 
                      placeholder="例如：张三" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="text-sm font-bold text-slate-700 cursor-pointer" htmlFor="isActive">
                      是否启用账号
                    </label>
                    <input 
                      id="isActive"
                      type="checkbox"
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                  </div>
                  {!editingItem && (
                    <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200">
                      提示：新账号创建后，默认密码为 <span className="font-bold text-blue-600">123456</span>，用户首次登录时必须修改密码。
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">显示文字</label>
                    <input 
                      required
                      className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none" 
                      placeholder="例如：在线办公" 
                      value={formData.label}
                      onChange={(e) => setFormData({...formData, label: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">存储值 (选填)</label>
                    <input 
                      className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none" 
                      placeholder="留空则与显示文字相同" 
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">显示顺序 (Sort Order)</label>
                    <input 
                      type="number"
                      className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none" 
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                >
                  {editingItem ? '保存修改' : '立即创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  GripVertical
} from 'lucide-react';
import { getSystemSettings, addSystemSetting, updateSystemSetting, deleteSystemSetting } from '../lib/api';

type Setting = {
  id: string;
  category: string;
  label: string;
  value: string;
  sort_order: number;
};

export default function SystemMaintenance() {
  const [activeTab, setActiveTab] = useState<'industry' | 'visit_type' | 'product' | 'sales_stage' | 'customer_source'>('industry');
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Setting | null>(null);
  
  const [formData, setFormData] = useState({
    label: '',
    value: '',
    sortOrder: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getSystemSettings(activeTab);
      setSettings(data || []);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
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
      if (editingItem) {
        await updateSystemSetting(editingItem.id, {
          label: formData.label,
          value: formData.value || formData.label,
          sort_order: formData.sortOrder
        });
      } else {
        await addSystemSetting(activeTab, formData.label, formData.value || formData.label, formData.sortOrder);
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ label: '', value: '', sortOrder: 0 });
      fetchData();
    } catch (error) {
      alert('保存失败，请重试');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此选项吗？这可能会影响到现有的数据展示（仅限显示，不影响已存储的旧值）。')) return;
    try {
      await deleteSystemSetting(id);
      fetchData();
    } catch (error) {
      alert('删除失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">系统维护</h2>
          <p className="text-slate-500 text-sm mt-1">管理销售端应用中使用的词典与下拉选项</p>
        </div>
        <button 
          onClick={() => {
            setEditingItem(null);
            setFormData({ label: '', value: '', sortOrder: settings.length + 1 });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          新增选项
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-xl border border-slate-200 w-fit">
        <button 
          onClick={() => setActiveTab('industry')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'industry' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          客户行业列表
        </button>
        <button 
          onClick={() => setActiveTab('visit_type')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'visit_type' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          拜访记录类型
        </button>
        <button 
          onClick={() => setActiveTab('product')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'product' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          意向产品列表
        </button>
        <button 
          onClick={() => setActiveTab('sales_stage')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'sales_stage' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          销售阶段维护
        </button>
        <button 
          onClick={() => setActiveTab('customer_source')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'customer_source' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          客户来源维护
        </button>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-16 text-center">序号</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">显示文字 (Label)</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">数据库存储值 (Value)</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-32 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">正在加载数据...</td>
              </tr>
            ) : settings.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">暂无选项，请点击右上角新增</td>
              </tr>
            ) : (
              settings.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-500 text-center font-medium">
                    {item.sort_order}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700">{item.label}</span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">{item.value}</code>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                         onClick={() => {
                           setEditingItem(item);
                           setFormData({ label: item.label, value: item.value, sortOrder: item.sort_order });
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
                  保存选项
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

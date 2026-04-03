import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  Building2, 
  RotateCcw, 
  UserPlus, 
  CheckSquare, 
  Square,
  ChevronDown,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { 
  getAllCustomers, 
  getSalesAccounts, 
  bulkTransferCustomers, 
  bulkReleaseCustomers 
} from '../lib/api';
import { Customer, SalesAccount } from '../../types';
import Modal from '../../components/Modal';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesAccounts, setSalesAccounts] = useState<SalesAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>('all');
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState('');
  const [acting, setActing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [c, s] = await Promise.all([
        getAllCustomers(),
        getSalesAccounts()
      ]);
      setCustomers(c);
      setSalesAccounts(s || []);
    } catch (error) {
      console.error("Failed to fetch management data:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers = (customers || []).filter(c => {
    const name = c.name || '';
    const industry = c.industry || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          industry.toLowerCase().includes(searchTerm.toLowerCase());
    const ownerId = (c as any).userId || 'public';
    const matchesPersonnel = selectedPersonnel === 'all' || ownerId === selectedPersonnel;
    return matchesSearch && matchesPersonnel;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCustomers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCustomers.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkTransfer = async () => {
    if (!targetUserId || selectedIds.length === 0) return;
    setActing(true);
    try {
      await bulkTransferCustomers(selectedIds, targetUserId);
      setIsTransferModalOpen(false);
      setSelectedIds([]);
      setTargetUserId('');
      fetchData();
      alert('客户移交成功');
    } catch (error) {
      alert('操作失败，请稍后重试');
    } finally {
      setActing(false);
    }
  };

  const handleBulkRelease = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`确定要将选中的 ${selectedIds.length} 个客户释放到公海吗？释放后所有销售人员将失去该客户的管理权。`)) return;
    
    setActing(true);
    try {
      await bulkReleaseCustomers(selectedIds);
      setSelectedIds([]);
      fetchData();
      alert('已成功释放到公海');
    } catch (error) {
      alert('操作失败');
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">客户资产管理</h2>
          <p className="text-slate-500">批量划转客户负责人或释放至公海池</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
           <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="搜索客户..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 shadow-inner"
            />
          </div>
          
          <select 
            value={selectedPersonnel}
            onChange={e => setSelectedPersonnel(e.target.value)}
            className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">按所属负责人筛选</option>
            <option value="public">公海/未分配</option>
            {salesAccounts.map(account => (
              <option key={account.id} value={account.id}>{account.fullName}</option>
            ))}
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
            <span className="text-sm font-bold text-blue-600 px-3 border-r border-slate-200">已选中 {selectedIds.length} 项</span>
            <button 
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <UserPlus size={14} />
              划转负责人
            </button>
            <button 
              onClick={handleBulkRelease}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-201 transition-colors border border-slate-200"
            >
              <RotateCcw size={14} />
              释放到公海
            </button>
          </div>
        )}
      </div>

      {/* Table Interface */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 w-12">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-blue-600">
                    {selectedIds.length === filteredCustomers.length && filteredCustomers.length > 0 ? 
                      <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} />}
                  </button>
                </th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">客户名称</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">等级/行业</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">当前负责人</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">创建时间</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map(customer => {
                const isSelected = selectedIds.includes(customer.id);
                const ownerName = (customer as any).ownerName || '公海/未分配';
                const isPublic = !((customer as any).userId);

                return (
                  <tr 
                    key={customer.id} 
                    className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <button onClick={() => toggleSelect(customer.id)} className="text-slate-300 hover:text-blue-600">
                        {isSelected ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} />}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isPublic ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-600'}`}>
                          <Building2 size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{customer.name || '未命名客户'}</p>
                          <p className="text-[10px] text-slate-400">{(customer.id || '').substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-bold ${customer.level === 'A' ? 'text-red-500' : 'text-slate-500'}`}>{customer.level}级</span>
                        <span className="text-xs text-slate-500">{customer.industry}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isPublic ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                          {isPublic ? '?' : (ownerName ? ownerName[0] : '匿')}
                        </div>
                        <span className={`text-sm ${isPublic ? 'text-slate-400 font-medium' : 'text-slate-700 font-bold'}`}>
                          {isPublic ? '公海/未分配' : ownerName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-500">
                        {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase">
                        {customer.status || '线索'}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users size={48} className="mx-auto mb-4 opacity-10" />
                    <p>未找到符合条件的客户</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Modal */}
      <Modal 
        isOpen={isTransferModalOpen} 
        onClose={() => setIsTransferModalOpen(false)}
        title={`划转负责人 (${selectedIds.length} 位客户)`}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500 leading-relaxed">
            请选择接收这些客户的目标销售人员。划转后，新负责人将获得这些客户资料、联系人及待办计划的完整管理权。
          </p>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">目标销售人员</label>
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {salesAccounts.map(account => (
                <button
                  key={account.id}
                  onClick={() => setTargetUserId(account.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left group
                    ${targetUserId === account.id ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-100 hover:border-slate-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-8 rounded-full flex items-center justify-center font-bold text-xs
                      ${targetUserId === account.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {(account.fullName || '匿')[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{account.fullName || '无名销售'}</p>
                      <p className="text-[10px] text-slate-400">{account.username || 'unknown'}</p>
                    </div>
                  </div>
                  {targetUserId === account.id && <CheckSquare size={18} className="text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              onClick={() => setIsTransferModalOpen(false)}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button 
              onClick={handleBulkTransfer}
              disabled={!targetUserId || acting}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:opacity-90 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              {acting ? '处理中...' : '确认划转'}
            </button>
          </div>
        </div>
      </Modal>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e2e8f0;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}

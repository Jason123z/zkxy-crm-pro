import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  MoreVertical, 
  Building2, 
  TrendingUp, 
  FileText, 
  History, 
  PlusCircle, 
  Users, 
  Edit2, 
  Phone, 
  MessageCircle, 
  Plus, 
  Calendar, 
  MapPin,
  Check,
  Trash2
} from 'lucide-react';
import { cn } from './lib/utils';
import Modal from './components/Modal';
import { Customer, Project, VisitRecord, Contact, Task, CustomerLevel } from './types';

import { 
  getCustomerById, 
  updateCustomer, 
  getContactsByCustomer, 
  getVisitsByCustomer, 
  getTasksByCustomer,
  createContact,
  updateContact,
  deleteContact,
  createVisitRecord,
  updateVisitRecord,
  deleteVisitRecord,
  createTask,
  updateTask,
  deleteTask,
  getSystemSettings
} from './lib/data';

interface CustomerDetailsProps {
  customerId: string | null;
  initialProjectId?: string | null;
  onBack: () => void;
  onShowToast: (message: string) => void;
}

export default function CustomerDetails({ customerId, onBack, onShowToast }: CustomerDetailsProps) {
  const [stage, setStage] = useState(1);
  
  // Customer State
  const [customer, setCustomer] = useState<Customer | null>(null);

  // Load customer and options
  React.useEffect(() => {
    const loadAllInitialData = async () => {
      if (!customerId) return onBack();
      try {
        const [customerData, indData, visitData, prodData, stageData, sourceData] = await Promise.all([
          getCustomerById(customerId),
          getSystemSettings('industry'),
          getSystemSettings('visit_type'),
          getSystemSettings('product'),
          getSystemSettings('sales_stage'),
          getSystemSettings('customer_source')
        ]);

        if (!customerData) {
          onShowToast('客户不存在或已被删除');
          return onBack();
        }

        // Set options first
        setIndustries(indData);
        setVisitTypes(visitData);
        setProducts(prodData);
        const mappedStages = stageData.map((s, idx) => ({ ...s, id: idx + 1 }));
        setSalesStages(mappedStages);
        setCustomerSources(sourceData);

        // Set customer
        setCustomer(customerData);
        
        // Map status to stage ID using the newly loaded stages
        if (customerData.status) {
          const currentStage = mappedStages.find(s => s.label === customerData.status);
          if (currentStage) setStage(currentStage.id!);
        }
      } catch (error: any) {
        console.error("Failed to load initial data", error);
        onShowToast(`加载失败: ${error.message}`);
        onBack();
      }
    };
    loadAllInitialData();
  }, [customerId, onBack]);

  // Load related data
  React.useEffect(() => {
    const loadRelatedData = async () => {
      if (!customerId) return;
      try {
        const [loadedContacts, loadedVisits, loadedTasks] = await Promise.all([
          getContactsByCustomer(customerId),
          getVisitsByCustomer(customerId),
          getTasksByCustomer(customerId)
        ]);
        setContacts(loadedContacts);
        setVisits(loadedVisits);
        setTasks(loadedTasks);
      } catch (error) {
        console.error("Failed to load customer related data", error);
      }
    };
    loadRelatedData();
  }, [customerId]);

  // Visits State
  const [visits, setVisits] = useState<VisitRecord[]>([]);

  // Contacts State
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>([]);

  // Modal States
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Editing States
  const [editingVisit, setEditingVisit] = useState<VisitRecord | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [industries, setIndustries] = useState<{label: string, value: string}[]>([]);
  const [visitTypes, setVisitTypes] = useState<{label: string, value: string}[]>([]);
  const [products, setProducts] = useState<{label: string, value: string}[]>([]);
  const [salesStages, setSalesStages] = useState<{label: string, value: string, id?: number}[]>([]);
  const [customerSources, setCustomerSources] = useState<{label: string, value: string}[]>([]);

  // Custom Product States
  const [isCustomProduct, setIsCustomProduct] = useState(false);

  // Moved options fetching to the main useEffect to avoid race conditions

  React.useEffect(() => {
    if (customer && products.length > 0) {
      if (customer.product && !products.some(p => p.value === customer.product)) {
         setIsCustomProduct(true);
      }
    }
  }, [customer, products]);

  const stages = salesStages.length > 0 ? salesStages.map(s => ({ id: s.id!, name: s.label })) : [
    { id: 1, name: '线索' },
    { id: 2, name: '初步拜访' },
    { id: 3, name: '需求调研' },
    { id: 4, name: '询价' },
    { id: 5, name: '合同' },
  ];

  const handleStageChange = async (newStageId: number) => {
    if (!customer) return;
    const stageName = stages.find(s => s.id === newStageId)?.name || '';
    setStage(newStageId);
    
    const now = new Date().toISOString();
    try {
      const updatedCustomer = { ...customer, status: stageName, statusUpdatedAt: now };
      setCustomer(updatedCustomer);
      
      await updateCustomer(customer.id, { status: stageName, statusUpdatedAt: now });
      onShowToast(`客户阶段已更新为：${stageName}`);
    } catch (err: any) {
      onShowToast(`更新失败: ${err.message}`);
    }
  };

  // Handlers
  const handleSaveCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customer) return;
    
    const formData = new FormData(e.currentTarget);
    const updatedCustomer = {
      ...customer,
      name: formData.get('name') as string,
      level: formData.get('level') as CustomerLevel,
      industry: formData.get('industry') as string,
      size: formData.get('size') as string,
      address: formData.get('address') as string,
      source: formData.get('source') as string,
      contactPerson: formData.get('contactPerson') as string,
      contactRole: formData.get('contactRole') as string,
      // Budget fields removed from here as they should be maintained in the Intention/Needs section
    };
    
    const contactPhone = formData.get('phone') as string;
    const contactWechat = formData.get('wechat') as string;
    
    try {
        await updateCustomer(customerId!, updatedCustomer);
        setCustomer(updatedCustomer);

        // Update primary contact as well
        // We look for a contact that matches the primary contact name or is marked isKey
        const primaryContact = contacts.find(c => c.name === customer.contactPerson) || contacts[0];
        if (primaryContact) {
            await updateContact(customer.id, primaryContact.id, {
                name: updatedCustomer.contactPerson,
                role: updatedCustomer.contactRole,
                phone: contactPhone,
                email: contactWechat
            });
            // Refresh contacts list to reflect changes
            setContacts(await getContactsByCustomer(customer.id));
        }

        setIsCustomerModalOpen(false);
        onShowToast('客户资料已更新');
    } catch(err: any) {
        console.error(err);
        const errorMsg = err.response?.data?.detail || err.message || '未知错误';
        onShowToast(`保存失败: ${errorMsg}`);
    }
  };

  const handleSaveVisit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customer) return;
    const formData = new FormData(e.currentTarget);
    const visitData: any = {
      type: formData.get('type') as string,
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      content: formData.get('content') as string,
    };

    try {
      if (editingVisit) {
        await updateVisitRecord(customer.id, editingVisit.id, visitData);
      } else {
        await createVisitRecord(customer.id, visitData);
      }
      setVisits(await getVisitsByCustomer(customer.id));
      setIsVisitModalOpen(false);
      setEditingVisit(null);
      onShowToast(editingVisit ? '拜访记录已更新' : '已添加拜访记录');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || '未知错误';
      onShowToast(`操作失败: ${errorMsg}`);
    }
  };

  const handleSaveContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customer) return;
    const formData = new FormData(e.currentTarget);
    const decisionRole = formData.get('decisionRole') as string;
    const contactData: any = {
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      decision_role: decisionRole,
      isKey: decisionRole === '核心决策人',
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
    };

    try {
      if (editingContact) {
        await updateContact(customer.id, editingContact.id, contactData);
      } else {
        await createContact(customer.id, contactData);
      }
      setContacts(await getContactsByCustomer(customer.id));
      setIsContactModalOpen(false);
      setEditingContact(null);
      onShowToast(editingContact ? '联系人已更新' : '已添加联系人');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || '未知错误';
      onShowToast(`操作失败: ${errorMsg}`);
    }
  };

  const handleSaveTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customer) return;
    const formData = new FormData(e.currentTarget);
    const taskData: any = {
      title: formData.get('title') as string,
      deadline: formData.get('deadline') as string,
      status: (formData.get('status') as any) || 'pending',
    };

    try {
      if (editingTask) {
        await updateTask(customer.id, editingTask.id, taskData);
      } else {
        await createTask(customer.id, taskData);
      }
      setTasks(await getTasksByCustomer(customer.id));
      setIsTaskModalOpen(false);
      setEditingTask(null);
      onShowToast(editingTask ? '任务已更新' : '已添加任务');
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || '未知错误';
      onShowToast(`操作失败: ${errorMsg}`);
    }
  };

  // This is handled via backend now, not supporting toggle inside this MVP
  const toggleTaskStatus = async (id: string) => {
    if (!customer) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateTask(customer.id, id, { status: newStatus });
      setTasks(await getTasksByCustomer(customer.id));
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || '未知错误';
      onShowToast(`操作失败: ${errorMsg}`);
    }
  };

  const handleSaveRequirements = async () => {
    if (!customer) return;
    try {
      await updateCustomer(customerId!, customer);
      onShowToast('客户需求信息已保存');
      onBack(); // Return to previous page after successful save
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.message || '未知错误';
      onShowToast(`保存失败: ${errorMsg}`);
    }
  };

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-slate-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      {/* Top Navigation */}
      <div className="flex items-center bg-white p-4 border-b border-slate-200 justify-between sticky top-0 z-10">
        <button onClick={onBack} className="text-slate-900 flex size-10 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-slate-900 text-lg font-bold flex-1 px-4">客户详情</h2>
        <div className="flex gap-2">
          <button className="flex size-10 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <Share2 size={20} />
          </button>
          <button className="flex size-10 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Header Profile Section */}
      <div className="bg-white p-6 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-blue-50 rounded-full h-20 w-20 flex items-center justify-center text-blue-600">
              <Building2 size={40} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-0.5 rounded">{customer.level}级</span>
              </div>
              <p className="text-slate-500 mt-1">行业：{customer.industry || '未填写'} · 规模：{customer.size || '未填写'} · 来源：{customer.source || '未维护'}</p>
              {customer.budgetAmount != null && (
                <p className="text-blue-600 text-sm font-semibold mt-1">
                  预算：¥{customer.budgetAmount.toLocaleString()} ({customer.budgetLevel || '未分类'})
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleSaveRequirements}
              className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              保存并返回
            </button>
            <button 
              onClick={() => setIsCustomerModalOpen(true)}
              className="flex-1 md:flex-none px-6 py-2.5 border border-slate-200 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              编辑资料
            </button>
            <button 
              onClick={() => {
                setEditingVisit(null);
                setIsVisitModalOpen(true);
              }}
              className="flex-1 md:flex-none px-6 py-2.5 border border-slate-200 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              添加拜访
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6 max-w-4xl mx-auto w-full">


        {/* Sales Funnel Stage */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={20} />
              销售阶段
            </h3>
            <span className="text-sm text-slate-500">
              已停留: {(() => {
                if (!customer.statusUpdatedAt) return '0';
                const start = new Date(customer.statusUpdatedAt).getTime();
                const now = new Date().getTime();
                const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
                return days > 0 ? days : '0';
              })()}天
            </span>
          </div>
          <div className="relative flex items-center justify-between w-full px-2">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500" 
              style={{ width: `${((stage - 1) / (stages.length - 1)) * 100}%` }}
            ></div>
            {stages.map((s) => (
              <div 
                key={s.id} 
                className="z-10 flex flex-col items-center gap-2 cursor-pointer"
                onClick={() => handleStageChange(s.id)}
              >
                <div className={cn(
                  "size-8 rounded-full flex items-center justify-center text-xs ring-4 ring-white transition-all",
                  s.id < stage ? "bg-blue-600 text-white" : 
                  s.id === stage ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : 
                  "bg-white border-2 border-slate-200 text-slate-400"
                )}>
                  {s.id < stage ? <Check size={14} /> : <span className="font-bold">{s.id}</span>}
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  s.id === stage ? "text-blue-600 font-bold" : "text-slate-500"
                )}>{s.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Product & Requirements */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="text-blue-600" size={20} />
              意向及需求
            </div>
              <button 
                onClick={() => handleSaveRequirements()}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
              >
                保存本项
              </button>
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">意向产品</label>
                  <div className="flex gap-2">
                    <select 
                      value={isCustomProduct ? '项目' : (customer.product || '')}
                      onChange={(e) => {
                        if (e.target.value === '项目') {
                          setIsCustomProduct(true);
                          setCustomer({ ...customer, product: '' });
                        } else {
                          setIsCustomProduct(false);
                          setCustomer({ ...customer, product: e.target.value });
                        }
                      }}
                       className={`bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm focus:ring-blue-600 focus:border-blue-600 outline-none ${isCustomProduct ? 'w-1/3' : 'w-full'}`}
                    >
                      <option value="">请选择产品</option>
                      <option value="项目">项目 (填空)</option>
                      {products.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                    {isCustomProduct && (
                      <input 
                        type="text"
                        placeholder="请输入自定义项目名称"
                        value={customer.product || ''}
                        onChange={(e) => setCustomer({ ...customer, product: e.target.value })}
                        className="flex-1 bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm focus:ring-blue-600 focus:border-blue-600 outline-none w-full"
                      />
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">项目预算清单</label>
                  <select 
                     value={customer.budgetLevel || ''}
                     onChange={(e) => setCustomer({ ...customer, budgetLevel: e.target.value })}
                     className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm focus:ring-blue-600 focus:border-blue-600 outline-none"
                  >
                    <option value="">请选择预算状态</option>
                    <option value="已获取初步预算清单">已获取初步预算清单</option>
                    <option value="仅获取初步预算金额">仅获取初步预算金额</option>
                    <option value="初步预算不详">初步预算不详</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">预算金额 (元)</label>
                  <input 
                    type="number"
                    value={customer.budgetAmount || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomer({ 
                        ...customer, 
                        budgetAmount: val === '' ? undefined : parseFloat(val) 
                      });
                    }}
                    className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm focus:ring-blue-600 focus:border-blue-600 outline-none"
                    placeholder="请输入预算金额"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">预计采购时间</label>
                  <input 
                    className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm focus:ring-blue-600 focus:border-blue-600 outline-none" 
                    placeholder="例如：2024年Q4、12月下旬..." 
                    type="text" 
                    value={customer.estimatedPurchaseTime || ''}
                    onChange={(e) => setCustomer({ ...customer, estimatedPurchaseTime: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">预计采购金额 (元)</label>
                  <input 
                    type="number"
                    value={customer.estimatedPurchaseAmount || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomer({ 
                        ...customer, 
                        estimatedPurchaseAmount: val === '' ? undefined : parseFloat(val) 
                      });
                    }}
                    className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm focus:ring-blue-600 focus:border-blue-600 outline-none"
                    placeholder="请输入预计采购金额"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">竞品信息</label>
                  <input 
                    className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm focus:ring-blue-600 focus:border-blue-600 outline-none" 
                    placeholder="输入当前接触的竞品..." 
                    type="text" 
                    value={customer.competitors || ''}
                    onChange={(e) => setCustomer({ ...customer, competitors: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">需求描述</label>
                <textarea 
                  className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm focus:ring-blue-600 focus:border-blue-600 outline-none" 
                  placeholder="请详细描述客户的痛点与核心需求..." 
                  rows={4}
                  value={customer.description || ''}
                  onChange={(e) => setCustomer({ ...customer, description: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">客户顾虑点</label>
                <textarea 
                  className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm focus:ring-blue-600 focus:border-blue-600 outline-none" 
                  placeholder="记录客户对产品的疑虑、预算担忧或对竞品的倾向..." 
                  rows={3}
                  value={customer.concerns || ''}
                  onChange={(e) => setCustomer({ ...customer, concerns: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">解决方案</label>
                <textarea 
                  className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm focus:ring-blue-600 focus:border-blue-600 outline-none" 
                  placeholder="针对客户需求与顾虑，拟定初步的应对方案或产品组合策略..." 
                  rows={3}
                  value={customer.solution || ''}
                  onChange={(e) => setCustomer({ ...customer, solution: e.target.value })}
                />
              </div>
            </div>
          </section>



        {/* Contacts */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Users className="text-blue-600" size={20} />
              联系人 & 决策链
            </h3>
            <button 
              onClick={() => {
                setEditingContact(null);
                setIsContactModalOpen(true);
              }}
              className="text-slate-500 hover:text-blue-600 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div 
                key={contact.id} 
                className={cn(
                  "flex items-center gap-3 p-3 border rounded-lg transition-colors cursor-pointer group",
                  contact.isKey ? "border-blue-100 bg-blue-50/30" : "border-slate-100 hover:bg-slate-50"
                )}
                onClick={() => {
                  setEditingContact(contact);
                  setIsContactModalOpen(true);
                }}
              >
                <div className="size-10 rounded-full bg-slate-200 overflow-hidden">
                  <img src={contact.avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">{contact.name}</p>
                    {contact.decisionRole && (
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-bold",
                        contact.isKey ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                      )}>
                        {contact.decisionRole}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{contact.role}</p>
                </div>
                <div className="flex items-center gap-1">
                  {contact.phone && (
                    <a 
                      className="text-blue-600 hover:bg-blue-100 p-2 rounded-full transition-colors" 
                      href={`tel:${contact.phone}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone size={18} />
                    </a>
                  )}
                  {contact.email && (
                    <div 
                      className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors" 
                      title={`微信: ${contact.email}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MessageCircle size={18} />
                    </div>
                  )}
                  <Edit2 size={16} className="text-slate-300 group-hover:text-blue-600 ml-1" />
                </div>
              </div>
            ))}
            <button 
              onClick={() => {
                setEditingContact(null);
                setIsContactModalOpen(true);
              }}
              className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm flex items-center justify-center gap-2 hover:border-blue-600 hover:text-blue-600 transition-all"
            >
              <Plus size={16} />
              添加新联系人
            </button>
          </div>
        </section>

        {/* Tasks */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Calendar className="text-blue-600" size={20} />
              待办&下次跟进计划
            </h3>
            <button 
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="text-blue-600 text-sm font-semibold flex items-center gap-1"
            >
              <PlusCircle size={16} />
              添加待办
            </button>
          </div>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg group">
                <input 
                  className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer" 
                  type="checkbox" 
                  checked={task.status === 'completed'}
                  onChange={() => toggleTaskStatus(task.id)}
                />
                <div className="flex-1 cursor-pointer" onClick={() => {
                  setEditingTask(task);
                  setIsTaskModalOpen(true);
                }}>
                  <p className={cn(
                    "text-sm font-medium",
                    task.status === 'completed' ? "text-slate-400 line-through" : "text-slate-900"
                  )}>
                    {task.title}
                  </p>
                  <p className={cn(
                    "text-[10px] mt-0.5",
                    task.deadline.includes('今天') ? "text-red-500" : "text-slate-500"
                  )}>
                    {task.deadline}
                  </p>
                </div>
                <Edit2 size={14} className="text-slate-300 group-hover:text-blue-600 cursor-pointer" onClick={() => {
                  setEditingTask(task);
                  setIsTaskModalOpen(true);
                }} />
              </div>
            ))}
          </div>
        </section>

        {/* Visit Records */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <History className="text-blue-600" size={20} />
              拜访记录
            </h3>
            <button 
              onClick={() => {
                setEditingVisit(null);
                setIsVisitModalOpen(true);
              }}
              className="text-blue-600 text-sm font-semibold flex items-center gap-1"
            >
              <PlusCircle size={16} />
              新增记录
            </button>
          </div>
          <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {visits.map((visit) => (
              <div key={visit.id} className="relative pl-8 group">
                <div className="absolute left-0 top-1.5 size-6 rounded-full bg-blue-50 border-4 border-white flex items-center justify-center z-10">
                  <div className="size-2 rounded-full bg-blue-600"></div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => {
                  setEditingVisit(visit);
                  setIsVisitModalOpen(true);
                }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm">{visit.type} - {visit.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{visit.date}</span>
                      <Edit2 size={14} className="text-slate-400 group-hover:text-blue-600" />
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">{visit.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex gap-4 md:hidden">
        <button 
          onClick={handleSaveRequirements}
          className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-600/20"
        >
          保存修改
        </button>
        <button className="flex items-center justify-center size-12 border border-slate-200 rounded-lg">
          <Phone size={20} />
        </button>
      </div>

      {/* Modals */}

      {/* Customer Modal */}
      <Modal 
        isOpen={isCustomerModalOpen} 
        onClose={() => setIsCustomerModalOpen(false)} 
        title="编辑客户资料"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">客户名称</label>
            <input name="name" defaultValue={customer.name} className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">客户等级</label>
              <select name="level" defaultValue={customer.level} className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm">
                <option value="A">A级</option>
                <option value="B">B级</option>
                <option value="C">C级</option>
                <option value="D">D级</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">行业</label>
              <select name="industry" defaultValue={customer.industry} className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm">
                <option value="">请选择行业</option>
                {industries.length > 0 ? (
                  industries.map(ind => (
                    <option key={ind.value} value={ind.value}>{ind.label}</option>
                  ))
                ) : (
                  <>
                    <option value="行政事业单位">行政事业单位</option>
                    <option value="高校">高校</option>
                    <option value="国企">国企</option>
                    <option value="民企">民企</option>
                    <option value="其他">其他</option>
                  </>
                )}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">规模</label>
            <input name="size" defaultValue={customer.size} className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">联系人</label>
              <input name="contactPerson" defaultValue={customer.contactPerson} className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">职位/部门</label>
              <input name="contactRole" defaultValue={customer.contactRole} className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">联系电话</label>
              <input name="phone" type="tel" defaultValue={contacts.find(c => c.name === customer.contactPerson)?.phone || contacts[0]?.phone} className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">微信</label>
              <input name="wechat" type="text" defaultValue={contacts.find(c => c.name === customer.contactPerson)?.email || contacts[0]?.email} className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">地址</label>
              <textarea name="address" defaultValue={customer.address} className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm" rows={2} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">客户来源</label>
              <select name="source" defaultValue={customer.source} className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm">
                <option value="">请选择来源</option>
                {customerSources.map(src => (
                  <option key={src.value} value={src.value}>{src.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg font-semibold text-slate-600">取消</button>
            <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold">保存</button>
          </div>
        </form>
      </Modal>

      {/* Visit Modal */}
      <Modal 
        isOpen={isVisitModalOpen} 
        onClose={() => setIsVisitModalOpen(false)} 
        title={editingVisit ? "编辑拜访记录" : "新增拜访记录"}
      >
        <form onSubmit={handleSaveVisit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">拜访类型</label>
              <select name="type" defaultValue={editingVisit?.type || (visitTypes[0]?.value || "线下拜访")} className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm">
                {visitTypes.length > 0 ? (
                  visitTypes.map(vt => (
                    <option key={vt.value} value={vt.value}>{vt.label}</option>
                  ))
                ) : (
                  <>
                    <option>线下拜访</option>
                    <option>电话拜访</option>
                    <option>视频会议</option>
                    <option>其他</option>
                  </>
                )}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">日期时间</label>
              <input name="date" type="datetime-local" defaultValue={editingVisit?.date.replace(' ', 'T') || new Date().toISOString().slice(0, 16)} className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">拜访主题</label>
            <input name="title" defaultValue={editingVisit?.title} placeholder="例如：技术对接、商务谈判" className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">拜访内容</label>
            <textarea name="content" defaultValue={editingVisit?.content} className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm" rows={4} placeholder="记录拜访详情..." required />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsVisitModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg font-semibold text-slate-600">取消</button>
            <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold">保存</button>
          </div>
        </form>
      </Modal>

      {/* Contact Modal */}
      <Modal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
        title={editingContact ? "编辑联系人" : "添加联系人"}
      >
        <form onSubmit={handleSaveContact} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">姓名</label>
            <input name="name" defaultValue={editingContact?.name} className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">职位/部门</label>
            <input name="role" defaultValue={editingContact?.role} placeholder="例如：技术总监、行政部" className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">电话</label>
              <input name="phone" type="tel" defaultValue={editingContact?.phone} className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">微信</label>
              <input name="email" type="text" defaultValue={editingContact?.email} placeholder="请输入微信号" className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">决策角色</label>
            <select name="decisionRole" defaultValue={editingContact?.decisionRole || (editingContact?.isKey ? '核心决策人' : '辅助决策人')} className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm">
              <option value="核心决策人">核心决策人</option>
              <option value="辅助决策人">辅助决策人</option>
              <option value="业务对接人">业务对接人</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsContactModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg font-semibold text-slate-600">取消</button>
            <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold">保存</button>
          </div>
        </form>
      </Modal>

      {/* Task Modal */}
      <Modal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        title={editingTask ? "编辑待办事项" : "添加待办事项"}
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">任务内容</label>
            <input name="title" defaultValue={editingTask?.title} className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">截止日期/时间</label>
            <input name="deadline" defaultValue={editingTask?.deadline} placeholder="例如：今天截止、明天 10:00" className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">状态</label>
            <select name="status" defaultValue={editingTask?.status || "pending"} className="w-full bg-slate-50 border-slate-200 rounded-lg p-2.5 text-sm">
              <option value="pending">待处理</option>
              <option value="planned">已计划</option>
              <option value="completed">已完成</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsTaskModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg font-semibold text-slate-600">取消</button>
            <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold">保存</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

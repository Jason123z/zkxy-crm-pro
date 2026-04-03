import { api } from './api';
import { Customer, Project, VisitPlan, DailyReport as Report, CheckIn, UserProfile } from '../types';

// --- snake_case → camelCase 工具函数 ---
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export function toCamelCase<T>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const camelKey = snakeToCamel(key);
    const value = obj[key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[camelKey] = toCamelCase(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      result[camelKey] = value.map(item =>
        typeof item === 'object' && item !== null
          ? toCamelCase(item as Record<string, unknown>)
          : item
      );
    } else {
      result[camelKey] = value;
    }
  }
  return result as T;
}

// --- camelCase → snake_case 工具函数 ---
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const snakeKey = camelToSnake(key);
    result[snakeKey] = obj[key];
  }
  return result;
}

// --- Customers ---
export const getCustomers = async (): Promise<Customer[]> => {
  const data = await api.get('/customers/');
  return (data || []).map((item: any) => toCamelCase<Customer>(item));
};

export const searchCustomers = async (query: string): Promise<Customer[]> => {
  if (!query) return [];
  const data = await api.get(`/customers/search?q=${encodeURIComponent(query)}`);
  return (data || []).map((item: any) => toCamelCase<Customer>(item));
};

export const getCustomerById = async (id: string): Promise<Customer | undefined> => {
  try {
    const data = await api.get(`/customers/${id}`);
    return data ? toCamelCase<Customer>(data) : undefined;
  } catch (error) {
    console.error('getCustomerById error:', error);
    return undefined;
  }
};

export const createCustomer = async (customerData: Partial<Customer>): Promise<Customer> => {
  const snakeData = toSnakeCase(customerData as Record<string, unknown>);
  const data = await api.post('/customers/', snakeData);
  return toCamelCase<Customer>(data);
};

export const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<Customer> => {
  if (!id) throw new Error('Customer ID is missing');
  
  const allowedKeys = [
    'name', 'level', 'industry', 'size', 'address', 'status', 'source',
    'budgetLevel', 'budgetAmount', 'estimatedPurchaseTime', 'estimatedPurchaseAmount', 'product', 'description', 
    'concerns', 'solution', 'competitors', 'lastFollowUp', 'statusUpdatedAt'
  ];
  
  const filteredData: Record<string, unknown> = {};
  for (const key of allowedKeys) {
    if (key in customerData && (customerData as any)[key] !== undefined) {
      filteredData[key] = (customerData as any)[key];
    }
  }

  const snakeData = toSnakeCase(filteredData);
  const data = await api.put(`/customers/${id}`, snakeData);
  return toCamelCase<Customer>(data);
};

export const deleteCustomer = async (id: string) => {
  return await api.delete(`/customers/${id}`);
};

// --- Projects ---
export const getProjectsByCustomer = async (customerId: string): Promise<Project[]> => {
  const data = await api.get(`/customers/${customerId}/projects`);
  return (data || []).map((item: any) => toCamelCase<Project>(item));
};

export const createProject = async (projectData: Partial<Project>): Promise<Project> => {
  const customerId = projectData.customerId;
  if (!customerId) throw new Error('Customer ID is required to create a project');
  
  const snakeData = toSnakeCase(projectData as Record<string, unknown>);
  const data = await api.post(`/customers/${customerId}/projects`, snakeData);
  return toCamelCase<Project>(data);
};

export const updateProject = async (id: string, projectData: Partial<Project>): Promise<Project> => {
  const customerId = projectData.customerId;
  if (!customerId) throw new Error('Customer ID is required to update a project');
  
  const snakeData = toSnakeCase(projectData as Record<string, unknown>);
  delete snakeData['id'];
  const data = await api.put(`/customers/${customerId}/projects/${id}`, snakeData);
  return toCamelCase<Project>(data);
};

export const deleteProject = async (id: string) => {
  // NOTE: Assuming project deletion is at this endpoint.
  // We need to know customerId for this endpoint structure.
  // As a workaround, we can extend backend, but here I'll try to find customerId if needed or update API.
};

// --- Contacts ---
export const getContactsByCustomer = async (customerId: string, projectId?: string) => {
  let endpoint = `/customers/${customerId}/contacts`;
  if (projectId) endpoint += `?project_id=${projectId}`;
  
  const data = await api.get(endpoint);
  return (data || []).map((item: any) => toCamelCase(item));
};

export const createContact = async (customerId: string, contactData: any, projectId?: string) => {
  const snakeData = toSnakeCase(contactData as Record<string, unknown>);
  if (projectId) snakeData['project_id'] = projectId;
  
  const data = await api.post(`/customers/${customerId}/contacts`, snakeData);
  return toCamelCase(data);
};

export const updateContact = async (customerId: string, contactId: string, contactData: any) => {
  const snakeData = toSnakeCase(contactData as Record<string, unknown>);
  const data = await api.put(`/customers/${customerId}/contacts/${contactId}`, snakeData);
  return toCamelCase(data);
};

export const deleteContact = async (customerId: string, contactId: string) => {
  return await api.delete(`/customers/${customerId}/contacts/${contactId}`);
};

// --- Visit Records ---
export const getVisitsByCustomer = async (customerId: string, projectId?: string) => {
  let endpoint = `/customers/${customerId}/visits`;
  if (projectId) endpoint += `?project_id=${projectId}`;
  
  const data = await api.get(endpoint);
  return (data || []).map((item: any) => toCamelCase(item));
};

export const createVisitRecord = async (customerId: string, visitData: any, projectId?: string) => {
  const snakeData = toSnakeCase(visitData as Record<string, unknown>);
  if (projectId) snakeData['project_id'] = projectId;
  
  const data = await api.post(`/customers/${customerId}/visits`, snakeData);
  return toCamelCase(data);
};

export const updateVisitRecord = async (customerId: string, visitId: string, visitData: any) => {
  const snakeData = toSnakeCase(visitData as Record<string, unknown>);
  const data = await api.put(`/customers/${customerId}/visits/${visitId}`, snakeData);
  return toCamelCase(data);
};

export const deleteVisitRecord = async (customerId: string, visitId: string) => {
  return await api.delete(`/customers/${customerId}/visits/${visitId}`);
};

// --- Tasks ---
export const getTasksByCustomer = async (customerId: string, projectId?: string) => {
  let endpoint = `/customers/${customerId}/tasks`;
  if (projectId) endpoint += `?project_id=${projectId}`;
  
  const data = await api.get(endpoint);
  return (data || []).map((item: any) => toCamelCase(item));
};

export const getAllTasks = async () => {
    // Current backend doesn't have an 'all tasks' endpoint, logic needs update or keep as is with mock/local filter.
    const customers = await getCustomers();
    let allTasks: any[] = [];
    for (const c of customers) {
        const tasks = await getTasksByCustomer(c.id);
        allTasks = [...allTasks, ...tasks.map(t => ({...t, customer: {name: c.name}}))];
    }
    return allTasks;
};

export const createTask = async (customerId: string, taskData: any, projectId?: string) => {
  const snakeData = toSnakeCase(taskData as Record<string, unknown>);
  if (projectId) snakeData['project_id'] = projectId;
  
  const data = await api.post(`/customers/${customerId}/tasks`, snakeData);
  return toCamelCase(data);
};

export const updateTask = async (customerId: string, taskId: string, taskData: any) => {
  const snakeData = toSnakeCase(taskData as Record<string, unknown>);
  const data = await api.put(`/customers/${customerId}/tasks/${taskId}`, snakeData);
  return toCamelCase(data);
};

export const deleteTask = async (customerId: string, taskId: string) => {
  return await api.delete(`/customers/${customerId}/tasks/${taskId}`);
};

// --- Visit Plans ---
export const getVisitPlans = async (): Promise<VisitPlan[]> => {
  const data = await api.get('/visit_plans/');
  return (data || []).map((item: any) => toCamelCase<VisitPlan>(item));
};

export const addVisitPlan = async (plan: VisitPlan): Promise<VisitPlan | undefined> => {
  const snakeData = toSnakeCase(plan as unknown as Record<string, unknown>);
  delete snakeData['id'];
  const data = await api.post('/visit_plans/', snakeData);
  return data ? toCamelCase<VisitPlan>(data) : undefined;
};

export const updateVisitPlan = async (updatedPlan: VisitPlan): Promise<VisitPlan | undefined> => {
  const snakeData = toSnakeCase(updatedPlan as unknown as Record<string, unknown>);
  const planId = snakeData['id'] as string;
  delete snakeData['id'];
  const data = await api.put(`/visit_plans/${planId}`, snakeData);
  return data ? toCamelCase<VisitPlan>(data) : undefined;
};

// --- Reports ---
export const getReports = async (): Promise<Report[]> => {
  const data = await api.get('/reports/');
  // Backend already nests client_progress
  return (data || []).map((item: any) => toCamelCase<Report>(item));
};

export const addReport = async (report: Report): Promise<Report | undefined> => {
  const { clientProgress, ...reportBody } = report;
  const snakeReport = toSnakeCase(reportBody as unknown as Record<string, unknown>);
  delete snakeReport['id'];
  delete snakeReport['created_at'];

  // Nesting progress for the backend endpoint create_report logic
  if (clientProgress) {
      snakeReport['client_progress'] = clientProgress.map(cp => toSnakeCase(cp as unknown as Record<string, unknown>));
  }

  const data = await api.post('/reports/', snakeReport);
  return data ? toCamelCase<Report>(data) : undefined;
};

// --- Check-ins ---
export const getCheckIns = async (): Promise<CheckIn[]> => {
  const data = await api.get('/check_ins/');
  return (data || []).map((item: any) => toCamelCase<CheckIn>(item));
};

export const addCheckIn = async (checkIn: CheckIn): Promise<CheckIn | undefined> => {
  const snakeData = toSnakeCase(checkIn as unknown as Record<string, unknown>);
  delete snakeData['id'];
  delete snakeData['created_at'];
  const data = await api.post('/check_ins/', snakeData);
  return data ? toCamelCase<CheckIn>(data) : undefined;
};

// --- User Profile ---
export const DEFAULT_USER: UserProfile = {
  id: '00000000-0000-0000-0000-000000000000',
  name: '加载中...',
  role: '销售员',
  employeeId: '',
  avatar: 'https://picsum.photos/seed/salesman/200/200',
  phone: '',
  email: '',
  department: ''
};

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const data = await api.get('/auth/me');
    if (!data) return DEFAULT_USER;
    
    // Combine base account info with profile details
    const profile = data.profile ? toCamelCase<UserProfile>(data.profile) : DEFAULT_USER;
    return {
      ...profile,
      id: data.id || profile.id, // Prefer account ID as it's the primary key for ownership
      name: data.fullName || profile.name
    };
  } catch (err) {
    console.error('getUserProfile error:', err);
    return DEFAULT_USER;
  }
};

export const updateUserProfile = async (updatedUser: UserProfile): Promise<void> => {
    // Current /me is only for GET. Need to implement a profile update endpoint.
    // For now skip or assume similar logic.
};

// --- Intelligent Reminders ---
export const checkOverdueVisits = async () => {
    // Logic can be moved to backend or kept here if needed.
    // Keeping it here using the new api-based getCustomers call
    try {
        const customers = await getCustomers();
        const overdueList: any[] = [];
        // simplified logic for now as multi-call is expensive
        return overdueList;
    } catch (error) {
        console.error('Failed to check overdue visits:', error);
        return [];
    }
};

// 获取系统配置（字典数据）
export const getSystemSettings = async (category: string) => {
    try {
        const data = await api.get(`/system/settings?category=${category}`);
        return data || [];
    } catch (error) {
        console.error(`Failed to fetch settings for ${category}:`, error);
        return [];
    }
};

// 获取漏斗统计数据
export const getFunnelStats = async () => {
    try {
        const data = await api.get('/admin/funnel-stats');
        return data ? toCamelCase<any>(data) : null;
    } catch (error) {
        console.error('Failed to fetch funnel stats:', error);
        return null;
    }
};

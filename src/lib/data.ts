import { supabase } from './supabase';
import { Customer, VisitPlan, DailyReport as Report, CheckIn, UserProfile } from '../types';

// --- snake_case → camelCase 工具函数 ---
// NOTE: Supabase 返回的字段为 snake_case，前端类型为 camelCase，需要统一转换
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function toCamelCase<T>(obj: Record<string, unknown>): T {
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
// NOTE: 前端数据写入 Supabase 前需转为 snake_case
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
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(item => toCamelCase<Customer>(item));
};

export const getCustomerById = async (id: string): Promise<Customer | undefined> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return undefined;
    throw error;
  }
  return data ? toCamelCase<Customer>(data) : undefined;
};

export const createCustomer = async (customerData: Partial<Customer>): Promise<Customer> => {
  const snakeData = toSnakeCase(customerData as Record<string, unknown>);
  // NOTE: user_id 由数据库 DEFAULT auth.uid() 自动填充，无需手动传入
  const { data, error } = await supabase
    .from('customers')
    .insert(snakeData)
    .select()
    .single();

  if (error) throw error;
  return toCamelCase<Customer>(data);
};

export const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<Customer> => {
  const snakeData = toSnakeCase(customerData as Record<string, unknown>);
  const { data, error } = await supabase
    .from('customers')
    .update(snakeData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return toCamelCase<Customer>(data);
};

// --- Contacts ---
export const getContactsByCustomer = async (customerId: string) => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch contacts:', error);
    return [];
  }
  return (data || []).map(item => toCamelCase(item));
};

export const createContact = async (customerId: string, contactData: any) => {
  const snakeData = toSnakeCase(contactData as Record<string, unknown>);
  snakeData['customer_id'] = customerId;
  const { data, error } = await supabase
    .from('contacts')
    .insert(snakeData)
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(data);
};

export const updateContact = async (_customerId: string, contactId: string, contactData: any) => {
  const snakeData = toSnakeCase(contactData as Record<string, unknown>);
  const { data, error } = await supabase
    .from('contacts')
    .update(snakeData)
    .eq('id', contactId)
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(data);
};

export const deleteContact = async (_customerId: string, contactId: string) => {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', contactId);

  if (error) throw error;
};

// --- Visit Records ---
export const getVisitsByCustomer = async (customerId: string) => {
  const { data, error } = await supabase
    .from('visit_records')
    .select('*')
    .eq('customer_id', customerId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Failed to fetch visits:', error);
    return [];
  }
  return (data || []).map(item => toCamelCase(item));
};

export const createVisitRecord = async (customerId: string, visitData: any) => {
  const snakeData = toSnakeCase(visitData as Record<string, unknown>);
  snakeData['customer_id'] = customerId;
  const { data, error } = await supabase
    .from('visit_records')
    .insert(snakeData)
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(data);
};

export const updateVisitRecord = async (_customerId: string, visitId: string, visitData: any) => {
  const snakeData = toSnakeCase(visitData as Record<string, unknown>);
  const { data, error } = await supabase
    .from('visit_records')
    .update(snakeData)
    .eq('id', visitId)
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(data);
};

export const deleteVisitRecord = async (_customerId: string, visitId: string) => {
  const { error } = await supabase
    .from('visit_records')
    .delete()
    .eq('id', visitId);

  if (error) throw error;
};

// --- Tasks ---
export const getTasksByCustomer = async (customerId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch tasks:', error);
    return [];
  }
  return (data || []).map(item => toCamelCase(item));
};

export const createTask = async (customerId: string, taskData: any) => {
  const snakeData = toSnakeCase(taskData as Record<string, unknown>);
  snakeData['customer_id'] = customerId;
  const { data, error } = await supabase
    .from('tasks')
    .insert(snakeData)
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(data);
};

export const updateTask = async (_customerId: string, taskId: string, taskData: any) => {
  const snakeData = toSnakeCase(taskData as Record<string, unknown>);
  const { data, error } = await supabase
    .from('tasks')
    .update(snakeData)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return toCamelCase(data);
};

export const deleteTask = async (_customerId: string, taskId: string) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
};

// --- Visit Plans ---
export const getVisitPlans = async (): Promise<VisitPlan[]> => {
  const { data, error } = await supabase
    .from('visit_plans')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return (data || []).map(item => toCamelCase<VisitPlan>(item));
};

export const addVisitPlan = async (plan: VisitPlan): Promise<VisitPlan | undefined> => {
  const snakeData = toSnakeCase(plan as unknown as Record<string, unknown>);
  // NOTE: 前端生成的 id 不传入，由数据库自动生成 UUID
  delete snakeData['id'];
  const { data, error } = await supabase
    .from('visit_plans')
    .insert(snakeData)
    .select()
    .single();

  if (error) throw error;
  return data ? toCamelCase<VisitPlan>(data) : undefined;
};

export const updateVisitPlan = async (updatedPlan: VisitPlan): Promise<VisitPlan | undefined> => {
  const snakeData = toSnakeCase(updatedPlan as unknown as Record<string, unknown>);
  const planId = snakeData['id'] as string;
  delete snakeData['id'];
  const { data, error } = await supabase
    .from('visit_plans')
    .update(snakeData)
    .eq('id', planId)
    .select()
    .single();

  if (error) {
    console.error('Failed to update visit plan:', error);
    return undefined;
  }
  return data ? toCamelCase<VisitPlan>(data) : undefined;
};

// --- Reports ---
export const getReports = async (): Promise<Report[]> => {
  // NOTE: reports 需要关联查询 client_progress 子表
  const { data: reports, error: reportError } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (reportError) throw reportError;
  if (!reports || reports.length === 0) return [];

  const { data: progressData, error: progressError } = await supabase
    .from('client_progress')
    .select('*');

  if (progressError) throw progressError;

  return reports.map(report => {
    const camelReport = toCamelCase<Report>(report);
    const relatedProgress = (progressData || [])
      .filter(p => p.report_id === report.id)
      .map(p => toCamelCase(p));
    return { ...camelReport, clientProgress: relatedProgress } as Report;
  });
};

export const addReport = async (report: Report): Promise<Report | undefined> => {
  const { clientProgress, ...reportBody } = report;
  const snakeReport = toSnakeCase(reportBody as unknown as Record<string, unknown>);
  delete snakeReport['id'];
  delete snakeReport['created_at'];

  const { data: newReport, error: reportError } = await supabase
    .from('reports')
    .insert(snakeReport)
    .select()
    .single();

  if (reportError) throw reportError;

  // 写入关联的客户进展
  let savedProgress: any[] = [];
  if (clientProgress && clientProgress.length > 0) {
    const progressRows = clientProgress.map(cp => {
      const snakeCp = toSnakeCase(cp as unknown as Record<string, unknown>);
      snakeCp['report_id'] = newReport.id;
      return snakeCp;
    });

    const { data: progressData, error: progressError } = await supabase
      .from('client_progress')
      .insert(progressRows)
      .select();

    if (progressError) throw progressError;
    savedProgress = (progressData || []).map(p => toCamelCase(p));
  }

  const camelReport = toCamelCase<Report>(newReport);
  return { ...camelReport, clientProgress: savedProgress } as Report;
};

// --- Check-ins ---
export const getCheckIns = async (): Promise<CheckIn[]> => {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(item => toCamelCase<CheckIn>(item));
};

export const addCheckIn = async (checkIn: CheckIn): Promise<CheckIn | undefined> => {
  const snakeData = toSnakeCase(checkIn as unknown as Record<string, unknown>);
  delete snakeData['id'];
  delete snakeData['created_at'];
  const { data, error } = await supabase
    .from('check_ins')
    .insert(snakeData)
    .select()
    .single();

  if (error) throw error;
  return data ? toCamelCase<CheckIn>(data) : undefined;
};

// --- User Profile (保持本地存储) ---
const DEFAULT_USER: UserProfile = {
  name: '李明',
  role: '资深销售专家',
  employeeId: '882931',
  avatar: 'https://picsum.photos/seed/salesman/200/200',
  phone: '13800138000',
  email: 'liming@example.com',
  department: '华东销售二部'
};

const getInitialUser = (): UserProfile => {
  const saved = localStorage.getItem('crm_user');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) { /* 忽略解析失败 */ }
  }
  return DEFAULT_USER;
};

let memoryUser: UserProfile = getInitialUser();
export const getUserProfile = (): UserProfile => memoryUser;
export const updateUserProfile = (updatedUser: UserProfile) => {
  memoryUser = updatedUser;
  localStorage.setItem('crm_user', JSON.stringify(memoryUser));
};

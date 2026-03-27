import { supabase } from './supabase';
import { Customer, Project, VisitPlan, DailyReport as Report, CheckIn, UserProfile } from '../types';

// --- snake_case → camelCase 工具函数 ---
// NOTE: Supabase 返回的字段为 snake_case，前端类型为 camelCase，需要统一转换
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
  if (!id) throw new Error('Customer ID is missing');
  
  // Only include fields that match the database schema
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
  
  const { data, error } = await supabase
    .from('customers')
    .update(snakeData)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Database error in updateCustomer:', error);
    throw error;
  }
  
  if (!data) {
    // Check if the record exists at all to differentiate between RLS and "record not found"
    const { count, error: checkError } = await supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('id', id);
    
    if (checkError) {
      throw new Error(`无法验证记录是否存在: ${checkError.message}`);
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id || 'Unknown';
    
    if (count === 0) {
      throw new Error(`未找到 ID 为 ${id} 的客户记录。可能已被删除。搜索 ID: ${id}`);
    } else {
      throw new Error(`权限不足或记录归属错误。当前登录用户 ID: ${currentUserId}，该记录虽可查看但无法以此 ID 更新。请尝试重新登录或检查数据库 user_id 字段。`);
    }
  }
  
  return toCamelCase<Customer>(data);
};

// --- Projects ---
export const getProjectsByCustomer = async (customerId: string): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(item => toCamelCase<Project>(item));
};

export const createProject = async (projectData: Partial<Project>): Promise<Project> => {
  const snakeData = toSnakeCase(projectData as Record<string, unknown>);
  const { data, error } = await supabase
    .from('projects')
    .insert(snakeData)
    .select()
    .single();

  if (error) throw error;
  return toCamelCase<Project>(data);
};

export const updateProject = async (id: string, projectData: Partial<Project>): Promise<Project> => {
  const snakeData = toSnakeCase(projectData as Record<string, unknown>);
  delete snakeData['id'];
  const { data, error } = await supabase
    .from('projects')
    .update(snakeData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return toCamelCase<Project>(data);
};

export const deleteProject = async (id: string) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// --- Contacts ---
export const getContactsByCustomer = async (customerId: string, projectId?: string) => {
  let query = supabase
    .from('contacts')
    .select('*')
    .eq('customer_id', customerId);
  
  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch contacts:', error);
    return [];
  }
  return (data || []).map(item => toCamelCase(item));
};

export const createContact = async (customerId: string, contactData: any, projectId?: string) => {
  const snakeData = toSnakeCase(contactData as Record<string, unknown>);
  snakeData['customer_id'] = customerId;
  if (projectId) snakeData['project_id'] = projectId;
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
export const getVisitsByCustomer = async (customerId: string, projectId?: string) => {
  let query = supabase
    .from('visit_records')
    .select('*')
    .eq('customer_id', customerId);

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query.order('date', { ascending: false });

  if (error) {
    console.error('Failed to fetch visits:', error);
    return [];
  }
  return (data || []).map(item => toCamelCase(item));
};

export const createVisitRecord = async (customerId: string, visitData: any, projectId?: string) => {
  const snakeData = toSnakeCase(visitData as Record<string, unknown>);
  snakeData['customer_id'] = customerId;
  if (projectId) snakeData['project_id'] = projectId;
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
export const getTasksByCustomer = async (customerId: string, projectId?: string) => {
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('customer_id', customerId);

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch tasks:', error);
    return [];
  }
  return (data || []).map(item => toCamelCase(item));
};

export const getAllTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, customer:customers(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch all tasks:', error);
    return [];
  }
  return (data || []).map(item => toCamelCase(item));
};

export const createTask = async (customerId: string, taskData: any, projectId?: string) => {
  const snakeData = toSnakeCase(taskData as Record<string, unknown>);
  snakeData['customer_id'] = customerId;
  if (projectId) snakeData['project_id'] = projectId;
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

// --- User Profile (数据库持久化) ---
export const DEFAULT_USER: UserProfile = {
  id: '00000000-0000-0000-0000-000000000000',
  name: '李明',
  role: '资深销售专家',
  employeeId: '882931',
  avatar: 'https://picsum.photos/seed/salesman/200/200',
  phone: '13800138000',
  email: 'liming@example.com',
  department: '华东销售二部'
};

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return DEFAULT_USER;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) {
      console.warn('Failed to fetch profile from DB, using fallback:', error);
      return DEFAULT_USER;
    }

    return toCamelCase<UserProfile>(data);
  } catch (err) {
    console.error('getUserProfile error:', err);
    return DEFAULT_USER;
  }
};

export const updateUserProfile = async (updatedUser: UserProfile): Promise<void> => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const snakeData = toSnakeCase(updatedUser as unknown as Record<string, unknown>);
    // 保护 ID 不被修改
    delete snakeData['id'];
    
    const { error } = await supabase
      .from('profiles')
      .update(snakeData)
      .eq('id', authUser.id);

    if (error) throw error;

    // 同时更新 Auth Metadata 以保持兼容
    await supabase.auth.updateUser({
      data: { full_name: updatedUser.name }
    });

  } catch (err) {
    console.error('updateUserProfile error:', err);
    throw err;
  }
};

// --- Intelligent Reminders ---
export const checkOverdueVisits = async () => {
  try {
    const customers = await getCustomers();
    const { data: allVisits, error: visitError } = await supabase
      .from('visit_records')
      .select('customer_id, date')
      .order('date', { ascending: false });

    if (visitError) throw visitError;

    const { data: allTasks, error: taskError } = await supabase
      .from('tasks')
      .select('customer_id, title, status')
      .eq('status', 'pending');

    if (taskError) throw taskError;

    const today = new Date();
    const overdueList: any[] = [];

    for (const customer of customers) {
      if (customer.level === 'A') continue; // A类暂时没规定，保持关注即可

      const threshold = customer.level === 'B' ? 10 : customer.level === 'C' ? 30 : 90;
      
      // Get latest visit for this customer
      const customerVisits = (allVisits || []).filter(v => v.customer_id === customer.id);
      let lastVisitDate: Date | null = null;
      
      if (customerVisits.length > 0) {
        lastVisitDate = new Date(customerVisits[0].date);
      } else {
        // No visit yet, use created_at if available or assume very old
        // For simplicity, if no visit, we consider it overdue if it's an old customer
        // But let's just say if no visit, it's not "overdue" in the sense of "last visit frequency"
        // User might want to visit them anyway. 
        continue; 
      }

      const diffTime = Math.abs(today.getTime() - lastVisitDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > threshold) {
        // Overdue found
        overdueList.push({
          ...customer,
          daysSinceLastVisit: diffDays,
          threshold
        });

        // Check if task already exists
        const taskTitle = `逾期拜访提醒：${customer.name}`;
        const taskExists = (allTasks || []).some(t => t.customer_id === customer.id && t.title === taskTitle);

        if (!taskExists) {
          await createTask(customer.id, {
            title: taskTitle,
            deadline: new Date(today.getTime() + 86400000).toISOString().split('T')[0], // Tomorrow
            status: 'pending'
          });
        }
      }
    }

    return overdueList;
  } catch (error) {
    console.error('Failed to check overdue visits:', error);
    return [];
  }
};

// --- System Settings ---
export const getSystemSettings = async (category: string) => {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .eq('category', category)
    .order('sort_order', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

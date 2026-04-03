import { api } from '../../lib/api';
import { Customer, Project, VisitPlan, DailyReport as Report, CheckIn, UserProfile, Contact, VisitRecord, Task } from '../../types';

// Utility for mapping snake_case to camelCase
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function toCamelCase<T>(obj: any): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(v => toCamelCase(v)) as any;

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

// -----------------------------------------
// Admin API Methods (fetching all users' data)
// -----------------------------------------

export const getAllProfiles = async (): Promise<UserProfile[]> => {
  const data = await api.get('/admin/users');
  return (data || []).map((item: any) => toCamelCase<UserProfile>(item));
};

export const getAllCustomers = async (): Promise<Customer[]> => {
  const [customers, profiles] = await Promise.all([
    api.get('/admin/customers'),
    getAllProfiles()
  ]);

  const profileMap = new Map(profiles.map(p => [p.id, p.name]));

  return (customers || []).map((item: any) => {
    const camel = toCamelCase<Customer>(item);
    if (item.user_id && profileMap.has(item.user_id)) {
      (camel as any).ownerName = profileMap.get(item.user_id);
    } else {
      (camel as any).ownerName = '未知人员';
    }
    return camel;
  });
};

export const getCustomerDetail = async (id: string): Promise<any> => {
  const data = await api.get(`/admin/customers/${id}`);
  return {
    customer: toCamelCase<Customer>(data.customer),
    ownerName: data.owner_name
  };
};

export const getCustomerContacts = async (id: string): Promise<Contact[]> => {
  const data = await api.get(`/admin/customers/${id}/contacts`);
  return (data || []).map((item: any) => toCamelCase<Contact>(item));
};

export const getCustomerVisits = async (id: string): Promise<VisitRecord[]> => {
  const data = await api.get(`/admin/customers/${id}/visits`);
  return (data || []).map((item: any) => toCamelCase<VisitRecord>(item));
};

export const getCustomerTasks = async (id: string): Promise<Task[]> => {
  const data = await api.get(`/admin/customers/${id}/tasks`);
  return (data || []).map((item: any) => toCamelCase<Task>(item));
};

export const getAllProjects = async (): Promise<Project[]> => {
  const data = await api.get('/admin/projects'); // I need to make sure I added this endpoint!
  return (data || []).map((item: any) => toCamelCase<Project>(item));
};

export const getAllReports = async (): Promise<Report[]> => {
  const [reports, profiles] = await Promise.all([
    api.get('/admin/reports'),
    getAllProfiles()
  ]);

  if (!reports || reports.length === 0) return [];

  const profileMap = new Map(profiles.map(p => [p.id, p.name]));

  return reports.map((report: any) => {
    const camelReport = toCamelCase<Report>(report);
    if (report.userId && profileMap.has(report.userId)) {
      (camelReport as any).ownerName = profileMap.get(report.userId);
    }
    return camelReport;
  });
};

export const getAllCheckIns = async (): Promise<CheckIn[]> => {
  const [data, profiles] = await Promise.all([
    api.get('/admin/checkins'),
    getAllProfiles()
  ]);

  const profileMap = new Map(profiles.map(p => [p.id, p.name]));
  
  return (data || []).map((item: any) => {
    const camel = toCamelCase<CheckIn>(item);
    if (item.user_id && profileMap.has(item.user_id)) {
      (camel as any).ownerName = profileMap.get(item.user_id);
    }
    return camel;
  });
};

export const getDashboardStats = async () => {
  try {
     const data = await api.get('/admin/stats');
     return {
       totalCustomers: data.total_customers,
       customersA: data.customers_a,
       customersB: data.customers_b,
       customersC: data.customers_c,
       customersD: data.customers_d,
       totalProjects: data.total_projects,
       totalCheckIns: data.total_check_ins,
     };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return null;
  }
};

export const getFunnelStats = async () => {
  try {
    const data = await api.get('/admin/funnel-stats');
    return toCamelCase<any>(data);
  } catch (error) {
    console.error("Funnel stats error:", error);
    return null;
  }
};

// --- System Settings Management ---

export const getSystemSettings = async (category: string) => {
  return await api.get(`/admin/settings?category=${category}`);
};

export const addSystemSetting = async (category: string, label: string, value: string, sortOrder: number = 0) => {
  return await api.post(`/admin/settings`, { category, label, value, sort_order: sortOrder });
};

export const updateSystemSetting = async (id: string | number, updates: any) => {
  return await api.put(`/admin/settings/${id}`, updates);
};

export const deleteSystemSetting = async (id: string | number) => {
  return await api.delete(`/admin/settings/${id}`);
};

// --- Sales Account Management ---

export const getSalesAccounts = async () => {
  return await api.get('/admin/sales-accounts');
};

export const createSalesAccount = async (username: string, fullName: string) => {
  return await api.post('/admin/sales-accounts', { username, full_name: fullName });
};

export const updateSalesAccount = async (userId: string, updates: any) => {
  // Map camelCase to snake_case for backend
  const body: any = {};
  if (updates.username !== undefined) body.username = updates.username;
  if (updates.fullName !== undefined) body.full_name = updates.fullName;
  if (updates.isActive !== undefined) body.is_active = updates.isActive;
  
  return await api.put(`/admin/sales-accounts/${userId}`, body);
};

export const deleteSalesAccount = async (userId: string) => {
  return await api.delete(`/admin/sales-accounts/${userId}`);
};

export const resetSalesAccountPassword = async (userId: string) => {
  return await api.post(`/admin/sales-accounts/${userId}/reset-password`, {});
};

export const bulkTransferCustomers = async (customerIds: string[], targetUserId: string) => {
  return await api.post('/admin/customers/transfer', {
    customer_ids: customerIds,
    target_user_id: targetUserId
  });
};

export const bulkReleaseCustomers = async (customerIds: string[]) => {
  return await api.post('/admin/customers/release', {
    customer_ids: customerIds
  });
};

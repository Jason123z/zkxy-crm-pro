import { supabase } from '../../lib/supabase';
import { Customer, Project, VisitPlan, DailyReport as Report, CheckIn, UserProfile } from '../../types';

// Utility for mapping snake_case to camelCase
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

// -----------------------------------------
// Admin API Methods (fetching all users' data)
// -----------------------------------------

export const getAllProfiles = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw error;
  return (data || []).map(item => toCamelCase<UserProfile>(item));
};

export const getAllCustomers = async (): Promise<Customer[]> => {
  const [{ data: customers, error: custError }, profiles] = await Promise.all([
    supabase.from('customers').select('*').order('created_at', { ascending: false }),
    getAllProfiles()
  ]);

  if (custError) throw custError;
  
  const profileMap = new Map(profiles.map(p => [p.id, p.name]));

  return (customers || []).map(item => {
    const camel = toCamelCase<Customer>(item);
    // Add real owner name from profiles map
    if (item.user_id && profileMap.has(item.user_id)) {
      (camel as any).ownerName = profileMap.get(item.user_id);
    } else {
      (camel as any).ownerName = '未知人员';
    }
    return camel;
  });
};

export const getAllProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(item => toCamelCase<Project>(item));
};

export const getAllReports = async (): Promise<Report[]> => {
  const [{ data: reports, error: reportError }, profiles] = await Promise.all([
    supabase.from('reports').select('*').order('created_at', { ascending: false }),
    getAllProfiles()
  ]);

  if (reportError) throw reportError;
  if (!reports || reports.length === 0) return [];

  const profileMap = new Map(profiles.map(p => [p.id, p.name]));
  const { data: progressData, error: progressError } = await supabase
    .from('client_progress')
    .select('*');

  if (progressError) throw progressError;

  return reports.map(report => {
    const camelReport = toCamelCase<Report>(report);
    if (report.user_id && profileMap.has(report.user_id)) {
      (camelReport as any).ownerName = profileMap.get(report.user_id);
    }
    const relatedProgress = (progressData || [])
      .filter(p => p.report_id === report.id)
      .map(p => toCamelCase(p));
    return { ...camelReport, clientProgress: relatedProgress } as Report;
  });
};

export const getAllCheckIns = async (): Promise<CheckIn[]> => {
  const [{ data, error }, profiles] = await Promise.all([
    supabase.from('check_ins').select('*').order('created_at', { ascending: false }),
    getAllProfiles()
  ]);

  if (error) throw error;
  const profileMap = new Map(profiles.map(p => [p.id, p.name]));
  
  return (data || []).map(item => {
    const camel = toCamelCase<CheckIn>(item);
    if (item.user_id && profileMap.has(item.user_id)) {
      (camel as any).ownerName = profileMap.get(item.user_id);
    }
    return camel;
  });
};

export const getDashboardStats = async () => {
  try {
     console.log("Dashboard stats: Starting data fetch...");
     const [customers, projects, checkIns] = await Promise.all([
        getAllCustomers(),
        getAllProjects(),
        getAllCheckIns()
     ]);
     console.log("Dashboard stats: Fetch complete.", { customers: customers.length, projects: projects.length, checkIns: checkIns.length });

    if (customers.length === 0) {
      console.warn("No customers found. This might be due to Supabase RLS policies blocking access.");
    }

    return {
      totalCustomers: customers.length,
      customersA: customers.filter(c => c.level === 'A').length,
      customersB: customers.filter(c => c.level === 'B').length,
      customersC: customers.filter(c => c.level === 'C').length,
      customersD: customers.filter(c => c.level === 'D').length,
      totalProjects: projects.length,
      totalCheckIns: checkIns.length,
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return null;
  }
};

// --- System Settings Management ---

export const getSystemSettings = async (category: string) => {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .eq('category', category)
    .order('sort_order', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const addSystemSetting = async (category: string, label: string, value: string, sortOrder: number = 0) => {
  const { data, error } = await supabase
    .from('system_settings')
    .insert([
      { category, label, value, sort_order: sortOrder }
    ])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateSystemSetting = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('system_settings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteSystemSetting = async (id: string) => {
  const { error } = await supabase
    .from('system_settings')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};


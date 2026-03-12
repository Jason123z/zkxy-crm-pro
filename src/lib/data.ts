import axios from 'axios';
import { Customer, VisitPlan, DailyReport as Report, CheckIn, UserProfile } from '../types';
import { supabase } from './supabase';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// --- Axios Configuration ---
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Auth Interceptor ---
apiClient.interceptors.request.use(async (config) => {
  console.log(`Sending request to: ${config.url}`);
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
      console.log('Auth token added to request');
    } else {
      console.warn('No active session found');
    }
  } catch (err) {
    console.error('Error fetching session:', err);
  }
  return config;
}, (error) => {
  console.error('Request Interceptor Error:', error);
  return Promise.reject(error);
});

// --- Response Interceptor ---
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('API Error details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const getCustomers = async (): Promise<Customer[]> => {
  const response = await apiClient.get('/customers');
  return response.data;
};

export const getCustomerById = async (id: string): Promise<Customer | undefined> => {
  const response = await apiClient.get(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (data: Partial<Customer>): Promise<Customer> => {
    const response = await apiClient.post('/customers', data);
    return response.data;
};

export const updateCustomer = async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const response = await apiClient.put(`/customers/${id}`, data);
    return response.data;
};

// --- Contacts ---
export const getContactsByCustomer = async (customerId: string) => {
    try {
        const response = await apiClient.get(`/customers/${customerId}/contacts`);
        return response.data;
    } catch(e) {
        console.error('Failed to fetch contacts:', e);
        return [];
    }
}

export const createContact = async (customerId: string, data: any) => {
    const response = await apiClient.post(`/customers/${customerId}/contacts`, data);
    return response.data;
}

export const updateContact = async (customerId: string, contactId: string, data: any) => {
    const response = await apiClient.put(`/customers/${customerId}/contacts/${contactId}`, data);
    return response.data;
}

export const deleteContact = async (customerId: string, contactId: string) => {
    await apiClient.delete(`/customers/${customerId}/contacts/${contactId}`);
}

// --- Visit Records ---
export const getVisitsByCustomer = async (customerId: string) => {
    try {
        const response = await apiClient.get(`/customers/${customerId}/visits`);
        return response.data;
    } catch(e) {
        console.error('Failed to fetch visits:', e);
        return [];
    }
}

export const createVisitRecord = async (customerId: string, data: any) => {
    const response = await apiClient.post(`/customers/${customerId}/visits`, data);
    return response.data;
}

export const updateVisitRecord = async (customerId: string, visitId: string, data: any) => {
    const response = await apiClient.put(`/customers/${customerId}/visits/${visitId}`, data);
    return response.data;
}

export const deleteVisitRecord = async (customerId: string, visitId: string) => {
    await apiClient.delete(`/customers/${customerId}/visits/${visitId}`);
}

// --- Tasks ---
export const getTasksByCustomer = async (customerId: string) => {
    try {
        const response = await apiClient.get(`/customers/${customerId}/tasks`);
        return response.data;
    } catch(e) {
        console.error('Failed to fetch tasks:', e);
        return [];
    }
}

export const createTask = async (customerId: string, data: any) => {
    const response = await apiClient.post(`/customers/${customerId}/tasks`, data);
    return response.data;
}

export const updateTask = async (customerId: string, taskId: string, data: any) => {
    const response = await apiClient.put(`/customers/${customerId}/tasks/${taskId}`, data);
    return response.data;
}

export const deleteTask = async (customerId: string, taskId: string) => {
    await apiClient.delete(`/customers/${customerId}/tasks/${taskId}`);
}

// --- Visit Plans ---
export const getVisitPlans = async (): Promise<VisitPlan[]> => {
  const response = await apiClient.get('/visit_plans');
  return response.data;
};

export const addVisitPlan = async (plan: VisitPlan): Promise<VisitPlan | undefined> => {
  const response = await apiClient.post('/visit_plans', plan);
  return response.data;
};

export const updateVisitPlan = async (updatedPlan: VisitPlan): Promise<VisitPlan | undefined> => {
  try {
    const response = await apiClient.put(`/visit_plans/${updatedPlan.id}`, updatedPlan);
    return response.data;
  } catch (e) {
    console.error('Failed to update visit plan:', e);
    return undefined;
  }
};

// --- Reports ---
export const getReports = async (): Promise<Report[]> => {
  const response = await apiClient.get('/reports');
  return response.data;
};

export const addReport = async (report: Report): Promise<Report | undefined> => {
  const response = await apiClient.post('/reports', report);
  return response.data;
};

// --- Check-ins ---
export const getCheckIns = async (): Promise<CheckIn[]> => {
  const response = await apiClient.get('/check_ins');
  return response.data;
};

export const addCheckIn = async (checkIn: CheckIn): Promise<CheckIn | undefined> => {
  const response = await apiClient.post('/check_ins', checkIn);
  return response.data;
};

// --- User Profile (Keep Local Temporary) ---
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
    } catch (e) {}
  }
  return DEFAULT_USER;
};

let memoryUser: UserProfile = getInitialUser();
export const getUserProfile = (): UserProfile => memoryUser;
export const updateUserProfile = (updatedUser: UserProfile) => {
  memoryUser = updatedUser;
  localStorage.setItem('crm_user', JSON.stringify(memoryUser));
};

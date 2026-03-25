export type CustomerLevel = 'A' | 'B' | 'C' | 'D';

export interface Customer {
  id: string;
  name: string;
  level: CustomerLevel;
  industry: string;
  size: string;
  address: string;
  status: string;
  budgetLevel?: string;
  budgetAmount?: number;
  product?: string;
  description?: string;
  concerns?: string;
  solution?: string;
  competitors?: string;
  userId?: string;
  statusUpdatedAt?: string;
  source?: string;
}

export interface Project {
  id: string;
  customerId: string;
  name: string;
  status?: string;
  product?: string;
  budgetLevel?: string;
  budgetAmount?: number;
  description?: string;
  concerns?: string;
  solution?: string;
  competitors?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VisitRecord {
  id: string;
  customerId?: string;
  projectId?: string;
  type: string;
  title: string;
  date: string;
  content: string;
}

export interface Contact {
  id: string;
  customerId?: string;
  projectId?: string;
  name: string;
  role: string;
  decisionRole?: string;
  isKey: boolean;
  phone?: string;
  email?: string;
  avatar: string;
}

export interface Task {
  id: string;
  customerId?: string;
  projectId?: string;
  title: string;
  deadline: string;
  status: 'pending' | 'planned' | 'completed';
}

export interface ClientProgress {
  customerId: string;
  customerName: string;
  status: string;
  progress: string;
}

export interface DailyReport {
  id: string;
  type: 'daily' | 'weekly';
  date: string; // For daily: "YYYY-MM-DD", For weekly: "YYYY-MM-DD to YYYY-MM-DD"
  summary: string;
  nextPlan: string;
  clientProgress?: ClientProgress[];
  createdAt: string;
  userId?: string;
}

export interface VisitPlan {
  id: string;
  customer: string;
  time: string;
  date: string;
  type: string;
  completed: boolean;
  address?: string;
}

export interface CheckIn {
  id: string;
  customer: string;
  type: string;
  time: string;
  date: string;
  location: string;
  photo?: string;
  notes?: string;
  createdAt: string;
  userId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  employeeId: string;
  avatar: string;
  phone?: string;
  email?: string;
  department?: string;
}

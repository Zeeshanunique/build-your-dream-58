// SQLite API service for communicating with the Node.js backend
const API_BASE_URL = 'http://localhost:3001/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'therapist' | 'parent' | 'child';
  created_at: string;
}

export interface Patient {
  id: number;
  name: string;
  age: number;
  condition: string;
  therapist_id: number;
  parent_id?: number;
  progress: number;
  trend: 'improving' | 'stable' | 'declining';
  status: 'active' | 'inactive' | 'completed';
  last_session: string;
  next_session: string;
  completed_sessions: number;
  total_sessions: number;
  parent_info?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  therapist_name?: string;
  parent_name?: string;
}

export interface TherapySession {
  id: number;
  patient_id: number;
  therapist_id: number;
  session_date: string;
  duration_minutes: number;
  session_type: string;
  progress_score: number;
  notes: string;
  created_at: string;
  therapist_name?: string;
}

export interface KPIMetrics {
  id: number;
  patient_id: number;
  metric_type: string;
  metric_value: number;
  measurement_date: string;
  session_id?: number;
}

export interface EEGReading {
  id: number;
  patient_id: number;
  session_id: number;
  timestamp: string;
  alpha_waves: number;
  beta_waves: number;
  theta_waves: number;
  delta_waves: number;
  attention_level: number;
  focus_score: number;
}

export interface Report {
  id: number;
  therapist_id: number;
  patient_id: number;
  report_type: string;
  title: string;
  content: string;
  status: 'generating' | 'ready' | 'error';
  data: string;
  created_at: string;
  patient_name?: string;
}

class SQLiteAPIService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // User methods
  async login(email: string, password: string): Promise<User> {
    return this.request<User>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string, role: 'therapist' | 'parent' | 'child'): Promise<User> {
    return this.request<User>('/users/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  // Patient methods
  async getPatients(): Promise<Patient[]> {
    return this.request<Patient[]>('/patients');
  }

  async createPatient(patientData: Partial<Patient>): Promise<{ id: number }> {
    return this.request<{ id: number }>('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  }

  // Session methods
  async getPatientSessions(patientId: number): Promise<TherapySession[]> {
    return this.request<TherapySession[]>(`/sessions/${patientId}`);
  }

  // KPI methods
  async getPatientKPIs(patientId: number): Promise<KPIMetrics[]> {
    return this.request<KPIMetrics[]>(`/kpis/${patientId}`);
  }

  // EEG methods
  async getEEGData(patientId: number, sessionId?: number): Promise<EEGReading[]> {
    const query = sessionId ? `?sessionId=${sessionId}` : '';
    return this.request<EEGReading[]>(`/eeg/${patientId}${query}`);
  }

  // Report methods
  async getReports(therapistId: number): Promise<Report[]> {
    return this.request<Report[]>(`/reports/${therapistId}`);
  }

  // Demo login for quick access
  async quickLogin(role: 'therapist' | 'parent' | 'child'): Promise<User> {
    const demoUsers = {
      therapist: { email: 'sarah.johnson@cognicare.com', password: 'demo123' },
      parent: { email: 'jennifer.smith@email.com', password: 'demo123' },
      child: { email: 'child@demo.com', password: 'demo123' }
    };

    const demoUser = demoUsers[role];
    return this.login(demoUser.email, demoUser.password);
  }
}

// Export singleton instance
export const sqliteAPI = new SQLiteAPIService();
export default sqliteAPI;

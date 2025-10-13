// IndexedDB wrapper for browser-based database storage
// Local, browser-based database using IndexedDB

const DB_NAME = 'CogniCareDB';
const DB_VERSION = 1;

export interface Patient {
  id?: number;
  name: string;
  age: number;
  condition: string;
  therapist_id: number;
  parent_id?: number;
  progress: number;
  trend: 'improving' | 'stable' | 'declining';
  status: 'active' | 'inactive' | 'completed';
  lastSession: string;
  nextSession: string;
  completedSessions: number;
  totalSessions: number;
  parentInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TherapySession {
  id?: number;
  patient_id: number;
  therapist_id: number;
  session_date: string;
  duration_minutes: number;
  session_type: string;
  progress_score: number;
  notes: string;
  created_at: string;
}

export interface KPIMetrics {
  id?: number;
  patient_id: number;
  metric_type: string;
  metric_value: number;
  measurement_date: string;
  session_id?: number;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: 'therapist' | 'parent' | 'child';
  created_at: string;
}

export interface EEGReading {
  id?: number;
  patient_id: number;
  session_id: number;
  timestamp: string;
  alpha_waves: number;
  beta_waves: number;
  theta_waves: number;
  delta_waves: number;
  gamma_waves: number;
  attention_level: number;
  focus_score: number;
}

export interface Report {
  id?: number;
  patient_id: string;
  therapist_id: number;
  type: 'progress' | 'eeg' | 'insurance';
  title: string;
  status: 'generating' | 'ready' | 'error';
  data: any;
  created_at: string;
}

class IndexedDBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
          userStore.createIndex('email', 'email', { unique: true });
        }

        if (!db.objectStoreNames.contains('patients')) {
          const patientStore = db.createObjectStore('patients', { keyPath: 'id', autoIncrement: true });
          patientStore.createIndex('therapist_id', 'therapist_id', { unique: false });
        }

        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
          sessionStore.createIndex('patient_id', 'patient_id', { unique: false });
          sessionStore.createIndex('therapist_id', 'therapist_id', { unique: false });
        }

        if (!db.objectStoreNames.contains('kpi_metrics')) {
          const kpiStore = db.createObjectStore('kpi_metrics', { keyPath: 'id', autoIncrement: true });
          kpiStore.createIndex('patient_id', 'patient_id', { unique: false });
        }

        if (!db.objectStoreNames.contains('eeg_readings')) {
          const eegStore = db.createObjectStore('eeg_readings', { keyPath: 'id', autoIncrement: true });
          eegStore.createIndex('patient_id', 'patient_id', { unique: false });
          eegStore.createIndex('session_id', 'session_id', { unique: false });
        }

        if (!db.objectStoreNames.contains('reports')) {
          const reportStore = db.createObjectStore('reports', { keyPath: 'id', autoIncrement: true });
          reportStore.createIndex('therapist_id', 'therapist_id', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // Generic CRUD operations
  async add<T>(storeName: string, data: T): Promise<number> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getById<T>(storeName: string, id: number): Promise<T | undefined> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async update<T extends { id?: number }>(storeName: string, data: T): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: number): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // User operations
  async createUser(user: Omit<User, 'id'>): Promise<number> {
    return this.add('users', { ...user, created_at: new Date().toISOString() });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = await this.getByIndex<User>('users', 'email', email);
    return users[0];
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.getById<User>('users', id);
  }

  // Patient operations
  async addPatient(patient: Omit<Patient, 'id'>): Promise<number> {
    const now = new Date().toISOString();
    return this.add('patients', {
      ...patient,
      created_at: now,
      updated_at: now
    });
  }

  async getPatientsByTherapist(therapistId: number): Promise<Patient[]> {
    return this.getByIndex<Patient>('patients', 'therapist_id', therapistId);
  }

  async updatePatient(patient: Patient): Promise<void> {
    return this.update('patients', { ...patient, updated_at: new Date().toISOString() });
  }

  async deletePatient(id: number): Promise<void> {
    return this.delete('patients', id);
  }

  // Session operations
  async addSession(session: Omit<TherapySession, 'id'>): Promise<number> {
    return this.add('sessions', { ...session, created_at: new Date().toISOString() });
  }

  async getSessionsByPatient(patientId: number): Promise<TherapySession[]> {
    const sessions = await this.getByIndex<TherapySession>('sessions', 'patient_id', patientId);
    return sessions.sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());
  }

  async getSessionsByTherapist(therapistId: number): Promise<TherapySession[]> {
    return this.getByIndex<TherapySession>('sessions', 'therapist_id', therapistId);
  }

  // KPI operations
  async addKPIMetrics(kpi: Omit<KPIMetrics, 'id'>): Promise<number> {
    return this.add('kpi_metrics', kpi);
  }

  async getKPIsByPatient(patientId: number): Promise<KPIMetrics[]> {
    const kpis = await this.getByIndex<KPIMetrics>('kpi_metrics', 'patient_id', patientId);
    return kpis.sort((a, b) => new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime());
  }

  // EEG operations
  async addEEGReading(reading: Omit<EEGReading, 'id'>): Promise<number> {
    return this.add('eeg_readings', reading);
  }

  async getEEGByPatient(patientId: number): Promise<EEGReading[]> {
    return this.getByIndex<EEGReading>('eeg_readings', 'patient_id', patientId);
  }

  async getEEGBySession(sessionId: number): Promise<EEGReading[]> {
    return this.getByIndex<EEGReading>('eeg_readings', 'session_id', sessionId);
  }

  // Report operations
  async addReport(report: Omit<Report, 'id'>): Promise<number> {
    return this.add('reports', { ...report, created_at: new Date().toISOString() });
  }

  async getReportsByTherapist(therapistId: number): Promise<Report[]> {
    const reports = await this.getByIndex<Report>('reports', 'therapist_id', therapistId);
    return reports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async updateReport(report: Report): Promise<void> {
    return this.update('reports', report);
  }

  // Seed sample data
  async seedSampleData(): Promise<void> {
    const users = await this.getAll<User>('users');
    if (users.length > 0) {
      console.log('Database already contains data, skipping seed');
      return;
    }

    // Create sample users
    const therapist1 = await this.createUser({
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@cognicare.com',
      password: 'demo123',
      role: 'therapist'
    });

    const therapist2 = await this.createUser({
      name: 'Dr. Michael Chen',
      email: 'michael.chen@cognicare.com',
      password: 'demo123',
      role: 'therapist'
    });

    const parent1 = await this.createUser({
      name: 'Jennifer Smith',
      email: 'jennifer.smith@email.com',
      password: 'demo123',
      role: 'parent'
    });

    // Create sample patients
    const patient1 = await this.addPatient({
      name: 'Emma Rodriguez',
      age: 8,
      condition: 'ADHD',
      therapist_id: therapist1,
      parent_id: parent1,
      progress: 67,
      trend: 'improving',
      status: 'active',
      lastSession: new Date().toISOString(),
      nextSession: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      completedSessions: 14,
      totalSessions: 16,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const patient2 = await this.addPatient({
      name: 'Lucas Chen',
      age: 10,
      condition: 'Autism Spectrum Disorder',
      therapist_id: therapist1,
      progress: 78,
      trend: 'improving',
      status: 'active',
      lastSession: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      nextSession: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      completedSessions: 16,
      totalSessions: 18,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const patient3 = await this.addPatient({
      name: 'Sophia Wilson',
      age: 7,
      condition: 'Learning Disability',
      therapist_id: therapist1,
      progress: 88,
      trend: 'improving',
      status: 'active',
      lastSession: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      nextSession: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      completedSessions: 12,
      totalSessions: 14,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Create sample sessions
    for (const patientId of [patient1, patient2, patient3]) {
      for (let i = 0; i < 5; i++) {
        const sessionDate = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
        const sessionId = await this.addSession({
          patient_id: patientId,
          therapist_id: therapist1,
          session_date: sessionDate.toISOString(),
          duration_minutes: 30 + Math.floor(Math.random() * 30),
          session_type: ['Attention Training', 'Memory Training', 'EEG Neurofeedback'][i % 3],
          progress_score: 6 + Math.random() * 3,
          notes: `Session ${i + 1} completed successfully.`
        });

        // Add KPI metrics
        await this.addKPIMetrics({
          patient_id: patientId,
          session_id: sessionId,
          metric_type: 'attention_span_minutes',
          metric_value: 15 + Math.random() * 10,
          measurement_date: sessionDate.toISOString()
        });

        await this.addKPIMetrics({
          patient_id: patientId,
          session_id: sessionId,
          metric_type: 'accuracy_percentage',
          metric_value: 70 + Math.random() * 25,
          measurement_date: sessionDate.toISOString()
        });

        // Add EEG readings
        for (let j = 0; j < 10; j++) {
          const readingTime = new Date(sessionDate.getTime() + j * 60000);
          await this.addEEGReading({
            patient_id: patientId,
            session_id: sessionId,
            timestamp: readingTime.toISOString(),
            alpha_waves: 10 + Math.random() * 15,
            beta_waves: 15 + Math.random() * 10,
            theta_waves: 5 + Math.random() * 8,
            delta_waves: 2 + Math.random() * 4,
            gamma_waves: 30 + Math.random() * 20,
            attention_level: 60 + Math.random() * 35,
            focus_score: 70 + Math.random() * 25
          });
        }
      }
    }

    console.log('Sample data seeded successfully');
  }
}

// Export singleton instance
export const db = new IndexedDBService();
export default db;

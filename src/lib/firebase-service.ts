import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Types for Firebase documents
export interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  progress: number;
  trend: 'improving' | 'stable' | 'declining';
  status: 'active' | 'inactive' | 'completed';
  lastSession: string;
  nextSession: string;
  completedSessions: number;
  totalSessions: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface KPIMetrics {
  id: string;
  patientId: string;
  sessionId: string;
  attentionSpan: number;
  workingMemory: number;
  processingSpeed: number;
  accuracy: number;
  completionRate: number;
  date: Timestamp;
}

export interface TherapySession {
  id: string;
  patientId: string;
  therapistId: string;
  date: Timestamp;
  duration: number;
  type: 'cognitive' | 'eeg' | 'combined';
  status: 'completed' | 'in-progress' | 'cancelled';
  notes: string;
  metrics: {
    attentionSpan: number;
    accuracy: number;
    completionRate: number;
  };
}

export interface EEGReading {
  id: string;
  patientId: string;
  sessionId: string;
  timestamp: Timestamp;
  alpha: number;
  beta: number;
  theta: number;
  delta: number;
  gamma: number;
}

export interface Report {
  id: string;
  patientId: string;
  therapistId: string;
  type: 'progress' | 'eeg' | 'insurance';
  title: string;
  status: 'generating' | 'ready' | 'error';
  createdAt: Timestamp;
  data: any;
}

export interface User {
  id: string;
  email: string;
  role: 'therapist' | 'parent' | 'child';
  name: string;
  createdAt: Timestamp;
}

class FirebaseService {
  // Collections
  private patientsCollection = collection(db, 'patients');
  private kpisCollection = collection(db, 'kpis');
  private sessionsCollection = collection(db, 'sessions');
  private eegCollection = collection(db, 'eeg_readings');
  private reportsCollection = collection(db, 'reports');
  private usersCollection = collection(db, 'users');

  // Patient operations
  async getAllPatients(): Promise<Patient[]> {
    try {
      const querySnapshot = await getDocs(
        query(this.patientsCollection, orderBy('createdAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Patient));
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  async getPatient(patientId: string): Promise<Patient | null> {
    try {
      const docSnapshot = await getDoc(doc(this.patientsCollection, patientId));
      if (docSnapshot.exists()) {
        return { id: docSnapshot.id, ...docSnapshot.data() } as Patient;
      }
      return null;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  }

  async addPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(this.patientsCollection, {
        ...patientData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding patient:', error);
      throw error;
    }
  }

  async updatePatient(patientId: string, updates: Partial<Patient>): Promise<void> {
    try {
      await updateDoc(doc(this.patientsCollection, patientId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  // KPI operations
  async getPatientKPIs(patientId: string): Promise<KPIMetrics[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          this.kpisCollection,
          where('patientId', '==', patientId),
          orderBy('date', 'desc'),
          limit(50)
        )
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as KPIMetrics));
    } catch (error) {
      console.error('Error fetching patient KPIs:', error);
      throw error;
    }
  }

  async addKPIMetrics(kpiData: Omit<KPIMetrics, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(this.kpisCollection, kpiData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding KPI metrics:', error);
      throw error;
    }
  }

  async getOverallKPISummary(): Promise<any> {
    try {
      const querySnapshot = await getDocs(this.kpisCollection);
      const kpis = querySnapshot.docs.map(doc => doc.data() as KPIMetrics);
      
      if (kpis.length === 0) {
        return {
          avg_attention_span: 0,
          avg_accuracy: 0,
          avg_completion_rate: 0,
          total_sessions: 0
        };
      }

      const summary = {
        avg_attention_span: kpis.reduce((sum, kpi) => sum + kpi.attentionSpan, 0) / kpis.length,
        avg_accuracy: kpis.reduce((sum, kpi) => sum + kpi.accuracy, 0) / kpis.length,
        avg_completion_rate: kpis.reduce((sum, kpi) => sum + kpi.completionRate, 0) / kpis.length,
        total_sessions: kpis.length
      };

      return summary;
    } catch (error) {
      console.error('Error fetching overall KPI summary:', error);
      throw error;
    }
  }

  async getTherapistKPIs(therapistId: string): Promise<any> {
    try {
      const sessionsQuery = query(
        this.sessionsCollection,
        where('therapistId', '==', therapistId)
      );
      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessions = sessionsSnapshot.docs.map(doc => doc.data() as TherapySession);

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const recentSessions = sessions.filter(session => 
        session.date.toDate() >= thirtyDaysAgo
      );

      return {
        total_sessions: sessions.length,
        sessions_last_30_days: recentSessions.length,
        avg_progress_score: sessions.length > 0 
          ? sessions.reduce((sum, s) => sum + s.metrics.completionRate, 0) / sessions.length / 100
          : 0
      };
    } catch (error) {
      console.error('Error fetching therapist KPIs:', error);
      throw error;
    }
  }

  // Session operations
  async getPatientSessions(patientId: string): Promise<TherapySession[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          this.sessionsCollection,
          where('patientId', '==', patientId),
          orderBy('date', 'desc')
        )
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TherapySession));
    } catch (error) {
      console.error('Error fetching patient sessions:', error);
      throw error;
    }
  }

  async addSession(sessionData: Omit<TherapySession, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(this.sessionsCollection, sessionData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding session:', error);
      throw error;
    }
  }

  // EEG operations
  async getEEGData(patientId: string, sessionId?: string): Promise<EEGReading[]> {
    try {
      let eegQuery = query(
        this.eegCollection,
        where('patientId', '==', patientId)
      );

      if (sessionId) {
        eegQuery = query(
          this.eegCollection,
          where('patientId', '==', patientId),
          where('sessionId', '==', sessionId)
        );
      }

      const querySnapshot = await getDocs(eegQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EEGReading));
    } catch (error) {
      console.error('Error fetching EEG data:', error);
      throw error;
    }
  }

  async addEEGReading(eegData: Omit<EEGReading, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(this.eegCollection, eegData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding EEG reading:', error);
      throw error;
    }
  }

  // Report operations
  async getReports(patientId?: string): Promise<Report[]> {
    try {
      let reportsQuery = query(this.reportsCollection, orderBy('createdAt', 'desc'));
      
      if (patientId) {
        reportsQuery = query(
          this.reportsCollection,
          where('patientId', '==', patientId),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(reportsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Report));
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }

  async generateReport(reportData: Omit<Report, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(this.reportsCollection, {
        ...reportData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  async updateReportStatus(reportId: string, status: Report['status'], data?: any): Promise<void> {
    try {
      const updates: any = { status };
      if (data) {
        updates.data = data;
      }
      await updateDoc(doc(this.reportsCollection, reportId), updates);
    } catch (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
  }

  // User operations
  async getUser(userId: string): Promise<User | null> {
    try {
      const docSnapshot = await getDoc(doc(this.usersCollection, userId));
      if (docSnapshot.exists()) {
        return { id: docSnapshot.id, ...docSnapshot.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(this.usersCollection, {
        ...userData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Real-time subscriptions
  subscribeToPatients(callback: (patients: Patient[]) => void) {
    return onSnapshot(
      query(this.patientsCollection, orderBy('createdAt', 'desc')),
      (snapshot) => {
        const patients = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Patient));
        callback(patients);
      }
    );
  }

  subscribeToKPIs(patientId: string, callback: (kpis: KPIMetrics[]) => void) {
    return onSnapshot(
      query(
        this.kpisCollection,
        where('patientId', '==', patientId),
        orderBy('date', 'desc')
      ),
      (snapshot) => {
        const kpis = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as KPIMetrics));
        callback(kpis);
      }
    );
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService;

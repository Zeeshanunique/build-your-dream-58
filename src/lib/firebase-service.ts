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

  // Seed demo data for new users
  async seedDemoData(userId: string, role: 'therapist' | 'parent' | 'child'): Promise<void> {
    try {
      // Check if user already has data
      const existingPatients = await getDocs(
        query(this.patientsCollection, where('therapistId', '==', userId), limit(1))
      );

      if (existingPatients.size > 0) {
        console.log('User already has data, skipping seed');
        return;
      }

      if (role === 'therapist') {
        await this.seedTherapistData(userId);
      } else if (role === 'parent') {
        await this.seedParentData(userId);
      } else if (role === 'child') {
        await this.seedChildData(userId);
      }
    } catch (error) {
      console.error('Error seeding demo data:', error);
      throw error;
    }
  }

  private async seedTherapistData(therapistId: string): Promise<void> {
    const patients = [
      {
        name: 'Emma Rodriguez',
        age: 8,
        condition: 'ADHD',
        progress: 67,
        trend: 'improving' as const,
        status: 'active' as const,
        lastSession: new Date().toISOString(),
        nextSession: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        completedSessions: 14,
        totalSessions: 16,
        therapistId
      },
      {
        name: 'Lucas Chen',
        age: 10,
        condition: 'Autism Spectrum Disorder',
        progress: 78,
        trend: 'improving' as const,
        status: 'active' as const,
        lastSession: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        nextSession: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        completedSessions: 16,
        totalSessions: 18,
        therapistId
      },
      {
        name: 'Sophia Wilson',
        age: 7,
        condition: 'Learning Disability',
        progress: 88,
        trend: 'improving' as const,
        status: 'active' as const,
        lastSession: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        nextSession: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        completedSessions: 12,
        totalSessions: 14,
        therapistId
      },
      {
        name: 'Noah Miller',
        age: 9,
        condition: 'ADHD',
        progress: 98,
        trend: 'stable' as const,
        status: 'active' as const,
        lastSession: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        nextSession: new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString(),
        completedSessions: 18,
        totalSessions: 20,
        therapistId
      }
    ];

    // Add patients
    const patientIds: string[] = [];
    for (const patient of patients) {
      const patientId = await this.addPatient(patient);
      patientIds.push(patientId);
    }

    // Add sample sessions and KPIs for each patient
    for (let i = 0; i < patientIds.length; i++) {
      const patientId = patientIds[i];

      // Add sessions
      for (let j = 0; j < 3; j++) {
        const sessionDate = new Date(Date.now() - (j + 1) * 7 * 24 * 60 * 60 * 1000);
        const sessionId = await this.addSession({
          patientId,
          therapistId,
          date: Timestamp.fromDate(sessionDate),
          duration: 30 + Math.random() * 30,
          type: 'cognitive' as const,
          status: 'completed' as const,
          notes: `Session ${j + 1} completed successfully. Patient showed good engagement.`,
          metrics: {
            attentionSpan: 60 + Math.random() * 30,
            accuracy: 70 + Math.random() * 25,
            completionRate: 80 + Math.random() * 15
          }
        });

        // Add KPI metrics for this session
        await this.addKPIMetrics({
          patientId,
          sessionId,
          attentionSpan: 60 + Math.random() * 30,
          workingMemory: 65 + Math.random() * 25,
          processingSpeed: 70 + Math.random() * 20,
          accuracy: 70 + Math.random() * 25,
          completionRate: 80 + Math.random() * 15,
          date: Timestamp.fromDate(sessionDate)
        });

        // Add EEG readings for this session
        for (let k = 0; k < 10; k++) {
          const readingTime = new Date(sessionDate.getTime() + k * 60000);
          await this.addEEGReading({
            patientId,
            sessionId,
            timestamp: Timestamp.fromDate(readingTime),
            alpha: 10 + Math.random() * 15,
            beta: 15 + Math.random() * 10,
            theta: 5 + Math.random() * 8,
            delta: 2 + Math.random() * 4,
            gamma: 30 + Math.random() * 20
          });
        }
      }
    }

    console.log('Therapist demo data seeded successfully');
  }

  private async seedParentData(parentId: string): Promise<void> {
    // Add a child patient linked to this parent
    const patientId = await this.addPatient({
      name: 'Emma Rodriguez',
      age: 8,
      condition: 'ADHD',
      progress: 67,
      trend: 'improving' as const,
      status: 'active' as const,
      lastSession: new Date().toISOString(),
      nextSession: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      completedSessions: 14,
      totalSessions: 16,
      therapistId: 'demo-therapist', // Link to demo therapist
      parentId // Add parent ID field
    } as any);

    // Add recent sessions for the child
    for (let i = 0; i < 5; i++) {
      const sessionDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      await this.addSession({
        patientId,
        therapistId: 'demo-therapist',
        date: Timestamp.fromDate(sessionDate),
        duration: 25,
        type: 'cognitive' as const,
        status: 'completed' as const,
        notes: `Home session ${i + 1} completed with parent supervision.`,
        metrics: {
          attentionSpan: 50 + Math.random() * 30,
          accuracy: 65 + Math.random() * 25,
          completionRate: 75 + Math.random() * 20
        }
      });
    }

    console.log('Parent demo data seeded successfully');
  }

  private async seedChildData(childId: string): Promise<void> {
    // Create a patient record for this child
    const patientId = await this.addPatient({
      name: 'Emma Rodriguez',
      age: 8,
      condition: 'ADHD',
      progress: 67,
      trend: 'improving' as const,
      status: 'active' as const,
      lastSession: new Date().toISOString(),
      nextSession: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      completedSessions: 14,
      totalSessions: 16,
      therapistId: 'demo-therapist',
      childId // Add child ID field
    } as any);

    // Add some game sessions
    const gameTypes = ['memory', 'attention', 'processing'] as const;
    for (let i = 0; i < 7; i++) {
      const sessionDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      await this.addSession({
        patientId,
        therapistId: 'demo-therapist',
        date: Timestamp.fromDate(sessionDate),
        duration: 15,
        type: 'cognitive' as const,
        status: 'completed' as const,
        notes: `Game session: ${gameTypes[i % gameTypes.length]} training completed.`,
        metrics: {
          attentionSpan: 40 + Math.random() * 25,
          accuracy: 60 + Math.random() * 30,
          completionRate: 70 + Math.random() * 25
        }
      });
    }

    console.log('Child demo data seeded successfully');
  }
}

export const firebaseService = new FirebaseService();

// Export the seed function for use in AuthContext
export const seedDemoData = (userId: string, role: 'therapist' | 'parent' | 'child') =>
  firebaseService.seedDemoData(userId, role);

export default firebaseService;

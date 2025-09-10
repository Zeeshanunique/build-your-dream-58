import { useState, useEffect } from 'react';
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
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types
export interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  status: 'active' | 'inactive' | 'completed';
  progress: number;
  trend: 'improving' | 'stable' | 'declining';
  lastSession: string;
  nextSession: string;
  completedSessions: number;
  totalSessions: number;
  therapistId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Session {
  id: string;
  patientId: string;
  therapistId: string;
  type: 'cognitive' | 'eeg' | 'assessment';
  duration: number;
  completed: boolean;
  score?: number;
  notes: string;
  date: Timestamp;
  createdAt: Timestamp;
}

export interface Report {
  id: string;
  patientId: string;
  therapistId: string;
  type: 'progress' | 'eeg' | 'insurance';
  title: string;
  status: 'generating' | 'ready' | 'error';
  fileUrl?: string;
  createdAt: Timestamp;
}

// Custom hooks for Firebase operations

// Patients
export const usePatients = (therapistId?: string) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const patientsRef = collection(db, 'patients');
    const q = therapistId 
      ? query(patientsRef, where('therapistId', '==', therapistId), orderBy('createdAt', 'desc'))
      : query(patientsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const patientsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Patient));
        setPatients(patientsData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [therapistId]);

  const addPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = Timestamp.now();
      await addDoc(collection(db, 'patients'), {
        ...patientData,
        createdAt: now,
        updatedAt: now
      });
    } catch (err) {
      throw new Error(`Failed to add patient: ${err}`);
    }
  };

  const updatePatient = async (patientId: string, updates: Partial<Patient>) => {
    try {
      const patientRef = doc(db, 'patients', patientId);
      await updateDoc(patientRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      throw new Error(`Failed to update patient: ${err}`);
    }
  };

  const deletePatient = async (patientId: string) => {
    try {
      await deleteDoc(doc(db, 'patients', patientId));
    } catch (err) {
      throw new Error(`Failed to delete patient: ${err}`);
    }
  };

  return { 
    patients, 
    loading, 
    error, 
    addPatient, 
    updatePatient, 
    deletePatient 
  };
};

// Sessions
export const useSessions = (patientId?: string) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionsRef = collection(db, 'sessions');
    const q = patientId 
      ? query(sessionsRef, where('patientId', '==', patientId), orderBy('date', 'desc'))
      : query(sessionsRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const sessionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Session));
        setSessions(sessionsData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [patientId]);

  const addSession = async (sessionData: Omit<Session, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'sessions'), {
        ...sessionData,
        createdAt: Timestamp.now()
      });
    } catch (err) {
      throw new Error(`Failed to add session: ${err}`);
    }
  };

  const updateSession = async (sessionId: string, updates: Partial<Session>) => {
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, updates);
    } catch (err) {
      throw new Error(`Failed to update session: ${err}`);
    }
  };

  return { 
    sessions, 
    loading, 
    error, 
    addSession, 
    updateSession 
  };
};

// Reports
export const useReports = (therapistId?: string) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reportsRef = collection(db, 'reports');
    const q = therapistId 
      ? query(reportsRef, where('therapistId', '==', therapistId), orderBy('createdAt', 'desc'))
      : query(reportsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const reportsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Report));
        setReports(reportsData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [therapistId]);

  const generateReport = async (reportData: Omit<Report, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'reports'), {
        ...reportData,
        createdAt: Timestamp.now()
      });
    } catch (err) {
      throw new Error(`Failed to generate report: ${err}`);
    }
  };

  const updateReport = async (reportId: string, updates: Partial<Report>) => {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, updates);
    } catch (err) {
      throw new Error(`Failed to update report: ${err}`);
    }
  };

  return { 
    reports, 
    loading, 
    error, 
    generateReport, 
    updateReport 
  };
};

// Analytics/KPIs
export const useKPIs = (therapistId?: string) => {
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setLoading(true);
        
        // Get patients count
        const patientsRef = collection(db, 'patients');
        const patientsQuery = therapistId 
          ? query(patientsRef, where('therapistId', '==', therapistId))
          : patientsRef;
        const patientsSnapshot = await getDocs(patientsQuery);
        const totalPatients = patientsSnapshot.size;

        // Get sessions in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const sessionsRef = collection(db, 'sessions');
        const sessionsQuery = query(
          sessionsRef, 
          where('date', '>=', Timestamp.fromDate(thirtyDaysAgo))
        );
        const sessionsSnapshot = await getDocs(sessionsQuery);
        const recentSessions = sessionsSnapshot.size;

        // Calculate other metrics from sessions
        const sessionData = sessionsSnapshot.docs.map(doc => doc.data());
        const completedSessions = sessionData.filter(session => session.completed).length;
        const totalScore = sessionData.reduce((sum, session) => sum + (session.score || 0), 0);
        const avgScore = sessionData.length > 0 ? totalScore / sessionData.length : 0;

        setKpis({
          totalPatients,
          recentSessions,
          completedSessions,
          avgScore,
          completionRate: sessionData.length > 0 ? (completedSessions / sessionData.length) * 100 : 0
        });
        
        setLoading(false);
      } catch (err) {
        setError(`Failed to fetch KPIs: ${err}`);
        setLoading(false);
      }
    };

    fetchKPIs();
  }, [therapistId]);

  return { kpis, loading, error };
};

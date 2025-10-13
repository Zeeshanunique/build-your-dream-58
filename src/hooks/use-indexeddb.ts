import { useState, useEffect, useCallback } from 'react';
import { db, Patient, TherapySession, KPIMetrics, EEGReading, Report, User } from '@/lib/indexeddb';

// Initialize database on first load
let dbInitialized = false;
const initializeDB = async () => {
  if (!dbInitialized) {
    await db.init();
    dbInitialized = true;
  }
};

// Users hook
export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeDB().then(() => {
      // Check for stored user session
      const storedUserId = localStorage.getItem('currentUserId');
      if (storedUserId) {
        db.getUserById(parseInt(storedUserId)).then(user => {
          setCurrentUser(user || null);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, []);

  const login = async (email: string, password: string) => {
    await initializeDB();
    const user = await db.getUserByEmail(email);
    if (user && user.password === password) {
      setCurrentUser(user);
      localStorage.setItem('currentUserId', user.id!.toString());
      return user;
    }
    throw new Error('Invalid credentials');
  };

  const register = async (name: string, email: string, password: string, role: 'therapist' | 'parent' | 'child') => {
    await initializeDB();
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      throw new Error('Email already exists');
    }
    const userId = await db.createUser({ name, email, password, role, created_at: new Date().toISOString() });
    const user = await db.getUserById(userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUserId', user.id!.toString());
    }
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUserId');
  };

  const quickLogin = async (role: 'therapist' | 'parent' | 'child') => {
    const demoEmails = {
      therapist: 'sarah.johnson@cognicare.com',
      parent: 'jennifer.smith@email.com',
      child: 'child@demo.com'
    };

    try {
      return await login(demoEmails[role], 'demo123');
    } catch (error) {
      // If demo user doesn't exist, seed the database
      await db.seedSampleData();
      return await login(demoEmails[role], 'demo123');
    }
  };

  return {
    user: currentUser,
    userProfile: currentUser,
    loading,
    signIn: login,
    signUp: register,
    logout,
    quickLogin
  };
};

// Patients hook
export const usePatients = (therapistId?: number) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    if (!therapistId) {
      setLoading(false);
      return;
    }

    try {
      await initializeDB();
      const data = await db.getPatientsByTherapist(therapistId);
      setPatients(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  }, [therapistId]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const addPatient = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    await initializeDB();
    await db.addPatient(patientData);
    await fetchPatients();
  };

  const updatePatient = async (patientId: number, updates: Partial<Patient>) => {
    await initializeDB();
    const patient = await db.getById<Patient>('patients', patientId);
    if (patient) {
      await db.updatePatient({ ...patient, ...updates });
      await fetchPatients();
    }
  };

  const deletePatient = async (patientId: number) => {
    await initializeDB();
    await db.deletePatient(patientId);
    await fetchPatients();
  };

  return {
    patients,
    loading,
    error,
    addPatient,
    updatePatient,
    deletePatient,
    refetch: fetchPatients
  };
};

// Sessions hook
export const useSessions = (patientId?: number) => {
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      await initializeDB();
      const data = patientId
        ? await db.getSessionsByPatient(patientId)
        : [];
      setSessions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const addSession = async (sessionData: Omit<TherapySession, 'id' | 'created_at'>) => {
    await initializeDB();
    await db.addSession(sessionData);
    await fetchSessions();
  };

  return {
    sessions,
    loading,
    error,
    addSession,
    refetch: fetchSessions
  };
};

// KPIs hook
export const useKPIs = (therapistId?: number, patientId?: number) => {
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        await initializeDB();

        if (patientId) {
          const patientKpis = await db.getKPIsByPatient(patientId);
          setKpis({ metrics: patientKpis });
        } else if (therapistId) {
          const sessions = await db.getSessionsByTherapist(therapistId);
          const recentSessions = sessions.filter(s => {
            const date = new Date(s.session_date);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return date >= thirtyDaysAgo;
          });

          const avgScore = sessions.length > 0
            ? sessions.reduce((sum, s) => sum + s.progress_score, 0) / sessions.length
            : 0;

          setKpis({
            totalPatients: (await db.getPatientsByTherapist(therapistId)).length,
            recentSessions: recentSessions.length,
            avgScore: avgScore,
            completionRate: 85
          });
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch KPIs');
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, [therapistId, patientId]);

  return { kpis, loading, error };
};

// EEG data hook
export const useEEGData = (patientId?: number, sessionId?: number) => {
  const [eegData, setEegData] = useState<EEGReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEEG = async () => {
      try {
        await initializeDB();
        const data = sessionId
          ? await db.getEEGBySession(sessionId)
          : patientId
          ? await db.getEEGByPatient(patientId)
          : [];
        setEegData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch EEG data');
      } finally {
        setLoading(false);
      }
    };

    fetchEEG();
  }, [patientId, sessionId]);

  const addEEGReading = async (reading: Omit<EEGReading, 'id'>) => {
    await initializeDB();
    await db.addEEGReading(reading);
  };

  return { eegData, loading, error, addEEGReading };
};

// Reports hook
export const useReports = (therapistId?: number) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!therapistId) {
      setLoading(false);
      return;
    }

    try {
      await initializeDB();
      const data = await db.getReportsByTherapist(therapistId);
      setReports(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, [therapistId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const generateReport = async (reportData: Omit<Report, 'id' | 'created_at'>): Promise<number> => {
    await initializeDB();
    const reportId = await db.addReport(reportData);
    await fetchReports();
    return reportId;
  };

  const updateReport = async (reportId: number, updates: Partial<Report>) => {
    await initializeDB();
    const report = await db.getById<Report>('reports', reportId);
    if (report) {
      await db.updateReport({ ...report, ...updates });
      await fetchReports();
    }
  };

  return {
    reports,
    loading,
    error,
    generateReport,
    updateReport,
    refetch: fetchReports
  };
};

import { useState, useEffect } from 'react';
import { sqliteAPI, User, Patient, TherapySession, KPIMetrics, EEGReading, Report } from '@/lib/sqlite-api';

// Custom hook for user authentication
export const useSQLiteAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await sqliteAPI.login(email, password);
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return userData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: 'therapist' | 'parent' | 'child') => {
    setLoading(true);
    setError(null);
    try {
      const userData = await sqliteAPI.register(name, email, password, role);
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return userData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role: 'therapist' | 'parent' | 'child') => {
    setLoading(true);
    setError(null);
    try {
      const userData = await sqliteAPI.quickLogin(role);
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return userData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Quick login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    quickLogin,
    logout
  };
};

// Custom hook for patients
export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await sqliteAPI.getPatients();
      setPatients(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patients';
      setError(errorMessage);
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPatient = async (patientData: Partial<Patient>) => {
    try {
      const result = await sqliteAPI.createPatient(patientData);
      await fetchPatients(); // Refresh the list
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create patient';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    createPatient
  };
};

// Custom hook for therapy sessions
export const useSessions = (patientId?: number) => {
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async (id: number) => {
    try {
      setLoading(true);
      const data = await sqliteAPI.getPatientSessions(id);
      setSessions(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sessions';
      setError(errorMessage);
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchSessions(patientId);
    }
  }, [patientId]);

  return {
    sessions,
    loading,
    error,
    fetchSessions
  };
};

// Custom hook for KPI metrics
export const useKPIs = (patientId?: number) => {
  const [kpis, setKpis] = useState<KPIMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKPIs = async (id: number) => {
    try {
      setLoading(true);
      const data = await sqliteAPI.getPatientKPIs(id);
      setKpis(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch KPIs';
      setError(errorMessage);
      console.error('Error fetching KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchKPIs(patientId);
    }
  }, [patientId]);

  return {
    kpis,
    loading,
    error,
    fetchKPIs
  };
};

// Custom hook for EEG data
export const useEEGData = (patientId?: number, sessionId?: number) => {
  const [eegData, setEegData] = useState<EEGReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEEGData = async (id: number, sId?: number) => {
    try {
      setLoading(true);
      const data = await sqliteAPI.getEEGData(id, sId);
      setEegData(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch EEG data';
      setError(errorMessage);
      console.error('Error fetching EEG data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchEEGData(patientId, sessionId);
    }
  }, [patientId, sessionId]);

  return {
    eegData,
    loading,
    error,
    fetchEEGData
  };
};

// Custom hook for reports
export const useReports = (therapistId?: number) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async (id: number) => {
    try {
      setLoading(true);
      const data = await sqliteAPI.getReports(id);
      setReports(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reports';
      setError(errorMessage);
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (therapistId) {
      fetchReports(therapistId);
    }
  }, [therapistId]);

  return {
    reports,
    loading,
    error,
    fetchReports
  };
};

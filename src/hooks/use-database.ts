import { useState, useEffect } from 'react';
import { dbService, Patient, KPIMetrics, TherapySession, EEGReading } from '../lib/mock-database';

// Hook for patient KPI data
export function usePatientKPIs(patientId: number) {
  const [kpis, setKpis] = useState<KPIMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        setLoading(true);
        const data = await dbService.getPatientKPIs(patientId);
        setKpis(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch patient KPIs');
        console.error('Error fetching patient KPIs:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchKpis();
  }, [patientId]);

  return { kpis, loading, error };
}

// Hook for KPI trends
export function useKPITrends(patientId: number, metricType: string) {
  const [trends, setTrends] = useState<KPIMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const data = await dbService.getKPITrends(patientId, metricType);
        setTrends(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch KPI trends');
        console.error('Error fetching KPI trends:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrends();
  }, [patientId, metricType]);

  return { trends, loading, error };
}

// Hook for overall KPI summary
export function useOverallKPIs() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await dbService.getOverallKPISummary();
        setSummary(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch overall KPIs');
        console.error('Error fetching overall KPIs:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSummary();
  }, []);

  return { summary, loading, error };
}

// Hook for patient progress summary
export function usePatientProgress(patientId: number) {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const data = await dbService.getPatientProgressSummary(patientId);
        setProgress(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch patient progress');
        console.error('Error fetching patient progress:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgress();
  }, [patientId]);

  return { progress, loading, error };
}

// Hook for therapist KPIs
export function useTherapistKPIs(therapistId: number) {
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        setLoading(true);
        const data = await dbService.getTherapistKPIs(therapistId);
        setKpis(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch therapist KPIs');
        console.error('Error fetching therapist KPIs:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchKpis();
  }, [therapistId]);

  return { kpis, loading, error };
}

// Hook for EEG data
export function useEEGData(patientId: number, sessionId?: number) {
  const [eegData, setEegData] = useState<EEGReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEegData = async () => {
      try {
        setLoading(true);
        const data = await dbService.getEEGData(patientId, sessionId);
        setEegData(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch EEG data');
        console.error('Error fetching EEG data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEegData();
  }, [patientId, sessionId]);

  return { eegData, loading, error };
}

// Hook for all patients
export function useAllPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const data = await dbService.getAllPatients();
        setPatients(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch patients');
        console.error('Error fetching patients:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await dbService.getAllPatients();
      setPatients(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch patients');
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  return { patients, loading, error, refetch };
}

// Hook for patient sessions
export function usePatientSessions(patientId: number) {
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const data = await dbService.getPatientSessions(patientId);
        setSessions(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch patient sessions');
        console.error('Error fetching patient sessions:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, [patientId]);

  return { sessions, loading, error };
}

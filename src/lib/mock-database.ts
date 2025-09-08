// Mock database service for frontend use
// This simulates the SQLite database functionality in the browser

export interface Patient {
  id: number;
  name: string;
  age: number;
  condition: string;
  therapist_id: number;
  parent_id: number;
  created_at: string;
  updated_at: string;
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
}

export interface KPIMetrics {
  id: number;
  patient_id: number;
  metric_type: string;
  metric_value: number;
  measurement_date: string;
  session_id?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'therapist' | 'parent' | 'child';
  created_at: string;
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

class MockDatabaseService {
  private users: User[] = [
    { id: 1, name: 'Dr. Sarah Johnson', email: 'sarah.johnson@cognicare.com', role: 'therapist', created_at: '2025-09-01T00:00:00Z' },
    { id: 2, name: 'Dr. Michael Chen', email: 'michael.chen@cognicare.com', role: 'therapist', created_at: '2025-09-01T00:00:00Z' },
    { id: 3, name: 'Dr. Emily Rodriguez', email: 'emily.rodriguez@cognicare.com', role: 'therapist', created_at: '2025-09-01T00:00:00Z' },
    { id: 4, name: 'Jennifer Smith', email: 'jennifer.smith@email.com', role: 'parent', created_at: '2025-09-01T00:00:00Z' },
    { id: 5, name: 'Robert Brown', email: 'robert.brown@email.com', role: 'parent', created_at: '2025-09-01T00:00:00Z' },
    { id: 6, name: 'Lisa Wilson', email: 'lisa.wilson@email.com', role: 'parent', created_at: '2025-09-01T00:00:00Z' },
    { id: 7, name: 'David Miller', email: 'david.miller@email.com', role: 'parent', created_at: '2025-09-01T00:00:00Z' },
    { id: 8, name: 'Emma Smith', email: 'emma.smith@email.com', role: 'child', created_at: '2025-09-01T00:00:00Z' },
    { id: 9, name: 'Alex Brown', email: 'alex.brown@email.com', role: 'child', created_at: '2025-09-01T00:00:00Z' },
    { id: 10, name: 'Sophia Wilson', email: 'sophia.wilson@email.com', role: 'child', created_at: '2025-09-01T00:00:00Z' },
    { id: 11, name: 'Noah Miller', email: 'noah.miller@email.com', role: 'child', created_at: '2025-09-01T00:00:00Z' },
  ];

  private patients: Patient[] = [
    { id: 1, name: 'Emma Smith', age: 8, condition: 'ADHD', therapist_id: 1, parent_id: 4, created_at: '2025-09-01T00:00:00Z', updated_at: '2025-09-01T00:00:00Z' },
    { id: 2, name: 'Alex Brown', age: 10, condition: 'Autism Spectrum Disorder', therapist_id: 2, parent_id: 5, created_at: '2025-09-01T00:00:00Z', updated_at: '2025-09-01T00:00:00Z' },
    { id: 3, name: 'Sophia Wilson', age: 7, condition: 'Learning Disability', therapist_id: 1, parent_id: 6, created_at: '2025-09-01T00:00:00Z', updated_at: '2025-09-01T00:00:00Z' },
    { id: 4, name: 'Noah Miller', age: 9, condition: 'ADHD', therapist_id: 3, parent_id: 7, created_at: '2025-09-01T00:00:00Z', updated_at: '2025-09-01T00:00:00Z' },
  ];

  private therapySessions: TherapySession[] = [
    { id: 1, patient_id: 1, therapist_id: 1, session_date: '2025-09-01T10:00:00Z', duration_minutes: 45, session_type: 'Attention Training', progress_score: 7.5, notes: 'Good focus improvement', created_at: '2025-09-01T10:45:00Z' },
    { id: 2, patient_id: 1, therapist_id: 1, session_date: '2025-09-03T10:00:00Z', duration_minutes: 45, session_type: 'Memory Training', progress_score: 8.0, notes: 'Excellent memory recall', created_at: '2025-09-03T10:45:00Z' },
    { id: 3, patient_id: 1, therapist_id: 1, session_date: '2025-09-05T10:00:00Z', duration_minutes: 45, session_type: 'EEG Neurofeedback', progress_score: 7.8, notes: 'Stable alpha waves', created_at: '2025-09-05T10:45:00Z' },
    { id: 4, patient_id: 2, therapist_id: 2, session_date: '2025-09-02T11:00:00Z', duration_minutes: 60, session_type: 'Social Skills', progress_score: 6.5, notes: 'Progress in communication', created_at: '2025-09-02T12:00:00Z' },
    { id: 5, patient_id: 2, therapist_id: 2, session_date: '2025-09-04T11:00:00Z', duration_minutes: 60, session_type: 'Attention Training', progress_score: 7.0, notes: 'Better sustained attention', created_at: '2025-09-04T12:00:00Z' },
    { id: 6, patient_id: 3, therapist_id: 1, session_date: '2025-09-01T14:00:00Z', duration_minutes: 45, session_type: 'Reading Comprehension', progress_score: 8.5, notes: 'Significant improvement', created_at: '2025-09-01T14:45:00Z' },
    { id: 7, patient_id: 3, therapist_id: 1, session_date: '2025-09-03T14:00:00Z', duration_minutes: 45, session_type: 'Mathematical Skills', progress_score: 7.2, notes: 'Problem-solving enhanced', created_at: '2025-09-03T14:45:00Z' },
    { id: 8, patient_id: 4, therapist_id: 3, session_date: '2025-09-02T15:00:00Z', duration_minutes: 45, session_type: 'Impulse Control', progress_score: 6.8, notes: 'Better self-regulation', created_at: '2025-09-02T15:45:00Z' },
  ];

  private kpiMetrics: KPIMetrics[] = [
    // Emma Smith (Patient 1) KPIs
    { id: 1, patient_id: 1, metric_type: 'attention_span_minutes', metric_value: 15, measurement_date: '2025-09-01T10:45:00Z', session_id: 1 },
    { id: 2, patient_id: 1, metric_type: 'accuracy_percentage', metric_value: 85, measurement_date: '2025-09-01T10:45:00Z', session_id: 1 },
    { id: 3, patient_id: 1, metric_type: 'reaction_time_ms', metric_value: 450, measurement_date: '2025-09-01T10:45:00Z', session_id: 1 },
    { id: 4, patient_id: 1, metric_type: 'attention_span_minutes', metric_value: 18, measurement_date: '2025-09-03T10:45:00Z', session_id: 2 },
    { id: 5, patient_id: 1, metric_type: 'accuracy_percentage', metric_value: 88, measurement_date: '2025-09-03T10:45:00Z', session_id: 2 },
    { id: 6, patient_id: 1, metric_type: 'memory_recall_percentage', metric_value: 75, measurement_date: '2025-09-03T10:45:00Z', session_id: 2 },
    { id: 7, patient_id: 1, metric_type: 'alpha_wave_coherence', metric_value: 0.75, measurement_date: '2025-09-05T10:45:00Z', session_id: 3 },
    { id: 8, patient_id: 1, metric_type: 'beta_wave_ratio', metric_value: 0.65, measurement_date: '2025-09-05T10:45:00Z', session_id: 3 },

    // Alex Brown (Patient 2) KPIs
    { id: 9, patient_id: 2, metric_type: 'social_interaction_score', metric_value: 6.5, measurement_date: '2025-09-02T12:00:00Z', session_id: 4 },
    { id: 10, patient_id: 2, metric_type: 'communication_attempts', metric_value: 12, measurement_date: '2025-09-02T12:00:00Z', session_id: 4 },
    { id: 11, patient_id: 2, metric_type: 'attention_span_minutes', metric_value: 20, measurement_date: '2025-09-04T12:00:00Z', session_id: 5 },
    { id: 12, patient_id: 2, metric_type: 'task_completion_rate', metric_value: 70, measurement_date: '2025-09-04T12:00:00Z', session_id: 5 },

    // Sophia Wilson (Patient 3) KPIs
    { id: 13, patient_id: 3, metric_type: 'reading_comprehension_score', metric_value: 85, measurement_date: '2025-09-01T14:45:00Z', session_id: 6 },
    { id: 14, patient_id: 3, metric_type: 'reading_speed_wpm', metric_value: 45, measurement_date: '2025-09-01T14:45:00Z', session_id: 6 },
    { id: 15, patient_id: 3, metric_type: 'math_problem_accuracy', metric_value: 72, measurement_date: '2025-09-03T14:45:00Z', session_id: 7 },
    { id: 16, patient_id: 3, metric_type: 'problem_solving_time_seconds', metric_value: 120, measurement_date: '2025-09-03T14:45:00Z', session_id: 7 },

    // Noah Miller (Patient 4) KPIs
    { id: 17, patient_id: 4, metric_type: 'impulse_control_score', metric_value: 6.8, measurement_date: '2025-09-02T15:45:00Z', session_id: 8 },
    { id: 18, patient_id: 4, metric_type: 'attention_duration_minutes', metric_value: 16, measurement_date: '2025-09-02T15:45:00Z', session_id: 8 },
    { id: 19, patient_id: 4, metric_type: 'hyperactivity_incidents', metric_value: 3, measurement_date: '2025-09-02T15:45:00Z', session_id: 8 },
  ];

  private eegReadings: EEGReading[] = [];

  constructor() {
    // Generate EEG readings for Emma's neurofeedback session
    const baseTime = new Date('2025-09-05T10:00:00Z');
    for (let i = 0; i < 30; i++) {
      const timestamp = new Date(baseTime.getTime() + i * 60000); // Every minute
      this.eegReadings.push({
        id: i + 1,
        patient_id: 1,
        session_id: 3,
        timestamp: timestamp.toISOString(),
        alpha_waves: Math.random() * 20 + 10, // 10-30
        beta_waves: Math.random() * 15 + 15, // 15-30
        theta_waves: Math.random() * 10 + 5,  // 5-15
        delta_waves: Math.random() * 5 + 2,   // 2-7
        attention_level: Math.random() * 40 + 60, // 60-100
        focus_score: Math.random() * 30 + 70  // 70-100
      });
    }
  }

  // Simulate async operations with small delays
  private async delay(ms: number = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getPatientKPIs(patientId: number): Promise<KPIMetrics[]> {
    await this.delay();
    return this.kpiMetrics.filter(kpi => kpi.patient_id === patientId)
      .sort((a, b) => new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime());
  }

  async getKPITrends(patientId: number, metricType: string): Promise<KPIMetrics[]> {
    await this.delay();
    return this.kpiMetrics.filter(kpi => kpi.patient_id === patientId && kpi.metric_type === metricType)
      .sort((a, b) => new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime());
  }

  async getOverallKPISummary() {
    await this.delay();
    const totalPatients = new Set(this.kpiMetrics.map(k => k.patient_id)).size;
    const totalSessions = new Set(this.kpiMetrics.map(k => k.session_id).filter(Boolean)).size;
    
    const attentionMetrics = this.kpiMetrics.filter(k => k.metric_type === 'attention_span_minutes');
    const accuracyMetrics = this.kpiMetrics.filter(k => k.metric_type === 'accuracy_percentage');
    const completionMetrics = this.kpiMetrics.filter(k => k.metric_type === 'task_completion_rate');
    
    return {
      total_patients: totalPatients,
      total_sessions: totalSessions,
      avg_attention_span: attentionMetrics.length > 0 ? attentionMetrics.reduce((sum, m) => sum + m.metric_value, 0) / attentionMetrics.length : null,
      avg_accuracy: accuracyMetrics.length > 0 ? accuracyMetrics.reduce((sum, m) => sum + m.metric_value, 0) / accuracyMetrics.length : null,
      avg_completion_rate: completionMetrics.length > 0 ? completionMetrics.reduce((sum, m) => sum + m.metric_value, 0) / completionMetrics.length : null
    };
  }

  async getPatientProgressSummary(patientId: number) {
    await this.delay();
    const patient = this.patients.find(p => p.id === patientId);
    if (!patient) return null;

    const sessions = this.therapySessions.filter(s => s.patient_id === patientId);
    const kpis = this.kpiMetrics.filter(k => k.patient_id === patientId);
    
    const avgProgressScore = sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.progress_score, 0) / sessions.length : 0;
    const lastSession = sessions.sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime())[0];
    const trackedMetrics = new Set(kpis.map(k => k.metric_type)).size;

    return {
      ...patient,
      total_sessions: sessions.length,
      avg_progress_score: avgProgressScore,
      last_session_date: lastSession?.session_date || null,
      tracked_metrics: trackedMetrics
    };
  }

  async getTherapistKPIs(therapistId: number) {
    await this.delay();
    const patients = this.patients.filter(p => p.therapist_id === therapistId);
    const sessions = this.therapySessions.filter(s => s.therapist_id === therapistId);
    
    const avgProgressScore = sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.progress_score, 0) / sessions.length : 0;
    
    // Sessions in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSessions = sessions.filter(s => new Date(s.session_date) > thirtyDaysAgo);

    return {
      total_patients: patients.length,
      total_sessions: sessions.length,
      avg_progress_score: avgProgressScore,
      sessions_last_30_days: recentSessions.length
    };
  }

  async getEEGData(patientId: number, sessionId?: number): Promise<EEGReading[]> {
    await this.delay();
    if (sessionId) {
      return this.eegReadings.filter(r => r.patient_id === patientId && r.session_id === sessionId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } else {
      return this.eegReadings.filter(r => r.patient_id === patientId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 100);
    }
  }

  async getAllPatients(): Promise<Patient[]> {
    await this.delay();
    return this.patients.map(patient => {
      const therapist = this.users.find(u => u.id === patient.therapist_id);
      const parent = this.users.find(u => u.id === patient.parent_id);
      return {
        ...patient,
        therapist_name: therapist?.name,
        parent_name: parent?.name
      } as any;
    });
  }

  async getPatientSessions(patientId: number): Promise<TherapySession[]> {
    await this.delay();
    return this.therapySessions.filter(s => s.patient_id === patientId)
      .map(session => {
        const therapist = this.users.find(u => u.id === session.therapist_id);
        return {
          ...session,
          therapist_name: therapist?.name
        } as any;
      })
      .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());
  }
}

// Export singleton instance
export const dbService = new MockDatabaseService();
export default MockDatabaseService;

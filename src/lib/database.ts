import Database from 'better-sqlite3';
import path from 'path';

// Database interface types
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

class DatabaseService {
  private db: Database.Database;

  constructor() {
    // In a real app, this would be in a more permanent location
    const dbPath = path.join(process.cwd(), 'cognicare.db');
    this.db = new Database(dbPath);
    this.initializeTables();
    this.seedSampleData();
  }

  private initializeTables() {
    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT CHECK(role IN ('therapist', 'parent', 'child')) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Patients table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        condition TEXT NOT NULL,
        therapist_id INTEGER NOT NULL,
        parent_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (therapist_id) REFERENCES users(id),
        FOREIGN KEY (parent_id) REFERENCES users(id)
      )
    `);

    // Therapy sessions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS therapy_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        therapist_id INTEGER NOT NULL,
        session_date DATETIME NOT NULL,
        duration_minutes INTEGER NOT NULL,
        session_type TEXT NOT NULL,
        progress_score REAL NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (therapist_id) REFERENCES users(id)
      )
    `);

    // KPI metrics table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS kpi_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        metric_type TEXT NOT NULL,
        metric_value REAL NOT NULL,
        measurement_date DATETIME NOT NULL,
        session_id INTEGER,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (session_id) REFERENCES therapy_sessions(id)
      )
    `);

    // EEG readings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS eeg_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        session_id INTEGER NOT NULL,
        timestamp DATETIME NOT NULL,
        alpha_waves REAL NOT NULL,
        beta_waves REAL NOT NULL,
        theta_waves REAL NOT NULL,
        delta_waves REAL NOT NULL,
        attention_level REAL NOT NULL,
        focus_score REAL NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (session_id) REFERENCES therapy_sessions(id)
      )
    `);
  }

  private seedSampleData() {
    // Check if data already exists
    const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (userCount.count > 0) return;

    // Insert sample users
    const insertUser = this.db.prepare(`
      INSERT INTO users (name, email, role) VALUES (?, ?, ?)
    `);

    // Therapists
    insertUser.run('Dr. Sarah Johnson', 'sarah.johnson@cognicare.com', 'therapist');
    insertUser.run('Dr. Michael Chen', 'michael.chen@cognicare.com', 'therapist');
    insertUser.run('Dr. Emily Rodriguez', 'emily.rodriguez@cognicare.com', 'therapist');

    // Parents
    insertUser.run('Jennifer Smith', 'jennifer.smith@email.com', 'parent');
    insertUser.run('Robert Brown', 'robert.brown@email.com', 'parent');
    insertUser.run('Lisa Wilson', 'lisa.wilson@email.com', 'parent');
    insertUser.run('David Miller', 'david.miller@email.com', 'parent');

    // Children
    insertUser.run('Emma Smith', 'emma.smith@email.com', 'child');
    insertUser.run('Alex Brown', 'alex.brown@email.com', 'child');
    insertUser.run('Sophia Wilson', 'sophia.wilson@email.com', 'child');
    insertUser.run('Noah Miller', 'noah.miller@email.com', 'child');

    // Insert sample patients
    const insertPatient = this.db.prepare(`
      INSERT INTO patients (name, age, condition, therapist_id, parent_id) VALUES (?, ?, ?, ?, ?)
    `);

    insertPatient.run('Emma Smith', 8, 'ADHD', 1, 4);
    insertPatient.run('Alex Brown', 10, 'Autism Spectrum Disorder', 2, 5);
    insertPatient.run('Sophia Wilson', 7, 'Learning Disability', 1, 6);
    insertPatient.run('Noah Miller', 9, 'ADHD', 3, 7);

    // Insert sample therapy sessions
    const insertSession = this.db.prepare(`
      INSERT INTO therapy_sessions (patient_id, therapist_id, session_date, duration_minutes, session_type, progress_score, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const sessions = [
      [1, 1, '2025-09-01 10:00:00', 45, 'Attention Training', 7.5, 'Good focus improvement'],
      [1, 1, '2025-09-03 10:00:00', 45, 'Memory Training', 8.0, 'Excellent memory recall'],
      [1, 1, '2025-09-05 10:00:00', 45, 'EEG Neurofeedback', 7.8, 'Stable alpha waves'],
      [2, 2, '2025-09-02 11:00:00', 60, 'Social Skills', 6.5, 'Progress in communication'],
      [2, 2, '2025-09-04 11:00:00', 60, 'Attention Training', 7.0, 'Better sustained attention'],
      [3, 1, '2025-09-01 14:00:00', 45, 'Reading Comprehension', 8.5, 'Significant improvement'],
      [3, 1, '2025-09-03 14:00:00', 45, 'Mathematical Skills', 7.2, 'Problem-solving enhanced'],
      [4, 3, '2025-09-02 15:00:00', 45, 'Impulse Control', 6.8, 'Better self-regulation'],
    ];

    sessions.forEach(session => insertSession.run(...session));

    // Insert KPI metrics
    const insertKPI = this.db.prepare(`
      INSERT INTO kpi_metrics (patient_id, metric_type, metric_value, measurement_date, session_id) 
      VALUES (?, ?, ?, ?, ?)
    `);

    const kpiData = [
      // Emma Smith (Patient 1) KPIs
      [1, 'attention_span_minutes', 15, '2025-09-01 10:45:00', 1],
      [1, 'accuracy_percentage', 85, '2025-09-01 10:45:00', 1],
      [1, 'reaction_time_ms', 450, '2025-09-01 10:45:00', 1],
      [1, 'attention_span_minutes', 18, '2025-09-03 10:45:00', 2],
      [1, 'accuracy_percentage', 88, '2025-09-03 10:45:00', 2],
      [1, 'memory_recall_percentage', 75, '2025-09-03 10:45:00', 2],
      [1, 'alpha_wave_coherence', 0.75, '2025-09-05 10:45:00', 3],
      [1, 'beta_wave_ratio', 0.65, '2025-09-05 10:45:00', 3],

      // Alex Brown (Patient 2) KPIs
      [2, 'social_interaction_score', 6.5, '2025-09-02 12:00:00', 4],
      [2, 'communication_attempts', 12, '2025-09-02 12:00:00', 4],
      [2, 'attention_span_minutes', 20, '2025-09-04 12:00:00', 5],
      [2, 'task_completion_rate', 70, '2025-09-04 12:00:00', 5],

      // Sophia Wilson (Patient 3) KPIs
      [3, 'reading_comprehension_score', 85, '2025-09-01 14:45:00', 6],
      [3, 'reading_speed_wpm', 45, '2025-09-01 14:45:00', 6],
      [3, 'math_problem_accuracy', 72, '2025-09-03 14:45:00', 7],
      [3, 'problem_solving_time_seconds', 120, '2025-09-03 14:45:00', 7],

      // Noah Miller (Patient 4) KPIs
      [4, 'impulse_control_score', 6.8, '2025-09-02 15:45:00', 8],
      [4, 'attention_duration_minutes', 16, '2025-09-02 15:45:00', 8],
      [4, 'hyperactivity_incidents', 3, '2025-09-02 15:45:00', 8],
    ];

    kpiData.forEach(kpi => insertKPI.run(...kpi));

    // Insert sample EEG readings
    const insertEEG = this.db.prepare(`
      INSERT INTO eeg_readings (patient_id, session_id, timestamp, alpha_waves, beta_waves, theta_waves, delta_waves, attention_level, focus_score) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Generate EEG readings for Emma's neurofeedback session
    const baseTime = new Date('2025-09-05 10:00:00');
    for (let i = 0; i < 30; i++) {
      const timestamp = new Date(baseTime.getTime() + i * 60000); // Every minute
      insertEEG.run(
        1, // patient_id
        3, // session_id
        timestamp.toISOString(),
        Math.random() * 20 + 10, // alpha_waves (10-30)
        Math.random() * 15 + 15, // beta_waves (15-30)
        Math.random() * 10 + 5,  // theta_waves (5-15)
        Math.random() * 5 + 2,   // delta_waves (2-7)
        Math.random() * 40 + 60, // attention_level (60-100)
        Math.random() * 30 + 70  // focus_score (70-100)
      );
    }
  }

  // KPI Query methods
  getPatientKPIs(patientId: number): KPIMetrics[] {
    return this.db.prepare(`
      SELECT * FROM kpi_metrics 
      WHERE patient_id = ? 
      ORDER BY measurement_date DESC
    `).all(patientId) as KPIMetrics[];
  }

  getKPITrends(patientId: number, metricType: string): KPIMetrics[] {
    return this.db.prepare(`
      SELECT * FROM kpi_metrics 
      WHERE patient_id = ? AND metric_type = ? 
      ORDER BY measurement_date ASC
    `).all(patientId, metricType) as KPIMetrics[];
  }

  getOverallKPISummary() {
    return this.db.prepare(`
      SELECT 
        COUNT(DISTINCT patient_id) as total_patients,
        COUNT(DISTINCT session_id) as total_sessions,
        AVG(CASE WHEN metric_type = 'attention_span_minutes' THEN metric_value END) as avg_attention_span,
        AVG(CASE WHEN metric_type = 'accuracy_percentage' THEN metric_value END) as avg_accuracy,
        AVG(CASE WHEN metric_type = 'task_completion_rate' THEN metric_value END) as avg_completion_rate
      FROM kpi_metrics
    `).get();
  }

  getPatientProgressSummary(patientId: number) {
    return this.db.prepare(`
      SELECT 
        p.name,
        p.age,
        p.condition,
        COUNT(ts.id) as total_sessions,
        AVG(ts.progress_score) as avg_progress_score,
        MAX(ts.session_date) as last_session_date,
        COUNT(DISTINCT km.metric_type) as tracked_metrics
      FROM patients p
      LEFT JOIN therapy_sessions ts ON p.id = ts.patient_id
      LEFT JOIN kpi_metrics km ON p.id = km.patient_id
      WHERE p.id = ?
      GROUP BY p.id
    `).get(patientId);
  }

  getTherapistKPIs(therapistId: number) {
    return this.db.prepare(`
      SELECT 
        COUNT(DISTINCT p.id) as total_patients,
        COUNT(ts.id) as total_sessions,
        AVG(ts.progress_score) as avg_progress_score,
        COUNT(CASE WHEN ts.session_date >= date('now', '-30 days') THEN 1 END) as sessions_last_30_days
      FROM users u
      LEFT JOIN patients p ON u.id = p.therapist_id
      LEFT JOIN therapy_sessions ts ON p.id = ts.patient_id
      WHERE u.id = ? AND u.role = 'therapist'
      GROUP BY u.id
    `).get(therapistId);
  }

  getEEGData(patientId: number, sessionId?: number): EEGReading[] {
    if (sessionId) {
      return this.db.prepare(`
        SELECT * FROM eeg_readings 
        WHERE patient_id = ? AND session_id = ? 
        ORDER BY timestamp ASC
      `).all(patientId, sessionId) as EEGReading[];
    } else {
      return this.db.prepare(`
        SELECT * FROM eeg_readings 
        WHERE patient_id = ? 
        ORDER BY timestamp DESC 
        LIMIT 100
      `).all(patientId) as EEGReading[];
    }
  }

  getAllPatients(): Patient[] {
    return this.db.prepare(`
      SELECT p.*, u1.name as therapist_name, u2.name as parent_name
      FROM patients p
      LEFT JOIN users u1 ON p.therapist_id = u1.id
      LEFT JOIN users u2 ON p.parent_id = u2.id
      ORDER BY p.name
    `).all() as Patient[];
  }

  getPatientSessions(patientId: number): TherapySession[] {
    return this.db.prepare(`
      SELECT ts.*, u.name as therapist_name
      FROM therapy_sessions ts
      LEFT JOIN users u ON ts.therapist_id = u.id
      WHERE ts.patient_id = ?
      ORDER BY ts.session_date DESC
    `).all(patientId) as TherapySession[];
  }

  close() {
    this.db.close();
  }
}

// Export singleton instance
export const dbService = new DatabaseService();
export default DatabaseService;

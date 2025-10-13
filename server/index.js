import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'cognicare.db');
const db = new Database.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('therapist', 'parent', 'child')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Patients table
  db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      condition TEXT NOT NULL,
      therapist_id INTEGER NOT NULL,
      parent_id INTEGER,
      progress REAL DEFAULT 0,
      trend TEXT CHECK(trend IN ('improving', 'stable', 'declining')) DEFAULT 'stable',
      status TEXT CHECK(status IN ('active', 'inactive', 'completed')) DEFAULT 'active',
      last_session TEXT,
      next_session TEXT,
      completed_sessions INTEGER DEFAULT 0,
      total_sessions INTEGER DEFAULT 0,
      parent_info TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (therapist_id) REFERENCES users(id),
      FOREIGN KEY (parent_id) REFERENCES users(id)
    )
  `);

  // Therapy sessions table
  db.run(`
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
  db.run(`
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

  // Game sessions table
  db.run(`
    CREATE TABLE IF NOT EXISTS game_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      game_id TEXT NOT NULL,
      game_name TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      duration_seconds INTEGER,
      score INTEGER NOT NULL DEFAULT 0,
      stars_earned INTEGER NOT NULL DEFAULT 0,
      level_reached INTEGER DEFAULT 1,
      difficulty TEXT DEFAULT 'easy',
      cognitive_skill TEXT NOT NULL,
      game_data TEXT, -- JSON data for specific game metrics
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);

  // Game achievements table
  db.run(`
    CREATE TABLE IF NOT EXISTS game_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      achievement_name TEXT NOT NULL,
      achievement_type TEXT NOT NULL,
      unlocked_at DATETIME NOT NULL,
      game_session_id INTEGER,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (game_session_id) REFERENCES game_sessions(id)
    )
  `);

  // Reports table
  db.run(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      therapist_id INTEGER NOT NULL,
      patient_id INTEGER NOT NULL,
      report_type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT CHECK(status IN ('generating', 'ready', 'error')) DEFAULT 'generating',
      data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (therapist_id) REFERENCES users(id),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);

  // Seed sample data
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (err) {
      console.error('Error checking users:', err);
      return;
    }
    
    if (row.count === 0) {
      console.log('Seeding sample data...');
      
      // Insert sample users
      const users = [
        ['Dr. Sarah Johnson', 'sarah.johnson@cognicare.com', 'demo123', 'therapist'],
        ['Dr. Michael Chen', 'michael.chen@cognicare.com', 'demo123', 'therapist'],
        ['Dr. Emily Rodriguez', 'emily.rodriguez@cognicare.com', 'demo123', 'therapist'],
        ['Jennifer Smith', 'jennifer.smith@email.com', 'demo123', 'parent'],
        ['Robert Brown', 'robert.brown@email.com', 'demo123', 'parent'],
        ['Lisa Wilson', 'lisa.wilson@email.com', 'demo123', 'parent'],
        ['David Miller', 'david.miller@email.com', 'demo123', 'parent'],
        ['Emma Rodriguez', 'child@demo.com', 'demo123', 'child']
      ];

      const insertUser = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
      users.forEach(user => insertUser.run(...user));
      insertUser.finalize();

      // Insert sample patients
      const patients = [
        ['Emma Smith', 8, 'ADHD', 1, 4, 75, 'improving', 'active', '2025-01-15', '2025-01-22', 12, 15, '{"name":"Jennifer Smith","email":"jennifer.smith@email.com","phone":"555-0123"}', 'Good progress with attention training'],
        ['Alex Brown', 10, 'Autism Spectrum Disorder', 2, 5, 68, 'stable', 'active', '2025-01-14', '2025-01-21', 8, 12, '{"name":"Robert Brown","email":"robert.brown@email.com","phone":"555-0124"}', 'Social skills improving'],
        ['Sophia Wilson', 7, 'Learning Disability', 1, 6, 82, 'improving', 'active', '2025-01-13', '2025-01-20', 10, 12, '{"name":"Lisa Wilson","email":"lisa.wilson@email.com","phone":"555-0125"}', 'Reading comprehension enhanced'],
        ['Noah Miller', 9, 'ADHD', 3, 7, 71, 'stable', 'active', '2025-01-12', '2025-01-19', 6, 10, '{"name":"David Miller","email":"david.miller@email.com","phone":"555-0126"}', 'Impulse control training ongoing']
      ];

      const insertPatient = db.prepare(`
        INSERT INTO patients (name, age, condition, therapist_id, parent_id, progress, trend, status, last_session, next_session, completed_sessions, total_sessions, parent_info, notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      patients.forEach(patient => insertPatient.run(...patient));
      insertPatient.finalize();

      // Insert sample therapy sessions
      const sessions = [
        [1, 1, '2025-01-15 10:00:00', 45, 'Attention Training', 7.5, 'Good focus improvement'],
        [1, 1, '2025-01-13 10:00:00', 45, 'Memory Training', 8.0, 'Excellent memory recall'],
        [1, 1, '2025-01-11 10:00:00', 45, 'EEG Neurofeedback', 7.8, 'Stable alpha waves'],
        [2, 2, '2025-01-14 11:00:00', 60, 'Social Skills', 6.5, 'Progress in communication'],
        [2, 2, '2025-01-12 11:00:00', 60, 'Attention Training', 7.0, 'Better sustained attention'],
        [3, 1, '2025-01-13 14:00:00', 45, 'Reading Comprehension', 8.5, 'Significant improvement'],
        [3, 1, '2025-01-11 14:00:00', 45, 'Mathematical Skills', 7.2, 'Problem-solving enhanced'],
        [4, 3, '2025-01-12 15:00:00', 45, 'Impulse Control', 6.8, 'Better self-regulation']
      ];

      const insertSession = db.prepare(`
        INSERT INTO therapy_sessions (patient_id, therapist_id, session_date, duration_minutes, session_type, progress_score, notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      sessions.forEach(session => insertSession.run(...session));
      insertSession.finalize();

      // Insert sample KPI metrics
      const kpiData = [
        // Emma Smith (Patient 1) KPIs
        [1, 'attention_span_minutes', 15, '2025-01-15 10:45:00', 1],
        [1, 'accuracy_percentage', 85, '2025-01-15 10:45:00', 1],
        [1, 'reaction_time_ms', 450, '2025-01-15 10:45:00', 1],
        [1, 'attention_span_minutes', 18, '2025-01-13 10:45:00', 2],
        [1, 'accuracy_percentage', 88, '2025-01-13 10:45:00', 2],
        [1, 'memory_recall_percentage', 75, '2025-01-13 10:45:00', 2],
        [1, 'alpha_wave_coherence', 0.75, '2025-01-11 10:45:00', 3],
        [1, 'beta_wave_ratio', 0.65, '2025-01-11 10:45:00', 3],

        // Alex Brown (Patient 2) KPIs
        [2, 'social_interaction_score', 6.5, '2025-01-14 12:00:00', 4],
        [2, 'communication_attempts', 12, '2025-01-14 12:00:00', 4],
        [2, 'attention_span_minutes', 20, '2025-01-12 12:00:00', 5],
        [2, 'task_completion_rate', 70, '2025-01-12 12:00:00', 5],

        // Sophia Wilson (Patient 3) KPIs
        [3, 'reading_comprehension_score', 85, '2025-01-13 14:45:00', 6],
        [3, 'reading_speed_wpm', 45, '2025-01-13 14:45:00', 6],
        [3, 'math_problem_accuracy', 72, '2025-01-11 14:45:00', 7],
        [3, 'problem_solving_time_seconds', 120, '2025-01-11 14:45:00', 7],

        // Noah Miller (Patient 4) KPIs
        [4, 'impulse_control_score', 6.8, '2025-01-12 15:45:00', 8],
        [4, 'attention_duration_minutes', 16, '2025-01-12 15:45:00', 8],
        [4, 'hyperactivity_incidents', 3, '2025-01-12 15:45:00', 8]
      ];

      const insertKPI = db.prepare(`
        INSERT INTO kpi_metrics (patient_id, metric_type, metric_value, measurement_date, session_id) 
        VALUES (?, ?, ?, ?, ?)
      `);
      kpiData.forEach(kpi => insertKPI.run(...kpi));
      insertKPI.finalize();

      // Insert sample EEG readings
      const insertEEG = db.prepare(`
        INSERT INTO eeg_readings (patient_id, session_id, timestamp, alpha_waves, beta_waves, theta_waves, delta_waves, attention_level, focus_score) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // Generate EEG readings for Emma's neurofeedback session (session 3)
      const baseTime = new Date('2025-01-11 10:00:00');
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
      insertEEG.finalize();

      console.log('Sample data seeded successfully!');
    }
  });
});

// API Routes

// Users
app.get('/api/users', (req, res) => {
  db.all('SELECT id, name, email, role, created_at FROM users', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT id, name, email, role, created_at FROM users WHERE email = ? AND password = ?', 
    [email, password], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      res.json(row);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

app.post('/api/users/register', (req, res) => {
  const { name, email, password, role } = req.body;
  db.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', 
    [name, email, password, role], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, email, role });
  });
});

// Patients
app.get('/api/patients', (req, res) => {
  db.all(`
    SELECT p.*, u1.name as therapist_name, u2.name as parent_name
    FROM patients p
    LEFT JOIN users u1 ON p.therapist_id = u1.id
    LEFT JOIN users u2 ON p.parent_id = u2.id
    ORDER BY p.name
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/patients', (req, res) => {
  const { name, age, condition, therapist_id, parent_id, notes } = req.body;
  db.run(`
    INSERT INTO patients (name, age, condition, therapist_id, parent_id, notes) 
    VALUES (?, ?, ?, ?, ?, ?)
  `, [name, age, condition, therapist_id, parent_id, notes], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

// Sessions
app.get('/api/sessions/:patientId', (req, res) => {
  const { patientId } = req.params;
  db.all(`
    SELECT ts.*, u.name as therapist_name
    FROM therapy_sessions ts
    LEFT JOIN users u ON ts.therapist_id = u.id
    WHERE ts.patient_id = ?
    ORDER BY ts.session_date DESC
  `, [patientId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// KPI Metrics
app.get('/api/kpis/:patientId', (req, res) => {
  const { patientId } = req.params;
  db.all(`
    SELECT * FROM kpi_metrics 
    WHERE patient_id = ? 
    ORDER BY measurement_date DESC
  `, [patientId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// EEG Data
app.get('/api/eeg/:patientId', (req, res) => {
  const { patientId } = req.params;
  const { sessionId } = req.query;
  
  let query = 'SELECT * FROM eeg_readings WHERE patient_id = ?';
  let params = [patientId];
  
  if (sessionId) {
    query += ' AND session_id = ?';
    params.push(sessionId);
  }
  
  query += ' ORDER BY timestamp DESC LIMIT 100';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Reports
app.get('/api/reports/:therapistId', (req, res) => {
  const { therapistId } = req.params;
  db.all(`
    SELECT r.*, p.name as patient_name
    FROM reports r
    LEFT JOIN patients p ON r.patient_id = p.id
    WHERE r.therapist_id = ?
    ORDER BY r.created_at DESC
  `, [therapistId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Game sessions API endpoints
app.post('/api/game-sessions', (req, res) => {
  const { patient_id, game_id, game_name, start_time, cognitive_skill, difficulty = 'easy' } = req.body;
  
  if (!patient_id || !game_id || !game_name || !start_time || !cognitive_skill) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const stmt = db.prepare(`
    INSERT INTO game_sessions (patient_id, game_id, game_name, start_time, cognitive_skill, difficulty)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(patient_id, game_id, game_name, start_time, cognitive_skill, difficulty);
  stmt.finalize();
  
  res.json({ 
    id: result.lastInsertRowid,
    message: 'Game session started successfully'
  });
});

app.put('/api/game-sessions/:id', (req, res) => {
  const { id } = req.params;
  const { end_time, duration_seconds, score, stars_earned, level_reached, game_data } = req.body;
  
  const stmt = db.prepare(`
    UPDATE game_sessions 
    SET end_time = ?, duration_seconds = ?, score = ?, stars_earned = ?, level_reached = ?, game_data = ?
    WHERE id = ?
  `);
  
  const result = stmt.run(end_time, duration_seconds, score, stars_earned, level_reached, game_data, id);
  stmt.finalize();
  
  if (result.changes === 0) {
    res.status(404).json({ error: 'Game session not found' });
    return;
  }
  
  res.json({ message: 'Game session updated successfully' });
});

app.get('/api/game-sessions/:patientId', (req, res) => {
  const { patientId } = req.params;
  
  db.all(`
    SELECT * FROM game_sessions 
    WHERE patient_id = ? 
    ORDER BY start_time DESC
  `, [patientId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/game-achievements', (req, res) => {
  const { patient_id, achievement_name, achievement_type, game_session_id } = req.body;
  
  if (!patient_id || !achievement_name || !achievement_type) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const stmt = db.prepare(`
    INSERT INTO game_achievements (patient_id, achievement_name, achievement_type, unlocked_at, game_session_id)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(patient_id, achievement_name, achievement_type, new Date().toISOString(), game_session_id);
  stmt.finalize();
  
  res.json({ 
    id: result.lastInsertRowid,
    message: 'Achievement unlocked successfully'
  });
});

app.get('/api/game-achievements/:patientId', (req, res) => {
  const { patientId } = req.params;
  
  db.all(`
    SELECT * FROM game_achievements 
    WHERE patient_id = ? 
    ORDER BY unlocked_at DESC
  `, [patientId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SQLite Server running on http://localhost:${PORT}`);
  console.log(`📁 Database file: ${dbPath}`);
  console.log(`💾 You can now see the cognicare.db file in the server/ folder!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
});

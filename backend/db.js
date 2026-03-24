const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'gugu.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // Users Table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('patient', 'therapist'))
      )
    `);

    // MoodLogs Table
    db.run(`
      CREATE TABLE IF NOT EXISTS mood_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        score INTEGER NOT NULL CHECK(score BETWEEN 1 AND 5),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // PatientSummaries Table
    db.run(`
      CREATE TABLE IF NOT EXISTS patient_summaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        summary TEXT NOT NULL,
        severity TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in-progress', 'resolved')),
        conversation_snippet TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id)
      )
    `);

    // Notes Table
    db.run(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        therapist_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (therapist_id) REFERENCES users(id)
      )
    `);

    // Appointments Table
    db.run(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        therapist_id INTEGER NOT NULL,
        patient_name TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        type TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (therapist_id) REFERENCES users(id)
      )
    `);

    // Therapist Profiles Table
    db.run(`
      CREATE TABLE IF NOT EXISTS therapist_profiles (
        therapist_id INTEGER PRIMARY KEY,
        hourly_rate INTEGER DEFAULT 150,
        bio TEXT DEFAULT '',
        specialties TEXT DEFAULT '',
        notify_email BOOLEAN DEFAULT 1,
        notify_sms BOOLEAN DEFAULT 0,
        FOREIGN KEY (therapist_id) REFERENCES users(id)
      )
    `);

    // Therapy Requests Table (AI matching pipeline)
    db.run(`
      CREATE TABLE IF NOT EXISTS therapy_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        patient_name TEXT NOT NULL,
        ai_summary TEXT NOT NULL,
        domain TEXT DEFAULT 'general',
        severity TEXT DEFAULT 'moderate',
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','scheduled','completed','rejected')),
        therapist_id INTEGER,
        therapist_note TEXT DEFAULT '',
        scheduled_date TEXT,
        scheduled_time TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id),
        FOREIGN KEY (therapist_id) REFERENCES users(id)
      )
    `);

    // Optionally insert a default therapist if not exists
    db.get("SELECT id FROM users WHERE email = 'dr.chen@gugu.com'", (err, row) => {
      if (!row) {
        const bcrypt = require('bcrypt');
        const hash = bcrypt.hashSync('therapist123', 10);
        db.run("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
          ['Dr. Sarah Chen', 'dr.chen@gugu.com', hash, 'therapist']);
      }
    });

  });
}

module.exports = db;

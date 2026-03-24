const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./db');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'gugu-secret-key-123!@#';

app.use(cors());
app.use(express.json());

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, hash, role],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Email already exists' });
                    }
                    return res.status(500).json({ error: 'Database error' });
                }
                const token = jwt.sign({ id: this.lastID, email, name, role }, JWT_SECRET, { expiresIn: '24h' });
                res.status(201).json({ token, user: { id: this.lastID, name, email, role } });
            }
        );
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// --- PATIENT ESCALATION ROUTES ---

// Submit a new patient summary (escalation from AI chatbot)
app.post('/api/summaries', authenticateToken, (req, res) => {
    if (req.user.role !== 'patient') return res.status(403).json({ error: 'Only patients can create escalations' });

    const { summary, severity, conversation_snippet } = req.body;
    const patient_id = req.user.id;

    db.run(
        'INSERT INTO patient_summaries (patient_id, summary, severity, conversation_snippet) VALUES (?, ?, ?, ?)',
        [patient_id, summary, severity, conversation_snippet],
        function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.status(201).json({ id: this.lastID, message: 'Summary saved successfully' });
        }
    );
});

// Get all summaries for Therapist Dashboard
app.get('/api/summaries', authenticateToken, (req, res) => {
    if (req.user.role !== 'therapist') return res.status(403).json({ error: 'Access denied' });

    const query = `
        SELECT s.id, s.summary, s.severity, s.status, s.conversation_snippet, s.timestamp, 
               u.name as patientName, u.email as patientEmail 
        FROM patient_summaries s
        JOIN users u ON s.patient_id = u.id
        ORDER BY s.timestamp DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Update summary status (e.g., from 'pending' to 'resolved')
app.patch('/api/summaries/:id/status', authenticateToken, (req, res) => {
    if (req.user.role !== 'therapist') return res.status(403).json({ error: 'Access denied' });

    const { status } = req.body;
    if (!['pending', 'in-progress', 'resolved'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    db.run(
        'UPDATE patient_summaries SET status = ? WHERE id = ?',
        [status, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Status updated successfully' });
        }
    );
});

// --- THERAPIST TOOLS ROUTES ---

// Get all connected patients
app.get('/api/patients', authenticateToken, (req, res) => {
    if (req.user.role !== 'therapist') return res.status(403).json({ error: 'Access denied' });
    const query = `
        SELECT DISTINCT u.id, u.name, u.email 
        FROM users u 
        JOIN therapy_requests t ON u.name = t.patient_name 
        WHERE t.therapist_id = ? AND t.status IN ('approved', 'scheduled', 'completed', 'resolved')
    `;
    db.all(query, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Get all therapists for patient directory
app.get('/api/therapists', authenticateToken, (req, res) => {
    const query = `
        SELECT u.id, u.name, u.email,
               p.hourly_rate, p.bio, p.specialties
        FROM users u
        LEFT JOIN therapist_profiles p ON u.id = p.therapist_id
        WHERE u.role = 'therapist'
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        const formatted = rows.map(r => ({
            id: r.id,
            name: r.name,
            email: r.email,
            hourly_rate: r.hourly_rate || 150,
            bio: r.bio || 'Licensed mental health professional ready to support your journey.',
            specialties: r.specialties || 'General Therapy, Anxiety, Stress'
        }));

        res.json(formatted);
    });
});

// Get notes
app.get('/api/notes', authenticateToken, (req, res) => {
    if (req.user.role !== 'therapist') return res.status(403).json({ error: 'Access denied' });
    db.all("SELECT * FROM notes WHERE therapist_id = ? ORDER BY timestamp DESC", [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Create note
app.post('/api/notes', authenticateToken, (req, res) => {
    if (req.user.role !== 'therapist') return res.status(403).json({ error: 'Access denied' });
    const { title, content } = req.body;
    db.run(
        'INSERT INTO notes (therapist_id, title, content) VALUES (?, ?, ?)',
        [req.user.id, title, content],
        function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.status(201).json({ id: this.lastID, message: 'Note saved successfully' });
        }
    );
});

// Delete note
app.delete('/api/notes/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'therapist') return res.status(403).json({ error: 'Access denied' });
    db.run('DELETE FROM notes WHERE id = ? AND therapist_id = ?', [req.params.id, req.user.id], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Note deleted' });
    });
});

// Get appointments
app.get('/api/appointments', authenticateToken, (req, res) => {
    if (req.user.role !== 'therapist') return res.status(403).json({ error: 'Access denied' });
    db.all("SELECT * FROM appointments WHERE therapist_id = ? ORDER BY date ASC, time ASC", [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Get appointments for patient
app.get('/api/appointments/patient', authenticateToken, (req, res) => {
    if (req.user.role !== 'patient') return res.status(403).json({ error: 'Access denied' });

    // For this prototype, we match by patient_name. In production, we'd use patient_id.
    const query = `
        SELECT a.id, a.date, a.time, a.type, u.name as therapist_name
        FROM appointments a
        JOIN users u ON a.therapist_id = u.id
        WHERE a.patient_name = ?
        ORDER BY a.date ASC, a.time ASC
    `;
    db.all(query, [req.user.name], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Create appointment
app.post('/api/appointments', authenticateToken, (req, res) => {
    let therapist_id, patient_name;
    const { date, time, type } = req.body;

    if (req.user.role === 'therapist') {
        therapist_id = req.user.id;
        patient_name = req.body.patient_name;
    } else if (req.user.role === 'patient') {
        therapist_id = req.body.therapist_id;
        patient_name = req.user.name; // Taken directly from JWT
    } else {
        return res.status(403).json({ error: 'Access denied' });
    }

    if (!therapist_id || !patient_name || !date || !time) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    db.run(
        'INSERT INTO appointments (therapist_id, patient_name, date, time, type) VALUES (?, ?, ?, ?, ?)',
        [therapist_id, patient_name, date, time, type || 'Standard Consultation'],
        function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.status(201).json({ id: this.lastID, message: 'Appointment saved successfully' });
        }
    );
});

// Update appointment
app.patch('/api/appointments/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'therapist') return res.status(403).json({ error: 'Access denied' });
    const { date, time, type, patient_name } = req.body;
    db.run(
        'UPDATE appointments SET date = COALESCE(?, date), time = COALESCE(?, time), type = COALESCE(?, type), patient_name = COALESCE(?, patient_name) WHERE id = ? AND therapist_id = ?',
        [date, time, type, patient_name, req.params.id, req.user.id],
        function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (this.changes === 0) return res.status(404).json({ error: 'Appointment not found' });
            res.json({ message: 'Appointment updated' });
        }
    );
});

// Delete appointment
app.delete('/api/appointments/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'therapist') return res.status(403).json({ error: 'Access denied' });
    db.run('DELETE FROM appointments WHERE id = ? AND therapist_id = ?', [req.params.id, req.user.id], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ error: 'Appointment not found' });
        res.json({ message: 'Appointment deleted' });
    });
});

// Get therapist profile
app.get('/api/therapist/profile', authenticateToken, (req, res) => {
    if (req.user.role !== 'therapist') return res.status(403).json({ error: 'Access denied' });
    db.get("SELECT * FROM therapist_profiles WHERE therapist_id = ?", [req.user.id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!row) {
            // Return defaults if none
            return res.json({
                hourly_rate: 150,
                bio: '',
                specialties: '',
                notify_email: 1,
                notify_sms: 0
            });
        }
        res.json(row);
    });
});

// Update therapist profile
app.post('/api/therapist/profile', authenticateToken, (req, res) => {
    if (req.user.role !== 'therapist') return res.status(403).json({ error: 'Access denied' });
    const { hourly_rate, bio, specialties, notify_email, notify_sms } = req.body;

    db.run(
        `INSERT INTO therapist_profiles (therapist_id, hourly_rate, bio, specialties, notify_email, notify_sms) 
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(therapist_id) DO UPDATE SET 
         hourly_rate=excluded.hourly_rate, 
         bio=excluded.bio, 
         specialties=excluded.specialties, 
         notify_email=excluded.notify_email, 
         notify_sms=excluded.notify_sms`,
        [req.user.id, hourly_rate, bio, specialties, notify_email ? 1 : 0, notify_sms ? 1 : 0],
        function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Profile updated successfully' });
        }
    );
});

// --- DASHBOARD ROUTE (MOCK DATA + LATEST ESCALATIONS FOR NOW) ---

app.get('/api/dashboard', authenticateToken, (req, res) => {
    if (req.user.role !== 'patient') return res.status(403).json({ error: 'Access denied' });

    // In a fully real scenario, this would aggregate actual sessions and journals.
    // For this build, we return structural realistic data.
    res.json({
        stats: {
            averageMood: 'Peaceful',
            mindfulnessMins: 125,
            sessionsCompleted: 1,
            journalEntries: 3
        },
        moodHistory: [
            { day: 'Mon', score: 3 },
            { day: 'Tue', score: 3 },
            { day: 'Wed', score: 4 },
            { day: 'Thu', score: 2 },
            { day: 'Fri', score: 5 },
            { day: 'Sat', score: 4 },
            { day: 'Sun', score: 4 },
        ]
    });
});

// Start Server
// --- THERAPY REQUEST ROUTES (AI Matching Pipeline) ---

// Patient creates a therapy request (from Chat)
app.post('/api/therapy-requests', authenticateToken, (req, res) => {
    const { ai_summary, domain, severity } = req.body;
    const patientId = req.user.id;
    const patientName = req.user.name;

    if (!ai_summary) return res.status(400).json({ error: 'AI summary is required' });

    db.run(
        `INSERT INTO therapy_requests (patient_id, patient_name, ai_summary, domain, severity) VALUES (?, ?, ?, ?, ?)`,
        [patientId, patientName, ai_summary, domain || 'general', severity || 'moderate'],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            io.emit('new-referral', {
                id: this.lastID,
                patient_name: patientName,
                domain: domain || 'general',
                severity: severity || 'moderate',
                message: `New therapy request from ${patientName}`
            });
            res.status(201).json({ id: this.lastID, message: 'Therapy request created successfully' });
        }
    );
});

// Therapist fetches all pending requests
app.get('/api/therapy-requests/pending', authenticateToken, (req, res) => {
    db.all(
        `SELECT * FROM therapy_requests WHERE status = 'pending' ORDER BY created_at DESC`,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows || []);
        }
    );
});

// Patient fetches their own requests
app.get('/api/therapy-requests/my', authenticateToken, (req, res) => {
    db.all(
        `SELECT tr.*, u.name as therapist_name FROM therapy_requests tr LEFT JOIN users u ON tr.therapist_id = u.id WHERE tr.patient_id = ? ORDER BY tr.created_at DESC`,
        [req.user.id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows || []);
        }
    );
});

// Therapist approves a request
app.patch('/api/therapy-requests/:id/approve', authenticateToken, (req, res) => {
    const requestId = req.params.id;
    const therapistId = req.user.id;

    db.run(
        `UPDATE therapy_requests SET status = 'approved', therapist_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'pending'`,
        [therapistId, requestId],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Request not found or already claimed' });
            db.get(`SELECT patient_id FROM therapy_requests WHERE id = ?`, [requestId], (err2, row) => {
                if (row) {
                    io.emit('request-update', {
                        requestId, patientId: row.patient_id, status: 'approved',
                        therapistName: req.user.name,
                        message: `${req.user.name} has accepted your therapy request!`
                    });
                }
            });
            res.json({ message: 'Request approved successfully' });
        }
    );
});

// Therapist rejects a request
app.patch('/api/therapy-requests/:id/reject', authenticateToken, (req, res) => {
    db.run(
        `UPDATE therapy_requests SET status = 'rejected', therapist_id = ?, therapist_note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'pending'`,
        [req.user.id, req.body.note || '', req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Request not found' });
            res.json({ message: 'Request rejected' });
        }
    );
});

// Therapist schedules a meeting for an approved request
app.patch('/api/therapy-requests/:id/schedule', authenticateToken, (req, res) => {
    const requestId = req.params.id;
    const { date, time } = req.body;
    if (!date || !time) return res.status(400).json({ error: 'Date and time are required' });

    db.run(
        `UPDATE therapy_requests SET status = 'scheduled', scheduled_date = ?, scheduled_time = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND therapist_id = ?`,
        [date, time, requestId, req.user.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Request not found or not yours' });
            db.get(`SELECT patient_name FROM therapy_requests WHERE id = ?`, [requestId], (err2, row) => {
                if (row) {
                    db.run(
                        `INSERT INTO appointments (therapist_id, patient_name, date, time, type) VALUES (?, ?, ?, ?, 'Therapy Session')`,
                        [req.user.id, row.patient_name, date, time]
                    );
                    io.emit('request-update', {
                        requestId, status: 'scheduled', therapistName: req.user.name,
                        date, time,
                        message: `${req.user.name} has scheduled your session for ${date} at ${time}!`
                    });
                }
            });
            res.json({ message: 'Session scheduled successfully' });
        }
    );
});

// WebSockets Real-Time Logic
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a specific appointment room
    socket.on('join-room', ({ roomId, role, name }) => {
        socket.join(roomId);
        console.log(`${name} (${role}) joined room ${roomId}`);

        // Notify others in the room
        socket.to(roomId).emit('user-joined', { role, name, message: `${name} has joined the session.` });
    });

    // Handle SOS Crisis Button
    socket.on('send-sos', (roomId) => {
        socket.to(roomId).emit('receive-sos', { message: 'URGENT: Your patient has triggered a crisis distress signal.' });
    });

    // Handle session end
    socket.on('end-session', ({ roomId, name }) => {
        socket.to(roomId).emit('session-ended', { message: `${name} has ended the session.` });
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} with WebSockets enabled`);
});

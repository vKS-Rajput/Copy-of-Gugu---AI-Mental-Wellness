import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { hashPassword, verifyPassword, createToken, verifyToken } from './auth';

// --- Types ---

type Bindings = {
    DB: D1Database;
    JWT_SECRET: string;
};

type UserPayload = {
    id: number;
    email: string;
    name: string;
    role: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: { user: UserPayload } }>();

// --- Middleware ---

app.use('*', cors({
    origin: ['https://gugu-vert-eight.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Auth middleware (applied per-route, not globally)
async function authMiddleware(c: any, next: any) {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return c.json({ error: 'Access denied' }, 401);

    const user = await verifyToken(token, c.env.JWT_SECRET);
    if (!user) return c.json({ error: 'Invalid token' }, 403);

    c.set('user', user);
    await next();
}

// =====================
// AUTH ROUTES
// =====================

app.post('/api/auth/register', async (c) => {
    const { name, email, password, role } = await c.req.json();

    if (!name || !email || !password || !role) {
        return c.json({ error: 'All fields are required' }, 400);
    }

    try {
        const hash = await hashPassword(password);
        const result = await c.env.DB.prepare(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
        ).bind(name, email, hash, role).run();

        const userId = result.meta.last_row_id;
        const token = await createToken({ id: userId as number, email, name, role }, c.env.JWT_SECRET);
        return c.json({ token, user: { id: userId, name, email, role } }, 201);
    } catch (err: any) {
        if (err?.message?.includes('UNIQUE')) {
            return c.json({ error: 'Email already exists' }, 400);
        }
        return c.json({ error: 'Server error' }, 500);
    }
});

app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json();

    const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    if (!user) return c.json({ error: 'User not found' }, 400);

    const valid = await verifyPassword(password, user.password_hash as string);
    if (!valid) return c.json({ error: 'Invalid password' }, 400);

    const token = await createToken(
        { id: user.id as number, email: user.email as string, name: user.name as string, role: user.role as string },
        c.env.JWT_SECRET
    );
    return c.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.get('/api/auth/me', authMiddleware, async (c) => {
    return c.json({ user: c.get('user') });
});

// =====================
// PATIENT ESCALATION ROUTES
// =====================

app.post('/api/summaries', authMiddleware, async (c) => {
    const user = c.get('user');
    if (user.role !== 'patient') return c.json({ error: 'Only patients can create escalations' }, 403);

    const { summary, severity, conversation_snippet } = await c.req.json();
    const result = await c.env.DB.prepare(
        'INSERT INTO patient_summaries (patient_id, summary, severity, conversation_snippet) VALUES (?, ?, ?, ?)'
    ).bind(user.id, summary, severity, conversation_snippet).run();

    return c.json({ id: result.meta.last_row_id, message: 'Summary saved successfully' }, 201);
});

app.get('/api/summaries', authMiddleware, async (c) => {
    const user = c.get('user');
    if (user.role !== 'therapist') return c.json({ error: 'Access denied' }, 403);

    const { results } = await c.env.DB.prepare(`
    SELECT s.id, s.summary, s.severity, s.status, s.conversation_snippet, s.timestamp,
           u.name as patientName, u.email as patientEmail
    FROM patient_summaries s
    JOIN users u ON s.patient_id = u.id
    ORDER BY s.timestamp DESC
  `).all();

    return c.json(results);
});

app.patch('/api/summaries/:id/status', authMiddleware, async (c) => {
    const user = c.get('user');
    if (user.role !== 'therapist') return c.json({ error: 'Access denied' }, 403);

    const { status } = await c.req.json();
    if (!['pending', 'in-progress', 'resolved'].includes(status)) {
        return c.json({ error: 'Invalid status' }, 400);
    }

    await c.env.DB.prepare('UPDATE patient_summaries SET status = ? WHERE id = ?')
        .bind(status, c.req.param('id')).run();
    return c.json({ message: 'Status updated successfully' });
});

// =====================
// THERAPIST TOOLS ROUTES
// =====================

app.get('/api/patients', authMiddleware, async (c) => {
    const user = c.get('user');
    if (user.role !== 'therapist') return c.json({ error: 'Access denied' }, 403);

    const { results } = await c.env.DB.prepare(`
    SELECT DISTINCT u.id, u.name, u.email
    FROM users u
    JOIN therapy_requests t ON u.name = t.patient_name
    WHERE t.therapist_id = ? AND t.status IN ('approved', 'scheduled', 'completed', 'resolved')
  `).bind(user.id).all();

    return c.json(results);
});

app.get('/api/therapists', authMiddleware, async (c) => {
    const { results } = await c.env.DB.prepare(`
    SELECT u.id, u.name, u.email,
           p.hourly_rate, p.bio, p.specialties
    FROM users u
    LEFT JOIN therapist_profiles p ON u.id = p.therapist_id
    WHERE u.role = 'therapist'
  `).all();

    const formatted = (results || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        hourly_rate: r.hourly_rate || 150,
        bio: r.bio || 'Licensed mental health professional ready to support your journey.',
        specialties: r.specialties || 'General Therapy, Anxiety, Stress'
    }));

    return c.json(formatted);
});

// =====================
// NOTES ROUTES
// =====================

app.get('/api/notes', authMiddleware, async (c) => {
    const user = c.get('user');
    if (user.role !== 'therapist') return c.json({ error: 'Access denied' }, 403);

    const { results } = await c.env.DB.prepare(
        'SELECT * FROM notes WHERE therapist_id = ? ORDER BY timestamp DESC'
    ).bind(user.id).all();

    return c.json(results);
});

app.post('/api/notes', authMiddleware, async (c) => {
    const user = c.get('user');
    if (user.role !== 'therapist') return c.json({ error: 'Access denied' }, 403);

    const { title, content } = await c.req.json();
    const result = await c.env.DB.prepare(
        'INSERT INTO notes (therapist_id, title, content) VALUES (?, ?, ?)'
    ).bind(user.id, title, content).run();

    return c.json({ id: result.meta.last_row_id, message: 'Note saved successfully' }, 201);
});

app.delete('/api/notes/:id', authMiddleware, async (c) => {
    const user = c.get('user');
    if (user.role !== 'therapist') return c.json({ error: 'Access denied' }, 403);

    await c.env.DB.prepare('DELETE FROM notes WHERE id = ? AND therapist_id = ?')
        .bind(c.req.param('id'), user.id).run();
    return c.json({ message: 'Note deleted' });
});

// =====================
// APPOINTMENTS ROUTES
// =====================

app.get('/api/appointments', authMiddleware, async (c) => {
    const user = c.get('user');
    if (user.role !== 'therapist') return c.json({ error: 'Access denied' }, 403);

    const { results } = await c.env.DB.prepare(
        'SELECT * FROM appointments WHERE therapist_id = ? ORDER BY date ASC, time ASC'
    ).bind(user.id).all();

    return c.json(results);
});

app.get('/api/appointments/patient', authMiddleware, async (c) => {
    const user = c.get('user');
    if (user.role !== 'patient') return c.json({ error: 'Access denied' }, 403);

    const { results } = await c.env.DB.prepare(`
    SELECT a.id, a.date, a.time, a.type, u.name as therapist_name
    FROM appointments a
    JOIN users u ON a.therapist_id = u.id
    WHERE a.patient_name = ?
    ORDER BY a.date ASC, a.time ASC
  `).bind(user.name).all();

    return c.json(results);
});

app.post('/api/appointments', authMiddleware, async (c) => {
    const user = c.get('user');
    const body = await c.req.json();
    const { date, time, type } = body;

    let therapist_id: number;
    let patient_name: string;

    if (user.role === 'therapist') {
        therapist_id = user.id;
        patient_name = body.patient_name;
    } else if (user.role === 'patient') {
        therapist_id = body.therapist_id;
        patient_name = user.name;
    } else {
        return c.json({ error: 'Access denied' }, 403);
    }

    if (!therapist_id || !patient_name || !date || !time) {
        return c.json({ error: 'Missing required fields' }, 400);
    }

    const result = await c.env.DB.prepare(
        'INSERT INTO appointments (therapist_id, patient_name, date, time, type) VALUES (?, ?, ?, ?, ?)'
    ).bind(therapist_id, patient_name, date, time, type || 'Standard Consultation').run();

    return c.json({ id: result.meta.last_row_id, message: 'Appointment saved successfully' }, 201);
});

app.patch('/api/appointments/:id', authMiddleware, async (c) => {
    const user = c.get('user');
    if (user.role !== 'therapist') return c.json({ error: 'Access denied' }, 403);

    const body = await c.req.json();
    const { date, time, type, patient_name } = body;

    const info = await c.env.DB.prepare(
        'UPDATE appointments SET date = COALESCE(?, date), time = COALESCE(?, time), type = COALESCE(?, type), patient_name = COALESCE(?, patient_name) WHERE id = ? AND therapist_id = ?'
    ).bind(date || null, time || null, type || null, patient_name || null, c.req.param('id'), user.id).run();

    if (info.meta.changes === 0) return c.json({ error: 'Appointment not found' }, 404);
    return c.json({ message: 'Appointment updated' });
});

app.delete('/api/appointments/:id', authMiddleware, async (c) => {
    const user = c.get('user');
    if (user.role !== 'therapist') return c.json({ error: 'Access denied' }, 403);

    const info = await c.env.DB.prepare(
        'DELETE FROM appointments WHERE id = ? AND therapist_id = ?'
    ).bind(c.req.param('id'), user.id).run();

    if (info.meta.changes === 0) return c.json({ error: 'Appointment not found' }, 404);
    return c.json({ message: 'Appointment deleted' });
});

// =====================
// THERAPIST PROFILE ROUTES
// =====================

app.get('/api/therapist/profile', authMiddleware, async (c) => {
    const user = c.get('user');
    if (user.role !== 'therapist') return c.json({ error: 'Access denied' }, 403);

    const row = await c.env.DB.prepare(
        'SELECT * FROM therapist_profiles WHERE therapist_id = ?'
    ).bind(user.id).first();

    if (!row) {
        return c.json({ hourly_rate: 150, bio: '', specialties: '', notify_email: 1, notify_sms: 0 });
    }
    return c.json(row);
});

app.post('/api/therapist/profile', authMiddleware, async (c) => {
    const user = c.get('user');
    if (user.role !== 'therapist') return c.json({ error: 'Access denied' }, 403);

    const { hourly_rate, bio, specialties, notify_email, notify_sms } = await c.req.json();

    await c.env.DB.prepare(`
    INSERT INTO therapist_profiles (therapist_id, hourly_rate, bio, specialties, notify_email, notify_sms)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(therapist_id) DO UPDATE SET
    hourly_rate=excluded.hourly_rate,
    bio=excluded.bio,
    specialties=excluded.specialties,
    notify_email=excluded.notify_email,
    notify_sms=excluded.notify_sms
  `).bind(user.id, hourly_rate, bio, specialties, notify_email ? 1 : 0, notify_sms ? 1 : 0).run();

    return c.json({ message: 'Profile updated successfully' });
});

// =====================
// DASHBOARD ROUTE
// =====================

app.get('/api/dashboard', authMiddleware, async (c) => {
    const user = c.get('user');
    if (user.role !== 'patient') return c.json({ error: 'Access denied' }, 403);

    return c.json({
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

// =====================
// THERAPY REQUEST ROUTES (AI Matching Pipeline)
// =====================

app.post('/api/therapy-requests', authMiddleware, async (c) => {
    const user = c.get('user');
    const { ai_summary, domain, severity } = await c.req.json();
    if (!ai_summary) return c.json({ error: 'AI summary is required' }, 400);

    const result = await c.env.DB.prepare(
        'INSERT INTO therapy_requests (patient_id, patient_name, ai_summary, domain, severity) VALUES (?, ?, ?, ?, ?)'
    ).bind(user.id, user.name, ai_summary, domain || 'general', severity || 'moderate').run();

    return c.json({ id: result.meta.last_row_id, message: 'Therapy request created successfully' }, 201);
});

app.get('/api/therapy-requests/pending', authMiddleware, async (c) => {
    const { results } = await c.env.DB.prepare(
        "SELECT * FROM therapy_requests WHERE status = 'pending' ORDER BY created_at DESC"
    ).all();

    return c.json(results || []);
});

app.get('/api/therapy-requests/my', authMiddleware, async (c) => {
    const user = c.get('user');

    const { results } = await c.env.DB.prepare(
        `SELECT tr.*, u.name as therapist_name FROM therapy_requests tr
     LEFT JOIN users u ON tr.therapist_id = u.id
     WHERE tr.patient_id = ? ORDER BY tr.created_at DESC`
    ).bind(user.id).all();

    return c.json(results || []);
});

app.patch('/api/therapy-requests/:id/approve', authMiddleware, async (c) => {
    const user = c.get('user');
    const requestId = c.req.param('id');

    const info = await c.env.DB.prepare(
        "UPDATE therapy_requests SET status = 'approved', therapist_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'pending'"
    ).bind(user.id, requestId).run();

    if (info.meta.changes === 0) return c.json({ error: 'Request not found or already claimed' }, 404);
    return c.json({ message: 'Request approved successfully' });
});

app.patch('/api/therapy-requests/:id/reject', authMiddleware, async (c) => {
    const user = c.get('user');
    const body = await c.req.json();

    const info = await c.env.DB.prepare(
        "UPDATE therapy_requests SET status = 'rejected', therapist_id = ?, therapist_note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'pending'"
    ).bind(user.id, body.note || '', c.req.param('id')).run();

    if (info.meta.changes === 0) return c.json({ error: 'Request not found' }, 404);
    return c.json({ message: 'Request rejected' });
});

app.patch('/api/therapy-requests/:id/schedule', authMiddleware, async (c) => {
    const user = c.get('user');
    const requestId = c.req.param('id');
    const { date, time } = await c.req.json();
    if (!date || !time) return c.json({ error: 'Date and time are required' }, 400);

    const info = await c.env.DB.prepare(
        "UPDATE therapy_requests SET status = 'scheduled', scheduled_date = ?, scheduled_time = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND therapist_id = ?"
    ).bind(date, time, requestId, user.id).run();

    if (info.meta.changes === 0) return c.json({ error: 'Request not found or not yours' }, 404);

    // Also create an appointment
    const row = await c.env.DB.prepare('SELECT patient_name FROM therapy_requests WHERE id = ?').bind(requestId).first();
    if (row) {
        await c.env.DB.prepare(
            "INSERT INTO appointments (therapist_id, patient_name, date, time, type) VALUES (?, ?, ?, ?, 'Therapy Session')"
        ).bind(user.id, row.patient_name, date, time).run();
    }

    return c.json({ message: 'Session scheduled successfully' });
});

// =====================
// Health Check
// =====================

app.get('/', (c) => c.json({ status: 'ok', service: 'Gugu Backend API' }));

export default app;

const { Pool } = require('pg');

let pool = null;

/**
 * Returns the shared pg Pool, creating it on first call.
 * In environments without a real DB (e.g. development without Postgres),
 * we return a mock client that silently no-ops so the rest of the app
 * still starts. Set SKIP_DB=true to force this mock.
 */
function getClient() {
  if (pool) return pool;

  if (process.env.SKIP_DB === 'true' || !process.env.DATABASE_URL) {
    console.warn('[DB] DATABASE_URL not set — using in-memory mock (no persistence)');
    pool = createMockClient();
    return pool;
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    console.error('[DB] Unexpected pool error:', err.message);
  });

  return pool;
}

/**
 * In-memory mock database for development without Postgres.
 * Stores data in memory only (lost on restart).
 */
function createMockClient() {
  const tables = {
    users: [],
    jobs: [],
    technicians: [
      {
        id: 'tech-001',
        full_name: 'Marcus Rivera',
        specialties: ['hardware', 'motherboard', 'GPU'],
        rating: 4.9,
        hourly_rate: 85,
        bio: 'Senior hardware specialist with 15 years of experience in desktop and laptop repair.',
        avatar_url: null,
        is_available: true,
        response_time_min: 10,
        created_at: new Date(),
      },
      {
        id: 'tech-002',
        full_name: 'Priya Nair',
        specialties: ['software', 'OS', 'malware removal'],
        rating: 4.8,
        hourly_rate: 75,
        bio: 'Software and OS expert. Specializes in Windows/Linux troubleshooting and malware remediation.',
        avatar_url: null,
        is_available: true,
        response_time_min: 5,
        created_at: new Date(),
      },
      {
        id: 'tech-003',
        full_name: 'Jordan Kim',
        specialties: ['data recovery', 'storage', 'SSD/HDD'],
        rating: 4.7,
        hourly_rate: 95,
        bio: 'Data recovery and storage specialist. Recovers data from failed drives and SSDs.',
        avatar_url: null,
        is_available: true,
        response_time_min: 15,
        created_at: new Date(),
      },
    ],
    sessions: [],
  };

  return {
    query: async (sql, params = []) => {
      const sqlLower = sql.toLowerCase().trim();

      // ── Users ────────────────────────────────────────────────────────────
      if (sqlLower.includes('select') && sqlLower.includes('from users') && sqlLower.includes('email')) {
        const email = params[0];
        const rows = tables.users.filter((u) => u.email === email);
        return { rows };
      }

      if (sqlLower.includes('insert into users')) {
        const [id, email, password_hash, full_name] = params;
        tables.users.push({ id, email, password_hash, full_name, created_at: new Date() });
        return { rows: [], rowCount: 1 };
      }

      if (sqlLower.includes('update users')) {
        return { rows: [], rowCount: 1 };
      }

      // ── Jobs ────────────────────────────────────────────────────────────
      if (sqlLower.includes('select') && sqlLower.includes('from jobs') && sqlLower.includes('user_id')) {
        const userId = params[0];
        if (params[1]) {
          // GET /jobs/:id — params = [id, userId]
          const rows = tables.jobs.filter((j) => j.id === params[0] && j.user_id === params[1]);
          return { rows };
        }
        const rows = tables.jobs
          .filter((j) => j.user_id === userId)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 50);
        return { rows };
      }

      if (sqlLower.includes('select') && sqlLower.includes('from jobs') && sqlLower.includes('where id')) {
        const rows = tables.jobs.filter((j) => j.id === params[0]);
        return { rows };
      }

      if (sqlLower.includes('insert into jobs')) {
        const [id, user_id, description, device_type, device_brand, image_url, diagnosis, status] = params;
        const job = {
          id, user_id, description, device_type, device_brand,
          image_url: image_url || null,
          diagnosis: diagnosis || null,
          status: status || 'pending',
          created_at: new Date(),
          updated_at: new Date(),
        };
        tables.jobs.push(job);
        return { rows: [job], rowCount: 1 };
      }

      if (sqlLower.includes('select * from jobs')) {
        const rows = tables.jobs.filter((j) => j.id === params[0]);
        return { rows };
      }

      // ── Technicians ────────────────────────────────────────────────────
      if (sqlLower.includes('from technicians') && sqlLower.includes('where id')) {
        const rows = tables.technicians.filter((t) => t.id === params[0]);
        return { rows };
      }

      if (sqlLower.includes('from technicians')) {
        const rows = tables.technicians.filter((t) => t.is_available);
        return { rows };
      }

      // ── Sessions ──────────────────────────────────────────────────────
      if (sqlLower.includes('insert into sessions')) {
        const [id, user_id, technician_id, job_id, scheduled_at, notes, status] = params;
        tables.sessions.push({ id, user_id, technician_id, job_id, scheduled_at, notes, status, created_at: new Date() });
        return { rows: [], rowCount: 1 };
      }

      return { rows: [], rowCount: 0 };
    },
  };
}

module.exports = { getClient };

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const { getClient } = require('../db/client');

const router = express.Router();

/**
 * GET /jobs
 * Returns all jobs for the authenticated user, newest first.
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const db = getClient();
    const { rows } = await db.query(
      `SELECT id, description, device_type, device_brand, image_url,
              diagnosis, status, created_at, updated_at
       FROM jobs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.userId]
    );

    const jobs = rows.map((row) => ({
      ...row,
      diagnosis: row.diagnosis ? JSON.parse(row.diagnosis) : null,
    }));

    res.json({ jobs, count: jobs.length });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /jobs
 * Create a manual job entry (without running a diagnosis).
 * Body: { description, device_type, device_brand, status? }
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { description, device_type, device_brand, status = 'pending' } = req.body;

    if (!description || description.trim().length < 5) {
      return res.status(400).json({ error: 'description is required (min 5 characters)' });
    }

    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const db = getClient();
    const jobId = uuidv4();

    await db.query(
      `INSERT INTO jobs (id, user_id, description, device_type, device_brand, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [jobId, req.user.userId, description.trim(), device_type || null, device_brand || null, status]
    );

    const { rows } = await db.query('SELECT * FROM jobs WHERE id = $1', [jobId]);

    res.status(201).json({
      message: 'Job created',
      job: {
        ...rows[0],
        diagnosis: rows[0].diagnosis ? JSON.parse(rows[0].diagnosis) : null,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /jobs/:id
 * Returns a single job belonging to the authenticated user.
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const db = getClient();
    const { rows } = await db.query(
      `SELECT id, description, device_type, device_brand, image_url,
              diagnosis, status, created_at, updated_at
       FROM jobs
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = {
      ...rows[0],
      diagnosis: rows[0].diagnosis ? JSON.parse(rows[0].diagnosis) : null,
    };

    res.json({ job });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const { getClient } = require('../db/client');

const router = express.Router();

/**
 * GET /technicians
 * Returns list of available technicians.
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const db = getClient();
    const { rows } = await db.query(
      `SELECT id, full_name, specialties, rating, hourly_rate, bio,
              avatar_url, is_available, response_time_min, created_at
       FROM technicians
       WHERE is_available = true
       ORDER BY rating DESC`
    );

    res.json({ technicians: rows, count: rows.length });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /technicians/request
 * Book a remote tech session.
 * Body: { technician_id, job_id?, scheduled_at?, notes? }
 */
router.post('/request', authenticate, async (req, res, next) => {
  try {
    const { technician_id, job_id, scheduled_at, notes } = req.body;

    if (!technician_id) {
      return res.status(400).json({ error: 'technician_id is required' });
    }

    const db = getClient();

    // Verify the technician exists and is available
    const techResult = await db.query(
      'SELECT id, full_name, hourly_rate, is_available FROM technicians WHERE id = $1',
      [technician_id]
    );

    if (techResult.rows.length === 0) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    const tech = techResult.rows[0];

    if (!tech.is_available) {
      return res.status(409).json({ error: 'Technician is not currently available' });
    }

    // Verify job belongs to user if provided
    if (job_id) {
      const jobResult = await db.query(
        'SELECT id FROM jobs WHERE id = $1 AND user_id = $2',
        [job_id, req.user.userId]
      );
      if (jobResult.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found or not owned by you' });
      }
    }

    const sessionId = uuidv4();
    const scheduledTime = scheduled_at ? new Date(scheduled_at) : new Date(Date.now() + 30 * 60 * 1000); // default: 30 min from now

    await db.query(
      `INSERT INTO sessions
         (id, user_id, technician_id, job_id, scheduled_at, notes, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'scheduled', NOW())`,
      [sessionId, req.user.userId, technician_id, job_id || null, scheduledTime, notes || null]
    );

    // Generate a placeholder meeting link (production: integrate with Zoom/Teams/etc.)
    const meetingLink = `https://sessions.alexander-ai.com/join/${sessionId}`;

    res.status(201).json({
      message: 'Session booked successfully',
      session: {
        id: sessionId,
        technician: {
          id: tech.id,
          full_name: tech.full_name,
          hourly_rate: tech.hourly_rate,
        },
        scheduled_at: scheduledTime.toISOString(),
        meeting_link: meetingLink,
        status: 'scheduled',
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const { diagnoseProblem } = require('../services/openai');
const { getClient } = require('../db/client');

const router = express.Router();

// ── Multer config ────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP, GIF) are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter,
});

/**
 * POST /diagnose
 * Auth: Bearer token required
 * Body (multipart/form-data):
 *   - image (optional file)
 *   - description (string, required)
 *   - device_type (optional: "desktop" | "laptop")
 *   - device_brand (optional)
 *   - symptoms (optional JSON array of symptom strings)
 */
router.post('/', authenticate, upload.single('image'), async (req, res, next) => {
  try {
    const { description, device_type, device_brand, symptoms } = req.body;

    if (!description || description.trim().length < 10) {
      return res.status(400).json({
        error: 'A description of at least 10 characters is required',
      });
    }

    let imageUrl = null;
    let imageBase64 = null;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      // Read the file and encode as base64 for OpenAI Vision
      const imageBuffer = fs.readFileSync(req.file.path);
      imageBase64 = imageBuffer.toString('base64');
    }

    let parsedSymptoms = [];
    if (symptoms) {
      try {
        parsedSymptoms = typeof symptoms === 'string' ? JSON.parse(symptoms) : symptoms;
      } catch {
        parsedSymptoms = [];
      }
    }

    // Call OpenAI Vision service
    const diagnosis = await diagnoseProblem({
      description: description.trim(),
      imageBase64,
      imageMimeType: req.file ? req.file.mimetype : null,
      deviceType: device_type || 'unknown',
      deviceBrand: device_brand || 'unknown',
      symptoms: parsedSymptoms,
    });

    // Persist the diagnosis job to DB
    const db = getClient();
    const jobId = uuidv4();

    await db.query(
      `INSERT INTO jobs (id, user_id, description, device_type, device_brand, image_url, diagnosis, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed', NOW())`,
      [
        jobId,
        req.user.userId,
        description.trim(),
        device_type || null,
        device_brand || null,
        imageUrl,
        JSON.stringify(diagnosis),
      ]
    );

    res.json({
      jobId,
      diagnosis,
      imageUrl,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { submitTask, getSubmission, getAllSubmissions, reviewSubmission } = require('../controllers/submissionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// ── Admin routes (defined FIRST — must come before /:taskId to avoid shadowing) ──
router.get('/admin/all', protect, adminOnly, getAllSubmissions);
router.put('/:id/review', protect, adminOnly, reviewSubmission);

// ── Talent routes ──
// Wrap multer in a custom handler so validation errors (wrong file type, size limit)
// are returned as a clean 400 JSON response instead of an unhandled server error.
router.post('/:taskId', protect, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // e.g. file too large
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      // e.g. file type not allowed (thrown by our fileFilter)
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, submitTask);

router.get('/:taskId', protect, getSubmission);

module.exports = router;

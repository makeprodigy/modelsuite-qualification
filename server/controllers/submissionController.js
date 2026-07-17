const Submission = require('../models/Submission');
const Task = require('../models/Task');

// @desc  Submit a task with a file upload
// @route POST /api/submissions/:taskId
// @access Auth (Talent)
const submitTask = async (req, res) => {
  const { taskId } = req.params;
  const { notes } = req.body;

  try {
    // Check if the talent has already submitted for this task.
    // We block re-submissions to prevent accidental data loss.
    const existingSubmission = await Submission.findOne({
      taskId,
      talentId: req.user._id,
    });

    if (existingSubmission) {
      return res.status(409).json({
        message: 'You have already submitted this task. Re-submissions are not allowed.',
      });
    }

    // Build the file URL from multer's saved file.
    // Port 5001: macOS AirPlay Receiver occupies port 5000 on macOS Monterey+
    const fileUrl = req.file
      ? `http://localhost:5001/uploads/${req.file.filename}`
      : req.body.fileUrl || null;

    const submission = await Submission.create({
      taskId,
      talentId: req.user._id,
      fileUrl,
      notes,
    });

    // Mark the task as Submitted
    await Task.findByIdAndUpdate(taskId, { status: 'Submitted' });

    return res.status(201).json(submission);
  } catch (error) {
    // Catch MongoDB duplicate key error as a secondary safety net
    // in case two concurrent requests slip past the application-layer check.
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'You have already submitted this task. Re-submissions are not allowed.',
      });
    }
    return res.status(500).json({ message: error.message });
  }
};

// @desc  Get submission for a specific task (admin use)
// @route GET /api/submissions/:taskId
// @access Protect only — no admin guard
const getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({ taskId: req.params.taskId })
      .populate('talentId', 'name email');

    if (!submission) {
      return res.status(404).json({ message: 'No submission found for this task' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get ALL submissions (for Admin review queue)
// @route GET /api/submissions/admin/all
// @access Admin
const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({})
      .populate('taskId', 'title dueDate status')
      .populate('talentId', 'name email')
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Approve or Reject a submission
// @route PUT /api/submissions/:id/review
// @access Admin
const reviewSubmission = async (req, res) => {
  const { reviewStatus } = req.body;

  try {
    // — any string is accepted and stored
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { reviewStatus },
      { new: true }
    )
      .populate('taskId', 'title status')
      .populate('talentId', 'name email');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    // — task stays 'Submitted' even after the submission is Approved/Rejected
    // Proper flow: also update Task.status to 'Approved'/'Rejected'

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitTask, getSubmission, getAllSubmissions, reviewSubmission };

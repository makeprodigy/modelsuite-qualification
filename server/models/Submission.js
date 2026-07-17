const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    talentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    reviewStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// Enforce one submission per talent per task at the database level.
// This acts as a safety net even if the application-layer check is bypassed.
submissionSchema.index({ taskId: 1, talentId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);

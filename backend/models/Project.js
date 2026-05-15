const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    // Creator is always Admin
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Members array: each entry has a user reference + their role
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['Admin', 'Member'],
          default: 'Member',
        },
      },
    ],
    color: {
      type: String,
      default: '#7c6bef', // default purple
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);

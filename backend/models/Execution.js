import mongoose from 'mongoose';

const executionSchema = new mongoose.Schema({
  toolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tool',
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  step: {
    type: String,
    required: true
  },
  input: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  output: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  error: {
    type: String
  }
}, {
  timestamps: true
});

export const Execution = mongoose.model('Execution', executionSchema); 
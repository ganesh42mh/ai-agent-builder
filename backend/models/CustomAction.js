import mongoose from 'mongoose';

const customActionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    default: 'custom'
  },
  prompt: {
    type: String,
    required: true
  },
  inputSchema: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  outputSchema: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  requiredInputs: [{
    type: String,
    required: true
  }],
  optionalInputs: [{
    type: String
  }],
  userId: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const CustomAction = mongoose.model('CustomAction', customActionSchema); 
import mongoose from 'mongoose';

const toolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  steps: [{
    action: {
      type: String,
      required: true,
      enum: ['pdf_to_text', 'extract_skills', 'summarize', 'analyze_sentiment', 'generate_response']
    },
    inputs: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  userId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export const Tool = mongoose.model('Tool', toolSchema); 
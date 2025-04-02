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
  inputType: {
    type: String,
    required: true,
    enum: ['text', 'pdf', 'image', 'audio'],
    default: 'text'
  },
  steps: [{
    action: {
      type: String,
      required: true,
      enum: ['pdf_to_text', 'extract_skills', 'summarize', 'analyze_sentiment', 'process_document', 'analyze_content', 'summarize_text', 'custom']
    },
    customActionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomAction',
      required: function() {
        return this.action === 'custom';
      }
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
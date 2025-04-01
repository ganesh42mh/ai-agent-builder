import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  content: String,
  type: { type: String, enum: ['human', 'ai'] },
  timestamp: { type: Date, default: Date.now }
});

const chatHistorySchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  messages: [messageSchema],
  lastUpdated: { type: Date, default: Date.now }
});

// Create index for faster queries
chatHistorySchema.index({ agentId: 1 });

export default mongoose.model('ChatHistory', chatHistorySchema); 
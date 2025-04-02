import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import pipelineRoutes from './routes/pipelineRoutes.js';
import customActionRoutes from './routes/customActionRoutes.js';
import agentRoutes from './routes/agentRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/pipelines', pipelineRoutes);
app.use('/api/custom-actions', customActionRoutes);
app.use('/api/agents', agentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
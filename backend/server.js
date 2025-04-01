import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { ConversationChain } from 'langchain/chains';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import Agent from './models/Agent.js'; // Add .js extension
import ChatHistory from './models/ChatHistory.js'; // Add .js extension
import MongoDBMemory from './utils/MongoDBMemory.js'; // Add .js extension
import ChatGraph from './utils/ChatGraph.js';
import pipelineRoutes from './routes/pipelineRoutes.js';

// Load environment variables
dotenv.config();

console.log('Environment variables loaded:', {
  MONGODB_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Present' : 'Missing'
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Store chat graphs for each agent
const agentChatGraphs = new Map();

// Routes
app.use('/api/pipelines', pipelineRoutes);

// Create a new agent
app.post('/api/agents', async (req, res) => {
  try {
    const { name, instructions, model } = req.body;
    const agent = new Agent({ name, instructions, model });
    await agent.save();
    res.status(201).json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all agents
app.get('/api/agents', async (req, res) => {
  try {
    const agents = await Agent.find();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat history for an agent
app.get('/api/chat-history/:agentId', async (req, res) => {
  try {
    const chatHistory = await ChatHistory.findOne({ agentId: req.params.agentId });
    res.json(chatHistory || { messages: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Run agent with message
app.post('/api/run-agent/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { message } = req.body;

    // Get or create chat graph for this agent
    let chatGraph = agentChatGraphs.get(agentId);
    if (!chatGraph) {
      const agent = await Agent.findById(agentId);
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      chatGraph = new ChatGraph({
        agentId,
        modelName: agent.model,
        instructions: agent.instructions
      });
      agentChatGraphs.set(agentId, chatGraph);
    }

    // If message is empty, just return the chat history
    if (!message.trim()) {
      const chatHistory = await ChatHistory.findOne({ agentId });
      return res.json({ 
        response: '',
        chatHistory: chatHistory?.messages || []
      });
    }

    // Process the message
    const result = await chatGraph.callModel({ input: message });
    res.json({ response: result.response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear chat history for an agent
app.delete('/api/agents/:agentId/chat', async (req, res) => {
  try {
    const { agentId } = req.params;
    const chatGraph = agentChatGraphs.get(agentId);
    if (chatGraph) {
      await chatGraph.clearHistory();
      res.json({ message: 'Chat history cleared' });
    } else {
      res.status(404).json({ error: 'Agent not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
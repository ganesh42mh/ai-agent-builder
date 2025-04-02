import express from 'express';
import langGraphAgentService from '../services/LangGraphAgentService.js';

const router = express.Router();

// Create a new agent
router.post('/', async (req, res) => {
  try {
    const agent = await langGraphAgentService.createAgent(req.body);
    res.status(201).json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all agents
router.get('/', async (req, res) => {
  try {
    const agents = await langGraphAgentService.getAgents();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat history for an agent
router.get('/:agentId/chat', async (req, res) => {
  try {
    const chatHistory = await langGraphAgentService.getChatHistory(req.params.agentId);
    res.json(chatHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Run agent with message
router.post('/:agentId/run', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Validate message
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Please provide a valid message' });
    }

    const result = await langGraphAgentService.runAgent(req.params.agentId, message.trim());
    res.json(result);
  } catch (error) {
    console.error('Error in run agent route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear chat history for an agent
router.delete('/:agentId/chat', async (req, res) => {
  try {
    const result = await langGraphAgentService.clearChatHistory(req.params.agentId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an agent
router.delete('/:agentId', async (req, res) => {
  try {
    const result = await langGraphAgentService.deleteAgent(req.params.agentId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 
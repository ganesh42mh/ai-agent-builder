import express from 'express';
import customActionService from '../services/CustomActionService.js';
import { CustomAction } from '../models/CustomAction.js';

const router = express.Router();

// Create a new custom action
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user info is added by auth middleware
    const customAction = await customActionService.createCustomAction(userId, req.body);
    res.status(201).json(customAction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all custom actions (user's own + public ones)
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const customActions = await customActionService.getCustomActions(userId);
    res.json(customActions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific custom action
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const customAction = await CustomAction.findOne({
      _id: req.params.id,
      $or: [
        { userId },
        { isPublic: true }
      ]
    });

    if (!customAction) {
      return res.status(404).json({ error: 'Custom action not found' });
    }

    res.json(customAction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a custom action
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const customAction = await CustomAction.findOne({
      _id: req.params.id,
      userId
    });

    if (!customAction) {
      return res.status(404).json({ error: 'Custom action not found' });
    }

    // Validate schemas if they're being updated
    if (req.body.inputSchema || req.body.outputSchema) {
      const inputSchema = customActionService.createZodSchema(
        req.body.inputSchema || customAction.inputSchema
      );
      const outputSchema = customActionService.createZodSchema(
        req.body.outputSchema || customAction.outputSchema
      );

      // Test the schemas
      inputSchema.parse({});
      outputSchema.parse({});
    }

    const updatedAction = await CustomAction.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(updatedAction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a custom action
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const customAction = await CustomAction.findOneAndDelete({
      _id: req.params.id,
      userId
    });

    if (!customAction) {
      return res.status(404).json({ error: 'Custom action not found' });
    }

    res.json({ message: 'Custom action deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test a custom action
router.post('/:id/test', async (req, res) => {
  try {
    const userId = req.user.id;
    const customAction = await CustomAction.findOne({
      _id: req.params.id,
      $or: [
        { userId },
        { isPublic: true }
      ]
    });

    if (!customAction) {
      return res.status(404).json({ error: 'Custom action not found' });
    }

    const result = await customActionService.executeCustomAction(
      req.params.id,
      req.body
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router; 
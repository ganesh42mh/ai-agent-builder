import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { Tool } from '../models/Tool.js';
import { Execution } from '../models/Execution.js';
import { 
  pdf_to_text, 
  extract_skills, 
  summarize_text, 
  process_document 
} from '../utils/aiActions.js';
import fs from 'fs';
import { actionRegistry, getActionsByCategory, getActionCategories } from '../utils/actionRegistry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cleanup function to remove processed files
const cleanupFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error cleaning up file ${filePath}:`, error);
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get available actions
router.get('/actions', async (req, res) => {
  try {
    const actions = {
      registry: actionRegistry,
      categories: getActionCategories(),
      actionsByCategory: {}
    };

    // Get actions by category
    actions.categories.forEach(category => {
      actions.actionsByCategory[category] = getActionsByCategory(category);
    });

    res.json(actions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new pipeline
router.post('/', async (req, res) => {
  try {
    const { name, description, steps } = req.body;
    const tool = new Tool({
      name,
      description,
      steps,
      userId: req.user?._id || 'default' // Temporarily remove auth requirement
    });
    await tool.save();
    res.status(201).json(tool);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all pipelines for a user
router.get('/', async (req, res) => {
  try {
    const tools = await Tool.find({ userId: req.user?._id || 'default' });
    res.json(tools);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific pipeline
router.get('/:id', async (req, res) => {
  try {
    const tool = await Tool.findOne({ _id: req.params.id, userId: req.user?._id || 'default' });
    if (!tool) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }
    res.json(tool);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Run a pipeline
router.post('/:id/run', upload.single('file'), async (req, res) => {
  let uploadedFilePath = null;
  try {
    console.log('Starting pipeline execution...');
    console.log('Pipeline ID:', req.params.id);
    
    const tool = await Tool.findOne({ _id: req.params.id, userId: req.user?._id || 'default' });
    if (!tool) {
      console.log('Pipeline not found:', req.params.id);
      return res.status(404).json({ error: 'Pipeline not found' });
    }
    console.log('Found pipeline:', tool.name);
    console.log('Pipeline steps:', tool.steps);

    let input;
    if (req.file) {
      console.log('File uploaded:', req.file.originalname);
      // Ensure the file was uploaded successfully
      if (!req.file.path) {
        console.log('File upload failed - no path');
        return res.status(400).json({ error: 'File upload failed' });
      }
      input = req.file.path;
      uploadedFilePath = req.file.path; // Store the path for cleanup
      console.log('File path:', input);
    } else if (req.body.input) {
      input = req.body.input;
      console.log('Using input from request body:', input);
    } else {
      console.log('No input provided');
      return res.status(400).json({ error: 'No input provided' });
    }

    const executions = [];
    let currentInput = input;
    let finalOutput = null;

    console.log('Starting pipeline steps...');
    for (const step of tool.steps) {
      console.log('\nExecuting step:', step.action);
      console.log('Step details:', {
        name: step.name,
        description: step.description,
        inputs: step.inputs
      });
      console.log('Current input:', currentInput);
      
      let output;
      try {
        switch (step.action) {
          case 'pdf_to_text':
            console.log('Converting PDF to text...');
            output = await pdf_to_text(currentInput);
            console.log('PDF conversion output:', output);
            break;
          case 'extract_skills':
            console.log('Extracting skills from text...');
            output = await extract_skills(currentInput);
            console.log('Skills extraction output:', output);
            break;
          case 'summarize':
            console.log('Generating summary...');
            output = await summarize_text(currentInput, step.inputs);
            console.log('Summary output:', output);
            break;
          case 'analyze_sentiment':
            console.log('Analyzing sentiment...');
            output = await process_document({ text: currentInput }, step.inputs);
            console.log('Sentiment analysis output:', output);
            break;
          case 'process_document':
            console.log('Processing document...');
            output = await process_document({ text: currentInput }, step.inputs);
            console.log('Document processing output:', output);
            break;
          default:
            throw new Error(`Unknown action: ${step.action}`);
        }

        // Ensure output is not undefined
        if (output === undefined) {
          console.log('Step produced no output:', step.action);
          throw new Error(`Step ${step.action} produced no output`);
        }

        console.log('Step completed successfully');
        const execution = new Execution({
          toolId: tool._id,
          userId: req.user?._id || 'default',
          step: step.action,
          input: currentInput,
          output: output,
          status: 'completed'
        });
        await execution.save();
        executions.push(execution);

        // Update currentInput for next step
        currentInput = output;
        finalOutput = output; // Store the final output
        console.log('Updated currentInput for next step');
      } catch (error) {
        console.error(`Error in step ${step.action}:`, error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          currentInput: currentInput
        });
        
        const execution = new Execution({
          toolId: tool._id,
          userId: req.user?._id || 'default',
          step: step.action,
          input: currentInput,
          output: null, // Set to null for failed steps
          error: error.message,
          status: 'failed'
        });
        await execution.save();
        executions.push(execution);
        throw error; // Re-throw to stop the pipeline
      }
    }

    console.log('\nCreating final execution record...');
    // Create a final execution record with the complete pipeline output
    const finalExecution = new Execution({
      toolId: tool._id,
      userId: req.user?._id || 'default',
      step: 'pipeline_complete',
      input: input,
      output: finalOutput,
      status: 'completed'
    });
    await finalExecution.save();
    executions.push(finalExecution);
    console.log('Pipeline execution completed successfully');

    res.json({
      message: 'Pipeline executed successfully',
      executions
    });
  } catch (error) {
    console.error('Pipeline execution error:', error);
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ error: error.message });
  } finally {
    // Clean up the uploaded file after processing
    if (uploadedFilePath) {
      console.log('Cleaning up uploaded file:', uploadedFilePath);
      cleanupFile(uploadedFilePath);
    }
  }
});

// Delete a pipeline
router.delete('/:id', async (req, res) => {
  try {
    const tool = await Tool.findOneAndDelete({ _id: req.params.id, userId: req.user?._id || 'default' });
    if (!tool) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }
    res.json({ message: 'Pipeline deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 
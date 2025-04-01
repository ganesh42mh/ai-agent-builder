import { z } from 'zod';

// Define the schema for action metadata
const actionSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  inputSchema: z.any(),
  outputSchema: z.any(),
  requiredInputs: z.array(z.string()),
  optionalInputs: z.array(z.string()),
  example: z.object({
    inputs: z.record(z.any()),
    outputs: z.record(z.any())
  })
});

// Action Registry Configuration
export const actionRegistry = {
  pdf_to_text: {
    name: 'Convert PDF to Text',
    description: 'Extract text content from a PDF document',
    category: 'document_processing',
    requiredInputs: ['file_path'],
    function: 'pdf_to_text'
  },
  extract_skills: {
    name: 'Extract Skills',
    description: 'Extract skills and competencies from text',
    category: 'text_analysis',
    requiredInputs: ['text'],
    function: 'extract_skills'
  },
  summarize: {
    name: 'Summarize Text',
    description: 'Generate a concise summary of the input text',
    category: 'text_analysis',
    requiredInputs: ['text', 'max_length'],
    function: 'summarize_text'
  },
  analyze_sentiment: {
    name: 'Analyze Sentiment',
    description: 'Analyze the sentiment of the input text',
    category: 'text_analysis',
    requiredInputs: ['text'],
    function: 'process_document'
  },
  process_document: {
    name: 'Process Document',
    description: 'Process document with custom parameters',
    category: 'document_processing',
    requiredInputs: ['text', 'parameters'],
    function: 'process_document'
  },

  // Analysis Actions
  analyze_content: {
    name: 'Content Analysis',
    description: 'Analyze content for main topics, key points, and target audience',
    category: 'analysis',
    inputSchema: z.object({
      text: z.string(),
      contentType: z.string().optional()
    }),
    outputSchema: z.object({
      main_topic: z.string(),
      key_points: z.array(z.string()),
      target_audience: z.string(),
      content_type: z.string(),
      reading_level: z.string(),
      word_count: z.number()
    }),
    requiredInputs: ['text'],
    optionalInputs: ['contentType'],
    example: {
      inputs: { text: 'Content to analyze...', contentType: 'article' },
      outputs: {
        main_topic: 'AI Technology',
        key_points: ['Point 1', 'Point 2'],
        target_audience: 'Technical Readers',
        content_type: 'article',
        reading_level: 'Advanced',
        word_count: 500
      }
    }
  },

  // Summarization Actions
  summarize_text: {
    name: 'Text Summarization',
    description: 'Generate a summary of the text',
    category: 'summarization',
    inputSchema: z.object({
      text: z.string(),
      length: z.enum(['short', 'medium', 'long']).optional(),
      contentType: z.string().optional()
    }),
    outputSchema: z.object({
      summary: z.string(),
      key_points: z.array(z.string()),
      length: z.string()
    }),
    requiredInputs: ['text'],
    optionalInputs: ['length', 'contentType'],
    example: {
      inputs: { text: 'Long text to summarize...', length: 'medium' },
      outputs: {
        summary: 'Summarized text...',
        key_points: ['Point 1', 'Point 2'],
        length: 'medium'
      }
    }
  },
};

// Helper function to validate action inputs
export function validateActionInputs(actionName, inputs) {
  const action = actionRegistry[actionName];
  if (!action) {
    throw new Error(`Action ${actionName} not found in registry`);
  }

  // Validate required inputs
  for (const required of action.requiredInputs) {
    if (!(required in inputs)) {
      throw new Error(`Missing required input: ${required} for action ${actionName}`);
    }
  }

  // Validate input schema
  action.inputSchema.parse(inputs);
  return true;
}

// Helper function to validate action outputs
export function validateActionOutputs(actionName, outputs) {
  const action = actionRegistry[actionName];
  if (!action) {
    throw new Error(`Action ${actionName} not found in registry`);
  }

  action.outputSchema.parse(outputs);
  return true;
}

// Get all available categories
export const getActionCategories = () => {
  const categories = new Set();
  Object.values(actionRegistry).forEach(action => {
    categories.add(action.category);
  });
  return Array.from(categories);
};

// Get actions by category
export const getActionsByCategory = (category) => {
  return Object.entries(actionRegistry)
    .filter(([_, action]) => action.category === category)
    .map(([name, action]) => ({
      name,
      description: action.description
    }));
}; 
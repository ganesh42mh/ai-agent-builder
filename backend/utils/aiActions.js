import { ChatOpenAI } from '@langchain/openai';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client
const openai = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4-turbo",
  temperature: 0.2,
  maxRetries: 3
});

// Content Analysis Schema
const contentAnalysisSchema = z.object({
  main_topic: z.string().describe("Main topic of the content"),
  key_points: z.array(z.string()).describe("Key points discussed"),
  target_audience: z.string().describe("Intended audience"),
  content_type: z.string().describe("Type of content (article, blog, etc.)"),
  reading_level: z.string().describe("Estimated reading level"),
  word_count: z.number().describe("Approximate word count")
});

// Engagement Metrics Schema
const engagementMetricsSchema = z.object({
  readability_score: z.number().min(0).max(100).describe("Content readability score"),
  engagement_potential: z.number().min(0).max(100).describe("Potential engagement score"),
  key_phrases: z.array(z.string()).describe("Key phrases for SEO"),
  suggested_improvements: z.array(z.string()).describe("Suggestions for improvement")
});

// PDF Processing
export async function pdf_to_text(filePath, inputs = {}) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    
    const text = docs.map(doc => doc.pageContent).join('\n');
    return { 
      text,
      metadata: {
        pages: docs.length,
        fileSize: fs.statSync(filePath).size
      }
    };
  } catch (error) {
    throw new Error(`PDF processing failed: ${error.message}`);
  }
}

// Content Analysis
export async function analyze_content(text, inputs = {}) {
  try {
    const structuredLLM = openai.withStructuredOutput(contentAnalysisSchema);
    const result = await structuredLLM.invoke(
      `Analyze this content and provide detailed insights:\n\n${text}`
    );
    return result;
  } catch (error) {
    throw new Error(`Content analysis failed: ${error.message}`);
  }
}

// Engagement Metrics
export async function calculate_engagement(text, inputs = {}) {
  try {
    const structuredLLM = openai.withStructuredOutput(engagementMetricsSchema);
    const result = await structuredLLM.invoke(
      `Calculate engagement metrics for this content:\n\n${text}`
    );
    return result;
  } catch (error) {
    throw new Error(`Engagement calculation failed: ${error.message}`);
  }
}

// Skill Extraction
export async function extract_skills(text, inputs = {}) {
  const skillSchema = z.object({
    technical_skills: z.array(z.string()).describe("List of technical skills mentioned"),
    soft_skills: z.array(z.string()).describe("List of soft skills or competencies mentioned"),
    experience_level: z.string().describe("Level of expertise or experience mentioned"),
    content_type: z.string().describe("Type of content being analyzed (resume, article, etc.)")
  });

  try {
    const structuredLLM = openai.withStructuredOutput(skillSchema);
    const result = await structuredLLM.invoke(
      `Analyze this content and extract relevant skills and competencies. Consider the context and type of content:\n\n${text}`
    );
    return result;
  } catch (error) {
    throw new Error(`Skill extraction failed: ${error.message}`);
  }
}

// Text Summarization
export async function summarize_text(text, inputs = {}) {
  const { length = 'medium' } = inputs;
  
  try {
    // Convert object input to string if necessary
    let contentToSummarize = text;
    if (typeof text === 'object') {
      contentToSummarize = JSON.stringify(text, null, 2);
    }

    const result = await openai.invoke([
      ["system", `Create a ${length} summary of the following content. Focus on key points.`],
      ["human", contentToSummarize]
    ]);
    return { summary: result.content };
  } catch (error) {
    throw new Error(`Summarization failed: ${error.message}`);
  }
}

// Resume Comparison
export async function compare_to_job_description(state, inputs = {}) {
  const { jobDescription } = inputs;
  
  if (!state.skills || !jobDescription) {
    throw new Error("Missing required inputs for comparison");
  }

  try {
    const result = await openai.invoke([
      ["system", `Compare resume skills to job description and provide a match score (0-100).`],
      ["human", `Resume Skills: ${JSON.stringify(state.skills)}\nJob Description: ${jobDescription}`]
    ]);
    
    // Extract numerical score from response
    const match = result.content.match(/\d+/);
    const score = match ? parseInt(match[0]) : 0;
    
    return {
      score,
      explanation: result.content
    };
  } catch (error) {
    throw new Error(`Comparison failed: ${error.message}`);
  }
}

// Document Processing (Generic)
export async function process_document(state, inputs = {}) {
  const { action } = inputs;
  
  if (!state.text) {
    throw new Error("No text content available for processing");
  }

  try {
    switch (action) {
      case 'extract_entities':
        return await extract_entities(state.text);
      case 'analyze_sentiment':
        return await analyze_sentiment(state.text);
      case 'analyze_content':
        return await analyze_content(state.text);
      case 'calculate_engagement':
        return await calculate_engagement(state.text);
      case 'extract_skills':
        return await extract_skills(state.text);
      case 'summarize_text':
        return await summarize_text(state.text);
      case 'compare_to_job_description':
        return await compare_to_job_description(state);
      default:
        throw new Error(`Unknown document action: ${action}`);
    }
  } catch (error) {
    throw new Error(`Document processing failed: ${error.message}`);
  }
}

// Helper Functions
async function extract_entities(text) {
  const entitySchema = z.object({
    people: z.array(z.string()),
    organizations: z.array(z.string()),
    technologies: z.array(z.string()),
    topics: z.array(z.string())
  });

  const structuredLLM = openai.withStructuredOutput(entitySchema);
  return await structuredLLM.invoke(`Extract entities from: ${text}`);
}

async function analyze_sentiment(text) {
  const sentimentSchema = z.object({
    sentiment: z.enum(["positive", "neutral", "negative"]),
    confidence: z.number().min(0).max(1),
    tone: z.string(),
    key_emotions: z.array(z.string())
  });

  const structuredLLM = openai.withStructuredOutput(sentimentSchema);
  return await structuredLLM.invoke(`Analyze sentiment and tone of: ${text}`);
}

export default {
  pdf_to_text,
  analyze_content,
  calculate_engagement,
  process_document,
  summarize_text
};
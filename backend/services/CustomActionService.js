import { ChatOpenAI } from '@langchain/openai';
import { CustomAction } from '../models/CustomAction.js';
import { z } from 'zod';

class CustomActionService {
  constructor() {
    this.openai = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4-turbo",
      temperature: 0.2,
      maxRetries: 3
    });
  }

  async createCustomAction(userId, actionData) {
    try {
      // Create Zod schemas from the provided schemas
      const inputSchema = this.createZodSchema(actionData.inputSchema);
      const outputSchema = this.createZodSchema(actionData.outputSchema);

      // Validate the schemas
      inputSchema.parse({}); // Test with empty object
      outputSchema.parse({}); // Test with empty object

      const customAction = await CustomAction.create({
        ...actionData,
        userId,
        inputSchema: actionData.inputSchema,
        outputSchema: actionData.outputSchema
      });

      return customAction;
    } catch (error) {
      throw new Error(`Failed to create custom action: ${error.message}`);
    }
  }

  async executeCustomAction(actionId, inputs) {
    try {
      const action = await CustomAction.findById(actionId);
      if (!action) {
        throw new Error('Custom action not found');
      }

      // Create Zod schemas
      const inputSchema = this.createZodSchema(action.inputSchema);
      const outputSchema = this.createZodSchema(action.outputSchema);

      // Validate inputs
      inputSchema.parse(inputs);

      // Create structured output LLM
      const structuredLLM = this.openai.withStructuredOutput(outputSchema);

      // Execute the action
      const result = await structuredLLM.invoke(
        `${action.prompt}\n\nInputs: ${JSON.stringify(inputs, null, 2)}`
      );

      return result;
    } catch (error) {
      throw new Error(`Failed to execute custom action: ${error.message}`);
    }
  }

  createZodSchema(schemaDefinition) {
    const schemaMap = {
      string: z.string(),
      number: z.number(),
      boolean: z.boolean(),
      array: (type) => z.array(z[type]()),
      object: (shape) => z.object(shape)
    };

    function buildSchema(def) {
      if (typeof def === 'string') {
        return schemaMap[def];
      }
      if (def.type === 'array') {
        return schemaMap.array(def.items);
      }
      if (def.type === 'object') {
        const shape = {};
        for (const [key, value] of Object.entries(def.properties)) {
          shape[key] = buildSchema(value);
        }
        return schemaMap.object(shape);
      }
      return schemaMap[def.type];
    }

    return buildSchema(schemaDefinition);
  }

  async getCustomActions(userId, includePublic = true) {
    const query = {
      $or: [
        { userId },
        ...(includePublic ? [{ isPublic: true }] : [])
      ]
    };
    return await CustomAction.find(query);
  }
}

export default new CustomActionService(); 
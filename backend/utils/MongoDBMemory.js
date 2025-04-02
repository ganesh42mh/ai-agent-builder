import { BaseChatMemory } from "@langchain/community/memory/chat_memory";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import ChatHistory from "../models/ChatHistory.js";

class MongoDBMemory extends BaseChatMemory {
  constructor({ agentId, ...rest }) {
    super({
      returnMessages: true,
      memoryKey: "chat_history",
      inputKey: "input",
      ...rest
    });
    this.agentId = agentId;
  }

  async loadMemoryVariables() {
    try {
      const chatHistory = await ChatHistory.findOne({ agentId: this.agentId });
      if (!chatHistory) {
        return { [this.memoryKey]: [] };
      }

      // Filter out invalid messages and ensure proper format
      const messages = chatHistory.messages
        .filter(msg => msg && msg.content && typeof msg.content === 'string')
        .map(msg => {
          if (msg.type === 'human') {
            return new HumanMessage({ content: msg.content });
          } else if (msg.type === 'ai') {
            return new AIMessage({ content: msg.content });
          }
          return msg;
        });

      return { [this.memoryKey]: messages };
    } catch (error) {
      console.error('Error loading memory variables:', error);
      return { [this.memoryKey]: [] };
    }
  }

  async saveContext(inputValues, outputValues) {
    try {
      // Validate input and output
      if (!inputValues || !outputValues) {
        throw new Error('Invalid input or output values');
      }

      const input = inputValues.input;
      const output = outputValues.output;

      if (!input || typeof input !== 'string' || !output || typeof output !== 'string') {
        throw new Error('Input and output must be valid strings');
      }

      // Create new messages
      const humanMessage = { type: 'human', content: input };
      const aiMessage = { type: 'ai', content: output };

      // Update chat history in database
      const chatHistory = await ChatHistory.findOne({ agentId: this.agentId });
      if (!chatHistory) {
        await ChatHistory.create({
          agentId: this.agentId,
          messages: [humanMessage, aiMessage],
          lastUpdated: new Date()
        });
      } else {
        chatHistory.messages.push(humanMessage, aiMessage);
        chatHistory.lastUpdated = new Date();
        await chatHistory.save();
      }

      return true;
    } catch (error) {
      console.error('Error saving context:', error);
      throw error;
    }
  }

  async clear() {
    await super.clear();
    
    await ChatHistory.findOneAndUpdate(
      { agentId: this.agentId },
      { 
        $set: { 
          messages: [],
          lastUpdated: new Date()
        }
      },
      { new: true }
    );
  }
}

export default MongoDBMemory;
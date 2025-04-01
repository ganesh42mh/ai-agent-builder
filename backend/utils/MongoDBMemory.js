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

  async loadMemoryVariables(values) {
    const chatHistory = await ChatHistory.findOne({ agentId: this.agentId });
    
    if (!chatHistory) {
      await ChatHistory.create({
        agentId: this.agentId,
        messages: [],
        lastUpdated: new Date()
      });
      return { [this.memoryKey]: [] };
    }

    const messages = chatHistory.messages.map(msg => {
      return msg.type === "human" 
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content);
    });

    this.chatHistory = messages;
    return { [this.memoryKey]: messages };
  }

  async saveContext(inputValues, outputValues) {
    await super.saveContext(inputValues, outputValues);

    const messages = this.chatHistory.map(msg => ({
      content: msg.content,
      type: msg instanceof HumanMessage ? "human" : "ai",
      timestamp: new Date()
    }));

    await ChatHistory.findOneAndUpdate(
      { agentId: this.agentId },
      { 
        $set: { 
          messages,
          lastUpdated: new Date()
        }
      },
      { upsert: true, new: true }
    );
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
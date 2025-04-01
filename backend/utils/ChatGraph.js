import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";
import ChatHistory from "../models/ChatHistory.js";

// Define the state structure using Annotation
const AgentState = Annotation.Root({
  messages: Annotation({
    type: "array",
    items: { type: "message" },
    reducer: (x, y) => x.concat(y)
  }),
  input: Annotation({
    type: "string"
  }),
  response: Annotation({
    type: "string"
  })  
});

class ChatGraph {
  constructor({ agentId, modelName = "gpt-3.5-turbo", instructions }) {
    this.agentId = agentId;
    this.model = new ChatOpenAI({
      modelName,
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    this.promptTemplate = new PromptTemplate({
      template: `Instructions: {instructions}

Previous conversation:
{chat_history}

Current message: {input}

Response:`,
      inputVariables: ["instructions", "chat_history", "input"]
    });

    this.instructions = instructions;
    this.memory = new MemorySaver();
    this.graph = this.createGraph();
  }

  async loadHistory() {
    const chatHistory = await ChatHistory.findOne({ agentId: this.agentId });
    if (chatHistory?.messages) {
      return chatHistory.messages.map(msg => 
        msg.type === "human" 
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      );
    }
    return [];
  }

  async saveHistory(messages) {
    const formattedMessages = messages.map(msg => ({
      content: msg.content,
      type: msg instanceof HumanMessage ? "human" : "ai",
      timestamp: new Date()
    }));

    await ChatHistory.findOneAndUpdate(
      { agentId: this.agentId },
      { 
        $set: { 
          messages: formattedMessages,
          lastUpdated: new Date()
        }
      },
      { upsert: true }
    );
  }

  createGraph() {
    // Create the graph with our state definition
    const workflow = new StateGraph(AgentState);

    // Define the function that calls the model
    async function callModel(state) {
      // Load existing history
      const chatHistory = await this.loadHistory();
      
      // Create prompt with current state and history
      const prompt = await this.promptTemplate.format({
        instructions: this.instructions,
        chat_history: chatHistory.map(m => `${m.type}: ${m.content}`).join("\n"),
        input: state.input
      });

      // Get response from model
      const response = await this.model.invoke(prompt);

      // Save to MongoDB
      const newMessages = [...chatHistory, new HumanMessage(state.input), response];
      await this.saveHistory(newMessages);

      return { 
        messages: newMessages,
        response: response.content
      };
    }

    // Add the model node
    workflow.addNode("model", callModel.bind(this));

    // Add edges
    workflow.addEdge(START, "model");
    workflow.addEdge("model", END);

    // Compile the graph with memory saver
    return workflow.compile({
      checkpointer: this.memory
    });
  }

  async callModel(state) {
    const config = { 
      configurable: { 
        thread_id: this.agentId 
      }
    };

    const result = await this.graph.invoke({
      messages: [],
      input: state.input,
      response: ""
    }, config);

    return { response: result.response };
  }

  async clearHistory() {
    await ChatHistory.findOneAndUpdate(
      { agentId: this.agentId },
      { 
        $set: { 
          messages: [],
          lastUpdated: new Date()
        }
      }
    );
  }
}

export default ChatGraph; 
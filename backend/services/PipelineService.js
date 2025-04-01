const { StateGraph } = require('@langchain/langgraph');
const Tool = require('../models/Tool');
const Execution = require('../models/Execution');
const aiActions = require('../utils/aiActions');

class PipelineService {
  async createPipeline(userId, pipelineData) {
    try {
      const tool = await Tool.create({
        userId,
        name: pipelineData.name,
        description: pipelineData.description,
        steps: pipelineData.steps.map((step, index) => ({
          ...step,
          order: index
        }))
      });
      return tool;
    } catch (error) {
      throw new Error(`Failed to create pipeline: ${error.message}`);
    }
  }

  async runPipeline(toolId, userId, input) {
    const startTime = Date.now();
    let execution;

    try {
      // Create execution record
      execution = await Execution.create({
        toolId,
        userId,
        input,
        status: 'running'
      });

      // Get pipeline configuration
      const tool = await Tool.findById(toolId);
      if (!tool) {
        throw new Error('Pipeline not found');
      }

      // Create state graph
      const graph = new StateGraph({
        initialState: { input }
      });

      // Add nodes for each step
      tool.steps.forEach((step) => {
        graph.addNode(step.action, async (state) => {
          try {
            const result = await aiActions[step.action](state.input, step.inputs);
            return { ...state, [step.action]: result };
          } catch (error) {
            throw new Error(`Step ${step.action} failed: ${error.message}`);
          }
        });
      });

      // Connect edges linearly
      tool.steps.forEach((step, index) => {
        if (index === 0) {
          graph.addEdge('START', step.action);
        } else {
          graph.addEdge(tool.steps[index - 1].action, step.action);
        }
      });
      graph.addEdge(tool.steps[tool.steps.length - 1].action, 'END');

      // Compile and run the graph
      const app = graph.compile();
      const result = await app.invoke({ input });

      // Update execution record
      const executionTime = Date.now() - startTime;
      await Execution.findByIdAndUpdate(execution._id, {
        output: result,
        status: 'completed',
        executionTime,
        completedAt: new Date()
      });

      return result;
    } catch (error) {
      // Update execution record with error
      if (execution) {
        await Execution.findByIdAndUpdate(execution._id, {
          status: 'failed',
          error: error.message,
          output: null,
          completedAt: new Date()
        });
      }
      throw error;
    }
  }

  async getPipelines(userId) {
    try {
      return await Tool.find({ userId }).sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Failed to get pipelines: ${error.message}`);
    }
  }

  async getPipelineExecutions(toolId, userId) {
    try {
      return await Execution.find({ toolId, userId }).sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Failed to get executions: ${error.message}`);
    }
  }

  async deletePipeline(toolId, userId) {
    try {
      const tool = await Tool.findOneAndDelete({ _id: toolId, userId });
      if (!tool) {
        throw new Error('Pipeline not found');
      }
      return tool;
    } catch (error) {
      throw new Error(`Failed to delete pipeline: ${error.message}`);
    }
  }
}

module.exports = new PipelineService(); 
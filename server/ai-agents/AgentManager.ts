import { ParserAgent } from './ParserAgent';
import { CleanerAgent } from './CleanerAgent';
import { LabelerAgent } from './LabelerAgent';
import { BaseAgent, AgentTask } from './BaseAgent';

export class AgentManager {
  private agents: Map<string, BaseAgent> = new Map();
  private taskCounter = 0;

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents() {
    this.agents.set('parser', new ParserAgent());
    this.agents.set('cleaner', new CleanerAgent());
    this.agents.set('labeler', new LabelerAgent());
    
    // Initialize other agents (simplified for now)
    // this.agents.set('reviewer', new ReviewerAgent());
    // this.agents.set('trainer', new TrainerAgent());
    // this.agents.set('supervisor', new SupervisorAgent());
  }

  async submitTask(agentName: string, taskType: string, data: any): Promise<string> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }

    const taskId = `task_${++this.taskCounter}`;
    const task: AgentTask = {
      id: taskId,
      type: taskType,
      data,
      priority: 1,
      status: 'pending',
      createdAt: new Date()
    };

    await agent.addTask(task);
    return taskId;
  }

  getAgentStatus(agentName: string) {
    const agent = this.agents.get(agentName);
    return agent ? agent.getStatus() : null;
  }

  getAllAgentsStatus() {
    const statuses: any[] = [];
    this.agents.forEach((agent, name) => {
      statuses.push({
        ...agent.getStatus(),
        id: name
      });
    });
    return statuses;
  }

  getAgentLogs(agentName: string, limit: number = 100) {
    const agent = this.agents.get(agentName);
    return agent ? agent.getLogs(limit) : [];
  }

  getAgentConfiguration(agentName: string) {
    const agent = this.agents.get(agentName);
    return agent ? agent.getConfiguration() : null;
  }

  async updateAgentConfiguration(agentName: string, config: any) {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }
    await agent.updateConfiguration(config);
  }

  getAvailableAgents() {
    return Array.from(this.agents.keys());
  }
}

export const agentManager = new AgentManager();
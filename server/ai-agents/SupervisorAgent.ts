import { BaseAgent, AgentTask } from './BaseAgent';

interface SupervisorSettings {
  maxConcurrentTasks: number;
  taskTimeoutMinutes: number;
  autoRetryFailedTasks: boolean;
  maxRetryAttempts: number;
  loadBalancingEnabled: boolean;
  priorityThreshold: number;
  healthCheckInterval: number;
}

interface AgentHealth {
  agentName: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastSeen: Date;
  taskCount: number;
  errorRate: number;
  avgResponseTime: number;
}

export class SupervisorAgent extends BaseAgent {
  private settings: SupervisorSettings = {
    maxConcurrentTasks: 10,
    taskTimeoutMinutes: 30,
    autoRetryFailedTasks: true,
    maxRetryAttempts: 3,
    loadBalancingEnabled: true,
    priorityThreshold: 5,
    healthCheckInterval: 60000 // 1 minute
  };

  private agentHealth: Map<string, AgentHealth> = new Map();
  private taskRegistry: Map<string, any> = new Map();
  private workflows: Map<string, any> = new Map();
  
  constructor() {
    super('Supervisor Agent');
    this.initializeHealthMonitoring();
    this.initializeWorkflows();
  }

  private initializeHealthMonitoring() {
    // Initialize health status for all agents
    const agents = ['parser', 'cleaner', 'labeler', 'reviewer', 'trainer'];
    agents.forEach(agent => {
      this.agentHealth.set(agent, {
        agentName: agent,
        status: 'healthy',
        lastSeen: new Date(),
        taskCount: 0,
        errorRate: 0,
        avgResponseTime: 1000
      });
    });

    // Start health check interval
    setInterval(() => this.performHealthChecks(), this.settings.healthCheckInterval);
  }

  private initializeWorkflows() {
    // Define standard workflows
    this.workflows.set('data_processing', {
      name: 'Data Processing Pipeline',
      steps: ['parser', 'cleaner', 'labeler', 'reviewer'],
      parallel: false,
      retryOnFailure: true
    });

    this.workflows.set('quality_assurance', {
      name: 'Quality Assurance Pipeline',
      steps: ['reviewer', 'trainer'],
      parallel: true,
      retryOnFailure: false
    });
  }

  async processTask(task: AgentTask): Promise<any> {
    switch (task.type) {
      case 'orchestrate_workflow':
        return await this.orchestrateWorkflow(task.data);
      case 'monitor_agents':
        return await this.monitorAgents(task.data);
      case 'balance_load':
        return await this.balanceLoad(task.data);
      case 'handle_failures':
        return await this.handleFailures(task.data);
      case 'optimize_resources':
        return await this.optimizeResources(task.data);
      case 'generate_report':
        return await this.generateReport(task.data);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  private async orchestrateWorkflow(data: {
    workflowName: string;
    inputData: any;
    priority?: number;
  }): Promise<any> {
    this.log('info', `Starting workflow orchestration: ${data.workflowName}`, {
      priority: data.priority || 1
    });

    const workflow = this.workflows.get(data.workflowName);
    if (!workflow) {
      throw new Error(`Workflow ${data.workflowName} not found`);
    }

    const orchestration = {
      workflowId: `workflow_${Date.now()}`,
      name: data.workflowName,
      startTime: new Date(),
      status: 'running',
      steps: [],
      results: {},
      errors: []
    };

    this.taskRegistry.set(orchestration.workflowId, orchestration);

    try {
      if (workflow.parallel) {
        // Execute steps in parallel
        const promises = workflow.steps.map(async (step: string) => {
          return await this.executeWorkflowStep(step, data.inputData, orchestration);
        });
        
        const results = await Promise.allSettled(promises);
        results.forEach((result, index) => {
          const stepName = workflow.steps[index];
          if (result.status === 'fulfilled') {
            orchestration.results[stepName] = result.value;
          } else {
            orchestration.errors.push({
              step: stepName,
              error: result.reason
            });
          }
        });
      } else {
        // Execute steps sequentially
        let currentData = data.inputData;
        for (const step of workflow.steps) {
          const result = await this.executeWorkflowStep(step, currentData, orchestration);
          orchestration.results[step] = result;
          currentData = result; // Pass result to next step
        }
      }

      orchestration.status = orchestration.errors.length > 0 ? 'completed_with_errors' : 'completed';
      orchestration.endTime = new Date();

      this.log('info', `Workflow orchestration completed: ${data.workflowName}`, {
        status: orchestration.status,
        duration: orchestration.endTime.getTime() - orchestration.startTime.getTime(),
        errors: orchestration.errors.length
      });

      return orchestration;

    } catch (error) {
      orchestration.status = 'failed';
      orchestration.endTime = new Date();
      orchestration.errors.push({ step: 'orchestration', error: error.message });
      
      this.log('error', `Workflow orchestration failed: ${data.workflowName}`, {
        error: error.message
      });
      
      throw error;
    }
  }

  private async executeWorkflowStep(
    agentName: string, 
    inputData: any, 
    orchestration: any
  ): Promise<any> {
    const stepExecution = {
      agent: agentName,
      startTime: new Date(),
      status: 'running',
      inputData,
      result: null,
      error: null
    };

    orchestration.steps.push(stepExecution);

    try {
      // Check agent health before assignment
      const health = this.agentHealth.get(agentName);
      if (!health || health.status === 'unhealthy') {
        throw new Error(`Agent ${agentName} is unhealthy`);
      }

      // Simulate task execution
      await this.simulateProcessing(2000);
      
      // Mock successful execution
      stepExecution.result = {
        processed: true,
        agent: agentName,
        timestamp: new Date(),
        data: inputData
      };
      
      stepExecution.status = 'completed';
      stepExecution.endTime = new Date();

      // Update agent health metrics
      health.taskCount++;
      health.lastSeen = new Date();
      health.avgResponseTime = (health.avgResponseTime + 
        (stepExecution.endTime.getTime() - stepExecution.startTime.getTime())) / 2;

      return stepExecution.result;

    } catch (error) {
      stepExecution.status = 'failed';
      stepExecution.error = error.message;
      stepExecution.endTime = new Date();

      // Update agent health metrics
      const health = this.agentHealth.get(agentName);
      if (health) {
        health.errorRate = (health.errorRate * health.taskCount + 1) / (health.taskCount + 1);
        health.taskCount++;
      }

      throw error;
    }
  }

  private async monitorAgents(data: { agentNames?: string[] }): Promise<any> {
    this.log('info', 'Starting agent monitoring');

    await this.simulateProcessing(1000);

    const agentsToMonitor = data.agentNames || Array.from(this.agentHealth.keys());
    const monitoringReport = {
      timestamp: new Date(),
      overallHealth: 'healthy',
      agents: [],
      alerts: [],
      recommendations: []
    };

    let unhealthyCount = 0;

    for (const agentName of agentsToMonitor) {
      const health = this.agentHealth.get(agentName);
      if (health) {
        monitoringReport.agents.push({
          name: agentName,
          status: health.status,
          metrics: {
            taskCount: health.taskCount,
            errorRate: (health.errorRate * 100).toFixed(2) + '%',
            avgResponseTime: health.avgResponseTime + 'ms',
            lastSeen: health.lastSeen
          }
        });

        if (health.status === 'unhealthy') {
          unhealthyCount++;
          monitoringReport.alerts.push({
            type: 'agent_unhealthy',
            agent: agentName,
            message: `Agent ${agentName} is unhealthy`
          });
        }

        if (health.errorRate > 0.1) {
          monitoringReport.alerts.push({
            type: 'high_error_rate',
            agent: agentName,
            message: `High error rate detected: ${(health.errorRate * 100).toFixed(1)}%`
          });
        }
      }
    }

    // Set overall health
    if (unhealthyCount > agentsToMonitor.length * 0.5) {
      monitoringReport.overallHealth = 'critical';
    } else if (unhealthyCount > 0) {
      monitoringReport.overallHealth = 'degraded';
    }

    // Generate recommendations
    if (monitoringReport.alerts.length > 0) {
      monitoringReport.recommendations.push('Investigate and resolve agent health issues');
    }

    this.log('info', 'Agent monitoring completed', {
      overallHealth: monitoringReport.overallHealth,
      alerts: monitoringReport.alerts.length
    });

    return monitoringReport;
  }

  private async balanceLoad(data: { 
    tasks: any[]; 
    targetAgents: string[] 
  }): Promise<any> {
    if (!this.settings.loadBalancingEnabled) {
      return { message: 'Load balancing is disabled' };
    }

    this.log('info', 'Starting load balancing', {
      tasks: data.tasks.length,
      agents: data.targetAgents.length
    });

    await this.simulateProcessing(1500);

    const loadBalancing = {
      totalTasks: data.tasks.length,
      agentAssignments: new Map(),
      redistributed: 0,
      efficiency: 0
    };

    // Calculate current load for each agent
    const agentLoads = new Map();
    data.targetAgents.forEach(agent => {
      const health = this.agentHealth.get(agent);
      agentLoads.set(agent, health?.taskCount || 0);
    });

    // Distribute tasks evenly
    const tasksPerAgent = Math.ceil(data.tasks.length / data.targetAgents.length);
    
    data.targetAgents.forEach((agent, index) => {
      const startIndex = index * tasksPerAgent;
      const endIndex = Math.min(startIndex + tasksPerAgent, data.tasks.length);
      const assignedTasks = data.tasks.slice(startIndex, endIndex);
      
      loadBalancing.agentAssignments.set(agent, assignedTasks);
    });

    loadBalancing.efficiency = this.calculateLoadBalanceEfficiency(loadBalancing.agentAssignments);

    this.log('info', 'Load balancing completed', {
      efficiency: (loadBalancing.efficiency * 100).toFixed(1) + '%',
      redistributed: loadBalancing.redistributed
    });

    return loadBalancing;
  }

  private async handleFailures(data: {
    failedTasks: any[];
    retryStrategy: string;
  }): Promise<any> {
    this.log('info', 'Starting failure handling', {
      failedTasks: data.failedTasks.length,
      strategy: data.retryStrategy
    });

    await this.simulateProcessing(1000);

    const failureHandling = {
      totalFailures: data.failedTasks.length,
      retriedTasks: [],
      permanentFailures: [],
      recoveryActions: []
    };

    for (const failedTask of data.failedTasks) {
      const retryCount = failedTask.retryCount || 0;
      
      if (this.settings.autoRetryFailedTasks && retryCount < this.settings.maxRetryAttempts) {
        // Retry the task
        failureHandling.retriedTasks.push({
          taskId: failedTask.id,
          retryCount: retryCount + 1,
          retryStrategy: data.retryStrategy
        });
        
        failureHandling.recoveryActions.push({
          action: 'retry',
          taskId: failedTask.id,
          reason: 'Within retry limit'
        });
      } else {
        // Mark as permanent failure
        failureHandling.permanentFailures.push(failedTask);
        
        failureHandling.recoveryActions.push({
          action: 'escalate',
          taskId: failedTask.id,
          reason: 'Max retries exceeded'
        });
      }
    }

    this.log('info', 'Failure handling completed', {
      retried: failureHandling.retriedTasks.length,
      permanentFailures: failureHandling.permanentFailures.length
    });

    return failureHandling;
  }

  private async optimizeResources(data: { 
    currentLoad: any;
    targetEfficiency: number;
  }): Promise<any> {
    this.log('info', 'Starting resource optimization', {
      targetEfficiency: (data.targetEfficiency * 100).toFixed(1) + '%'
    });

    await this.simulateProcessing(2000);

    const optimization = {
      currentEfficiency: Math.random() * 0.2 + 0.7,
      targetEfficiency: data.targetEfficiency,
      recommendations: [],
      estimatedImprovement: 0
    };

    // Generate optimization recommendations
    if (optimization.currentEfficiency < data.targetEfficiency) {
      const gap = data.targetEfficiency - optimization.currentEfficiency;
      
      if (gap > 0.2) {
        optimization.recommendations.push('Scale up agent instances');
        optimization.recommendations.push('Optimize task distribution');
      } else if (gap > 0.1) {
        optimization.recommendations.push('Fine-tune agent configurations');
      } else {
        optimization.recommendations.push('Minor performance adjustments');
      }
      
      optimization.estimatedImprovement = gap * 0.7; // Estimate 70% improvement possible
    }

    this.log('info', 'Resource optimization completed', {
      recommendations: optimization.recommendations.length,
      estimatedImprovement: (optimization.estimatedImprovement * 100).toFixed(1) + '%'
    });

    return optimization;
  }

  private async generateReport(data: {
    reportType: string;
    timeRange: { start: Date; end: Date };
  }): Promise<any> {
    this.log('info', `Generating ${data.reportType} report`);

    await this.simulateProcessing(3000);

    const report = {
      type: data.reportType,
      generatedAt: new Date(),
      timeRange: data.timeRange,
      summary: {},
      details: {},
      metrics: {}
    };

    switch (data.reportType) {
      case 'performance':
        report.summary = {
          totalTasks: Math.floor(Math.random() * 1000) + 500,
          completedTasks: Math.floor(Math.random() * 900) + 450,
          failedTasks: Math.floor(Math.random() * 50) + 10,
          averageProcessingTime: Math.floor(Math.random() * 5000) + 2000
        };
        break;
        
      case 'health':
        report.summary = {
          healthyAgents: Array.from(this.agentHealth.values()).filter(h => h.status === 'healthy').length,
          degradedAgents: Array.from(this.agentHealth.values()).filter(h => h.status === 'degraded').length,
          unhealthyAgents: Array.from(this.agentHealth.values()).filter(h => h.status === 'unhealthy').length
        };
        break;
        
      case 'workload':
        report.summary = {
          peakHours: ['09:00-11:00', '14:00-16:00'],
          averageLoad: Math.floor(Math.random() * 70) + 30,
          resourceUtilization: Math.floor(Math.random() * 30) + 60
        };
        break;
    }

    this.log('info', `${data.reportType} report generated`);
    return report;
  }

  private performHealthChecks() {
    this.agentHealth.forEach((health, agentName) => {
      const timeSinceLastSeen = Date.now() - health.lastSeen.getTime();
      const timeoutMs = this.settings.healthCheckInterval * 3;

      if (timeSinceLastSeen > timeoutMs) {
        health.status = 'unhealthy';
      } else if (health.errorRate > 0.2) {
        health.status = 'degraded';
      } else {
        health.status = 'healthy';
      }
    });
  }

  private calculateLoadBalanceEfficiency(assignments: Map<string, any[]>): number {
    const loads = Array.from(assignments.values()).map(tasks => tasks.length);
    const maxLoad = Math.max(...loads);
    const minLoad = Math.min(...loads);
    
    if (maxLoad === 0) return 1;
    return 1 - ((maxLoad - minLoad) / maxLoad);
  }

  private async simulateProcessing(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  getSettings(): SupervisorSettings {
    return { ...this.settings };
  }

  getCapabilities(): string[] {
    return [
      'Workflow orchestration',
      'Agent monitoring',
      'Load balancing',
      'Failure handling',
      'Resource optimization',
      'Performance reporting'
    ];
  }

  async updateConfiguration(config: Partial<SupervisorSettings>): Promise<void> {
    this.settings = { ...this.settings, ...config };
    this.log('info', 'Configuration updated', config);
  }

  getAgentHealth(): Map<string, AgentHealth> {
    return new Map(this.agentHealth);
  }

  getWorkflows(): Map<string, any> {
    return new Map(this.workflows);
  }

  getTaskRegistry(): Map<string, any> {
    return new Map(this.taskRegistry);
  }
}
export interface AgentTask {
  id: string;
  type: string;
  data: any;
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

export interface AgentMetrics {
  tasksProcessed: number;
  tasksSuccessful: number;
  tasksFailed: number;
  averageProcessingTime: number;
  accuracy: number;
  speed: string;
}

export abstract class BaseAgent {
  protected name: string;
  protected status: 'idle' | 'active' | 'processing' | 'training' | 'error' = 'idle';
  protected currentTask: string = 'Ready';
  protected progress: number = 0;
  protected taskQueue: AgentTask[] = [];
  protected metrics: AgentMetrics;
  protected logs: Array<{ timestamp: Date; level: string; message: string; data?: any }> = [];

  constructor(name: string) {
    this.name = name;
    this.metrics = {
      tasksProcessed: 0,
      tasksSuccessful: 0,
      tasksFailed: 0,
      averageProcessingTime: 0,
      accuracy: 0,
      speed: '0 ops/sec'
    };
  }

  abstract processTask(task: AgentTask): Promise<any>;

  async addTask(task: AgentTask): Promise<void> {
    this.taskQueue.push(task);
    this.log('info', `Task ${task.id} added to queue`, { taskType: task.type });
    
    if (this.status === 'idle') {
      await this.processNextTask();
    }
  }

  private async processNextTask(): Promise<void> {
    if (this.taskQueue.length === 0) {
      this.status = 'idle';
      this.currentTask = 'Ready';
      this.progress = 0;
      return;
    }

    const task = this.taskQueue.shift()!;
    this.status = 'processing';
    this.currentTask = `Processing ${task.type}`;
    this.progress = 25;

    task.status = 'processing';
    task.startedAt = new Date();

    try {
      this.log('info', `Starting task ${task.id}`, { taskType: task.type });
      
      const result = await this.processTask(task);
      
      task.status = 'completed';
      task.completedAt = new Date();
      task.result = result;
      
      this.metrics.tasksProcessed++;
      this.metrics.tasksSuccessful++;
      this.updateMetrics(task);
      
      this.log('info', `Task ${task.id} completed successfully`);
      this.progress = 100;
      
      // Brief pause before next task
      setTimeout(() => this.processNextTask(), 1000);
      
    } catch (error) {
      task.status = 'failed';
      task.completedAt = new Date();
      task.error = error instanceof Error ? error.message : 'Unknown error';
      
      this.metrics.tasksProcessed++;
      this.metrics.tasksFailed++;
      this.updateMetrics(task);
      
      this.log('error', `Task ${task.id} failed`, { error: task.error });
      this.status = 'error';
      this.progress = 0;
      
      // Resume processing after error
      setTimeout(() => {
        this.status = 'idle';
        this.processNextTask();
      }, 5000);
    }
  }

  private updateMetrics(task: AgentTask): void {
    if (task.startedAt && task.completedAt) {
      const processingTime = task.completedAt.getTime() - task.startedAt.getTime();
      this.metrics.averageProcessingTime = 
        (this.metrics.averageProcessingTime * (this.metrics.tasksProcessed - 1) + processingTime) / 
        this.metrics.tasksProcessed;
    }
    
    this.metrics.accuracy = this.metrics.tasksProcessed > 0 ? 
      (this.metrics.tasksSuccessful / this.metrics.tasksProcessed) * 100 : 0;
    
    const opsPerSec = this.metrics.averageProcessingTime > 0 ? 
      1000 / this.metrics.averageProcessingTime : 0;
    this.metrics.speed = `${opsPerSec.toFixed(1)} ops/sec`;
  }

  protected log(level: string, message: string, data?: any): void {
    const logEntry = {
      timestamp: new Date(),
      level,
      message,
      data
    };
    this.logs.push(logEntry);
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
    
    console.log(`[${this.name}] ${level.toUpperCase()}: ${message}`, data || '');
  }

  getStatus() {
    return {
      name: this.name,
      status: this.status,
      task: this.currentTask,
      progress: this.progress,
      queueLength: this.taskQueue.length,
      metrics: this.metrics
    };
  }

  getLogs(limit: number = 100) {
    return this.logs.slice(-limit).reverse();
  }

  getConfiguration() {
    return {
      name: this.name,
      settings: this.getSettings(),
      capabilities: this.getCapabilities()
    };
  }

  abstract getSettings(): any;
  abstract getCapabilities(): string[];
  abstract updateConfiguration(config: any): Promise<void>;
}
export interface CleaningResult {
  original: string;
  cleaned: string;
  confidence: number;
  issues: string[];
  agent: string;
}

export interface AgentStatus {
  name: string;
  status: 'active' | 'idle' | 'processing' | 'training' | 'error';
  task: string;
  progress: number;
  performance: {
    accuracy: number;
    speed: string;
  };
}

export class AIAgentSystem {
  private agents: Map<string, AgentStatus> = new Map();

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents() {
    const agentConfigs = [
      {
        name: "Parser Agent",
        status: "idle" as const,
        task: "Ready to parse file structures",
        progress: 0,
        performance: { accuracy: 99.2, speed: "1.2k rows/sec" }
      },
      {
        name: "Cleaner Agent",
        status: "idle" as const,
        task: "Ready to normalize data",
        progress: 0,
        performance: { accuracy: 97.8, speed: "850 rows/sec" }
      },
      {
        name: "Labeler Agent",
        status: "idle" as const,
        task: "Ready to categorize data",
        progress: 0,
        performance: { accuracy: 94.5, speed: "2.1k rows/sec" }
      },
      {
        name: "Reviewer Agent",
        status: "idle" as const,
        task: "Ready to review anomalies",
        progress: 0,
        performance: { accuracy: 96.3, speed: "3.5k rows/sec" }
      },
      {
        name: "Trainer Agent",
        status: "idle" as const,
        task: "Ready for model training",
        progress: 0,
        performance: { accuracy: 98.7, speed: "Model updates/hour: 4" }
      },
      {
        name: "Supervisor Agent",
        status: "active" as const,
        task: "Monitoring system status",
        progress: 100,
        performance: { accuracy: 99.8, speed: "Tasks routed/sec: 156" }
      }
    ];

    agentConfigs.forEach(config => {
      this.agents.set(config.name, config);
    });
  }

  async processData(data: any[][], headers: string[]): Promise<CleaningResult[][]> {
    const results: CleaningResult[][] = [];
    
    // Update agent statuses
    this.updateAgentStatus("Parser Agent", "processing", "Analyzing data structure", 25);
    this.updateAgentStatus("Cleaner Agent", "active", "Normalizing field formats", 0);
    
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      const rowResults: CleaningResult[] = [];
      
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const value = row[colIndex];
        const header = headers[colIndex];
        const result = await this.cleanField(value, header, rowIndex, colIndex);
        rowResults.push(result);
      }
      
      results.push(rowResults);
      
      // Update progress
      const progress = Math.round(((rowIndex + 1) / data.length) * 100);
      this.updateAgentStatus("Cleaner Agent", "processing", "Normalizing field formats", progress);
    }
    
    // Finalize processing
    this.updateAgentStatus("Cleaner Agent", "idle", "Processing complete", 100);
    this.updateAgentStatus("Reviewer Agent", "processing", "Reviewing cleaned data", 50);
    
    setTimeout(() => {
      this.updateAgentStatus("Reviewer Agent", "idle", "Review complete", 100);
    }, 2000);
    
    return results;
  }

  private async cleanField(value: string, fieldType: string, row: number, col: number): Promise<CleaningResult> {
    if (!value || typeof value !== 'string') {
      return {
        original: value || '',
        cleaned: value || '',
        confidence: 100,
        issues: [],
        agent: 'Parser Agent'
      };
    }

    const original = value.toString();
    let cleaned = original;
    const issues: string[] = [];
    let confidence = 100;
    let agent = 'Cleaner Agent';

    // Name cleaning
    if (fieldType.toLowerCase().includes('name')) {
      if (original !== original.trim()) {
        cleaned = original.trim();
        issues.push('Whitespace trimmed');
        confidence -= 5;
      }
      
      if (original.toLowerCase() === original) {
        cleaned = this.titleCase(cleaned);
        issues.push('Name formatting');
        confidence -= 10;
      }
    }

    // Email cleaning
    if (fieldType.toLowerCase().includes('email')) {
      cleaned = original.toLowerCase().trim();
      if (!cleaned.includes('@') || !cleaned.includes('.')) {
        issues.push('Invalid email format');
        confidence -= 30;
      }
    }

    // Phone cleaning
    if (fieldType.toLowerCase().includes('phone')) {
      cleaned = this.normalizePhone(original);
      if (cleaned !== original) {
        issues.push('Phone number formatting');
        confidence -= 5;
      }
    }

    // Address cleaning
    if (fieldType.toLowerCase().includes('address')) {
      cleaned = this.normalizeAddress(original);
      if (cleaned !== original) {
        issues.push('Address standardization');
        confidence -= 10;
      }
    }

    // Amount/Currency cleaning
    if (fieldType.toLowerCase().includes('amount') || fieldType.toLowerCase().includes('balance')) {
      cleaned = this.normalizeAmount(original);
      if (cleaned !== original) {
        issues.push('Currency formatting');
        confidence -= 5;
      }
    }

    return {
      original,
      cleaned,
      confidence: Math.max(confidence, 50),
      issues,
      agent
    };
  }

  private titleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+1-${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+1-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    return phone;
  }

  private normalizeAddress(address: string): string {
    return address
      .replace(/\bst\b/gi, 'Street')
      .replace(/\bave\b/gi, 'Avenue')
      .replace(/\bdr\b/gi, 'Drive')
      .replace(/\brd\b/gi, 'Road')
      .replace(/\bln\b/gi, 'Lane')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizeAmount(amount: string): string {
    const cleaned = amount.replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? amount : num.toFixed(2);
  }

  updateAgentStatus(agentName: string, status: AgentStatus['status'], task: string, progress: number) {
    const agent = this.agents.get(agentName);
    if (agent) {
      agent.status = status;
      agent.task = task;
      agent.progress = progress;
    }
  }

  getAgentStatuses(): AgentStatus[] {
    return Array.from(this.agents.values());
  }

  async trainModel(feedbackData: any[]): Promise<void> {
    this.updateAgentStatus("Trainer Agent", "training", "Processing feedback data", 0);
    
    // Simulate training process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      this.updateAgentStatus("Trainer Agent", "training", "Fine-tuning model parameters", i);
    }
    
    this.updateAgentStatus("Trainer Agent", "idle", "Training complete", 100);
  }
}

export const aiAgentSystem = new AIAgentSystem();
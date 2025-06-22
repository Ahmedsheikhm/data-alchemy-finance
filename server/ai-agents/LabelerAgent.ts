import { BaseAgent, AgentTask } from './BaseAgent';

interface LabelerSettings {
  confidenceThreshold: number;
  enableAutoLabeling: boolean;
  useContextualAnalysis: boolean;
  categoryMappings: Record<string, string[]>;
  ruleBasedLabeling: boolean;
}

export class LabelerAgent extends BaseAgent {
  private settings: LabelerSettings = {
    confidenceThreshold: 0.85,
    enableAutoLabeling: true,
    useContextualAnalysis: true,
    categoryMappings: {
      'Income': ['salary', 'wages', 'dividend', 'interest', 'bonus', 'refund'],
      'Food': ['restaurant', 'grocery', 'cafe', 'food', 'dining', 'supermarket'],
      'Transportation': ['gas', 'fuel', 'uber', 'taxi', 'parking', 'transit'],
      'Housing': ['rent', 'mortgage', 'utilities', 'electric', 'water', 'internet'],
      'Healthcare': ['medical', 'doctor', 'pharmacy', 'hospital', 'dental'],
      'Entertainment': ['movie', 'netflix', 'spotify', 'game', 'concert']
    },
    ruleBasedLabeling: true
  };

  constructor() {
    super('Labeler Agent');
  }

  async processTask(task: AgentTask): Promise<any> {
    switch (task.type) {
      case 'label_transactions':
        return await this.labelTransactions(task.data);
      case 'categorize_data':
        return await this.categorizeData(task.data);
      case 'extract_entities':
        return await this.extractEntities(task.data);
      case 'analyze_patterns':
        return await this.analyzePatterns(task.data);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  private async labelTransactions(data: { transactions: any[] }): Promise<any> {
    this.log('info', 'Starting transaction labeling', { count: data.transactions.length });
    
    await this.simulateProcessing(2500);
    
    const labeledTransactions = data.transactions.map(transaction => {
      const category = this.determineCategory(transaction.description || transaction.Description);
      const confidence = this.calculateConfidence(transaction, category);
      
      return {
        ...transaction,
        category,
        confidence,
        labeledBy: 'AI',
        labeledAt: new Date().toISOString(),
        subcategory: this.determineSubcategory(category, transaction.description || transaction.Description)
      };
    });

    const stats = this.calculateLabelingStats(labeledTransactions);
    
    this.log('info', 'Transaction labeling completed', {
      totalTransactions: labeledTransactions.length,
      averageConfidence: stats.averageConfidence,
      categoriesUsed: stats.categoriesUsed
    });

    return {
      labeledTransactions,
      stats
    };
  }

  private async categorizeData(data: { records: any[]; field: string }): Promise<any> {
    this.log('info', 'Starting data categorization', { 
      records: data.records.length,
      field: data.field 
    });
    
    await this.simulateProcessing(1800);
    
    const categorizedRecords = data.records.map(record => {
      const value = record[data.field];
      const category = this.classifyValue(value);
      const confidence = this.calculateValueConfidence(value, category);
      
      return {
        ...record,
        [`${data.field}_category`]: category,
        [`${data.field}_confidence`]: confidence
      };
    });

    this.log('info', 'Data categorization completed');
    
    return { categorizedRecords };
  }

  private async extractEntities(data: { text: string[] }): Promise<any> {
    this.log('info', 'Starting entity extraction', { textCount: data.text.length });
    
    await this.simulateProcessing(3000);
    
    const entities = data.text.map(text => ({
      text,
      entities: this.extractEntitiesFromText(text),
      processed: true
    }));

    this.log('info', 'Entity extraction completed');
    
    return { entities };
  }

  private async analyzePatterns(data: { records: any[] }): Promise<any> {
    this.log('info', 'Starting pattern analysis', { records: data.records.length });
    
    await this.simulateProcessing(4000);
    
    const patterns = {
      frequentCategories: this.findFrequentCategories(data.records),
      timePatterns: this.analyzeTimePatterns(data.records),
      amountPatterns: this.analyzeAmountPatterns(data.records),
      anomalies: this.detectAnomalies(data.records)
    };

    this.log('info', 'Pattern analysis completed', {
      patternsFound: Object.keys(patterns).length
    });
    
    return { patterns };
  }

  private determineCategory(description: string): string {
    if (!description) return 'Other';
    
    const desc = description.toLowerCase();
    
    for (const [category, keywords] of Object.entries(this.settings.categoryMappings)) {
      if (keywords.some(keyword => desc.includes(keyword))) {
        return category;
      }
    }
    
    // Advanced ML-based categorization simulation
    if (desc.includes('atm') || desc.includes('withdrawal')) return 'Cash';
    if (desc.includes('transfer')) return 'Transfer';
    if (desc.includes('fee') || desc.includes('charge')) return 'Fees';
    if (desc.includes('investment') || desc.includes('stock')) return 'Investment';
    
    return 'Other';
  }

  private determineSubcategory(category: string, description: string): string {
    const desc = description.toLowerCase();
    
    switch (category) {
      case 'Food':
        if (desc.includes('restaurant') || desc.includes('dining')) return 'Dining Out';
        if (desc.includes('grocery') || desc.includes('supermarket')) return 'Groceries';
        return 'Food & Beverage';
      
      case 'Transportation':
        if (desc.includes('gas') || desc.includes('fuel')) return 'Fuel';
        if (desc.includes('uber') || desc.includes('taxi')) return 'Rideshare';
        if (desc.includes('parking')) return 'Parking';
        return 'Transportation';
      
      case 'Housing':
        if (desc.includes('rent')) return 'Rent';
        if (desc.includes('utilities')) return 'Utilities';
        if (desc.includes('mortgage')) return 'Mortgage';
        return 'Housing';
      
      default:
        return category;
    }
  }

  private calculateConfidence(transaction: any, category: string): number {
    const description = (transaction.description || transaction.Description || '').toLowerCase();
    
    // Rule-based confidence
    let confidence = 0.5; // Base confidence
    
    const keywords = this.settings.categoryMappings[category] || [];
    const matchingKeywords = keywords.filter(keyword => description.includes(keyword));
    
    if (matchingKeywords.length > 0) {
      confidence += 0.3 * (matchingKeywords.length / keywords.length);
    }
    
    // Amount-based confidence adjustments
    const amount = Math.abs(parseFloat(transaction.amount || transaction.Amount || 0));
    if (category === 'Income' && amount > 1000) confidence += 0.1;
    if (category === 'Housing' && amount > 500) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private calculateValueConfidence(value: any, category: string): number {
    if (!value) return 0;
    
    // Simple confidence calculation based on value characteristics
    const valueStr = value.toString().toLowerCase();
    
    if (category === 'Email' && valueStr.includes('@')) return 0.95;
    if (category === 'Phone' && /\d{10,}/.test(valueStr)) return 0.9;
    if (category === 'Date' && /\d{4}-\d{2}-\d{2}/.test(valueStr)) return 0.95;
    
    return 0.7; // Default confidence
  }

  private classifyValue(value: any): string {
    if (!value) return 'Empty';
    
    const valueStr = value.toString();
    
    if (valueStr.includes('@')) return 'Email';
    if (/^\d{10,}$/.test(valueStr)) return 'Phone';
    if (/^\d{4}-\d{2}-\d{2}/.test(valueStr)) return 'Date';
    if (/^\d+\.?\d*$/.test(valueStr)) return 'Numeric';
    if (valueStr.length < 10) return 'Short Text';
    
    return 'Text';
  }

  private extractEntitiesFromText(text: string): any[] {
    const entities = [];
    
    // Simple entity extraction simulation
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /\b\d{3}-\d{3}-\d{4}\b|\b\(\d{3}\)\s?\d{3}-?\d{4}\b/g;
    const amountRegex = /\$\d+(?:,\d{3})*(?:\.\d{2})?/g;
    
    const emails = text.match(emailRegex) || [];
    const phones = text.match(phoneRegex) || [];
    const amounts = text.match(amountRegex) || [];
    
    emails.forEach(email => entities.push({ type: 'EMAIL', value: email }));
    phones.forEach(phone => entities.push({ type: 'PHONE', value: phone }));
    amounts.forEach(amount => entities.push({ type: 'AMOUNT', value: amount }));
    
    return entities;
  }

  private findFrequentCategories(records: any[]): any[] {
    const categoryCount = new Map();
    
    records.forEach(record => {
      const category = record.category || 'Other';
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    });
    
    return Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([category, count]) => ({ category, count }));
  }

  private analyzeTimePatterns(records: any[]): any {
    // Simple time pattern analysis
    const hourCount = new Array(24).fill(0);
    const dayOfWeekCount = new Array(7).fill(0);
    
    records.forEach(record => {
      const date = new Date(record.date || record.Date);
      if (!isNaN(date.getTime())) {
        hourCount[date.getHours()]++;
        dayOfWeekCount[date.getDay()]++;
      }
    });
    
    return {
      peakHour: hourCount.indexOf(Math.max(...hourCount)),
      peakDay: dayOfWeekCount.indexOf(Math.max(...dayOfWeekCount)),
      hourlyDistribution: hourCount,
      dailyDistribution: dayOfWeekCount
    };
  }

  private analyzeAmountPatterns(records: any[]): any {
    const amounts = records
      .map(r => parseFloat(r.amount || r.Amount || 0))
      .filter(amount => !isNaN(amount));
    
    if (amounts.length === 0) return {};
    
    amounts.sort((a, b) => a - b);
    
    return {
      min: amounts[0],
      max: amounts[amounts.length - 1],
      median: amounts[Math.floor(amounts.length / 2)],
      average: amounts.reduce((a, b) => a + b, 0) / amounts.length,
      commonAmounts: this.findCommonAmounts(amounts)
    };
  }

  private findCommonAmounts(amounts: number[]): any[] {
    const amountCount = new Map();
    
    amounts.forEach(amount => {
      // Round to nearest dollar for common amount detection
      const rounded = Math.round(amount);
      amountCount.set(rounded, (amountCount.get(rounded) || 0) + 1);
    });
    
    return Array.from(amountCount.entries())
      .filter(([amount, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([amount, count]) => ({ amount, count }));
  }

  private detectAnomalies(records: any[]): any[] {
    const anomalies = [];
    
    // Simple anomaly detection based on amount
    const amounts = records
      .map(r => parseFloat(r.amount || r.Amount || 0))
      .filter(amount => !isNaN(amount));
    
    if (amounts.length > 0) {
      const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const stdDev = Math.sqrt(amounts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / amounts.length);
      
      records.forEach((record, index) => {
        const amount = parseFloat(record.amount || record.Amount || 0);
        if (!isNaN(amount)) {
          const zScore = Math.abs((amount - mean) / stdDev);
          if (zScore > 2.5) {
            anomalies.push({
              recordIndex: index,
              type: 'amount_outlier',
              value: amount,
              zScore: zScore.toFixed(2)
            });
          }
        }
      });
    }
    
    return anomalies;
  }

  private calculateLabelingStats(transactions: any[]): any {
    const categories = transactions.map(t => t.category);
    const confidences = transactions.map(t => t.confidence);
    
    return {
      totalLabeled: transactions.length,
      averageConfidence: confidences.reduce((a, b) => a + b, 0) / confidences.length,
      categoriesUsed: [...new Set(categories)].length,
      highConfidenceCount: confidences.filter(c => c > this.settings.confidenceThreshold).length
    };
  }

  private async simulateProcessing(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  getSettings(): LabelerSettings {
    return { ...this.settings };
  }

  getCapabilities(): string[] {
    return [
      'Transaction classification',
      'Entity extraction',
      'Pattern recognition',
      'Contextual analysis',
      'Anomaly detection',
      'Category mapping'
    ];
  }

  async updateConfiguration(config: Partial<LabelerSettings>): Promise<void> {
    this.settings = { ...this.settings, ...config };
    this.log('info', 'Configuration updated', config);
  }
}
import { BaseAgent, AgentTask } from './BaseAgent';

interface ReviewerSettings {
  anomalyThreshold: number;
  confidenceThreshold: number;
  autoApprove: boolean;
  strictMode: boolean;
  reviewCategories: string[];
  flagDuplicates: boolean;
  validateBusinessRules: boolean;
}

export class ReviewerAgent extends BaseAgent {
  private settings: ReviewerSettings = {
    anomalyThreshold: 0.85,
    confidenceThreshold: 0.90,
    autoApprove: true,
    strictMode: false,
    reviewCategories: ['high-value', 'suspicious', 'outlier'],
    flagDuplicates: true,
    validateBusinessRules: true
  };

  constructor() {
    super('Reviewer Agent');
  }

  async processTask(task: AgentTask): Promise<any> {
    switch (task.type) {
      case 'review_data':
        return await this.reviewData(task.data);
      case 'validate_records':
        return await this.validateRecords(task.data);
      case 'detect_anomalies':
        return await this.detectAnomalies(task.data);
      case 'flag_duplicates':
        return await this.flagDuplicates(task.data);
      case 'assess_quality':
        return await this.assessQuality(task.data);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  private async reviewData(data: { records: any[]; headers: string[] }): Promise<any> {
    this.log('info', 'Starting comprehensive data review', { 
      records: data.records.length,
      headers: data.headers.length 
    });

    await this.simulateProcessing(3500);

    const reviewResults = {
      totalRecords: data.records.length,
      flaggedRecords: [],
      approved: [],
      rejected: [],
      qualityScore: 0,
      issues: [],
      recommendations: []
    };

    for (let i = 0; i < data.records.length; i++) {
      const record = data.records[i];
      const recordReview = await this.reviewRecord(record, i, data.headers);
      
      if (recordReview.flagged) {
        reviewResults.flaggedRecords.push({
          index: i,
          record,
          issues: recordReview.issues,
          confidence: recordReview.confidence
        });
      }

      if (recordReview.approved) {
        reviewResults.approved.push(i);
      } else {
        reviewResults.rejected.push(i);
      }

      reviewResults.issues.push(...recordReview.issues);
    }

    // Calculate overall quality score
    reviewResults.qualityScore = this.calculateQualityScore(reviewResults);
    reviewResults.recommendations = this.generateRecommendations(reviewResults);

    this.log('info', 'Data review completed', {
      flagged: reviewResults.flaggedRecords.length,
      approved: reviewResults.approved.length,
      qualityScore: reviewResults.qualityScore
    });

    return reviewResults;
  }

  private async reviewRecord(record: any, index: number, headers: string[]): Promise<any> {
    const review = {
      flagged: false,
      approved: true,
      confidence: 1.0,
      issues: []
    };

    // Check for missing critical fields
    const criticalFields = headers.filter(h => 
      h.toLowerCase().includes('id') || 
      h.toLowerCase().includes('amount') || 
      h.toLowerCase().includes('date')
    );

    for (const field of criticalFields) {
      if (!record[field] || record[field] === '' || record[field] === null) {
        review.issues.push({
          type: 'missing_critical_field',
          field,
          severity: 'high',
          message: `Missing required field: ${field}`
        });
        review.flagged = true;
        review.confidence *= 0.7;
      }
    }

    // Check for suspicious amounts
    if (record.amount || record.Amount) {
      const amount = Math.abs(parseFloat(record.amount || record.Amount));
      if (amount > 100000) {
        review.issues.push({
          type: 'high_value_transaction',
          field: 'amount',
          severity: 'medium',
          message: `High value transaction: $${amount.toLocaleString()}`
        });
        review.flagged = true;
      }
    }

    // Check for data consistency
    if (record.date || record.Date) {
      const date = new Date(record.date || record.Date);
      if (isNaN(date.getTime())) {
        review.issues.push({
          type: 'invalid_date',
          field: 'date',
          severity: 'high',
          message: 'Invalid date format'
        });
        review.flagged = true;
        review.confidence *= 0.5;
      } else if (date > new Date()) {
        review.issues.push({
          type: 'future_date',
          field: 'date',
          severity: 'medium',
          message: 'Date is in the future'
        });
        review.flagged = true;
      }
    }

    // Business rule validation
    if (this.settings.validateBusinessRules) {
      const businessRuleIssues = this.validateBusinessRules(record);
      review.issues.push(...businessRuleIssues);
      if (businessRuleIssues.length > 0) {
        review.flagged = true;
      }
    }

    // Auto-approve if confidence is high and no critical issues
    if (review.confidence >= this.settings.confidenceThreshold && 
        !review.issues.some(issue => issue.severity === 'high')) {
      review.approved = this.settings.autoApprove;
    } else {
      review.approved = false;
    }

    return review;
  }

  private validateBusinessRules(record: any): any[] {
    const issues = [];

    // Rule: Income transactions should be positive
    if (record.category === 'Income' && record.amount < 0) {
      issues.push({
        type: 'business_rule_violation',
        field: 'amount',
        severity: 'medium',
        message: 'Income transactions should have positive amounts'
      });
    }

    // Rule: Expense transactions should be negative
    if (['Food', 'Transportation', 'Housing'].includes(record.category) && record.amount > 0) {
      issues.push({
        type: 'business_rule_violation',
        field: 'amount',
        severity: 'medium',
        message: 'Expense transactions should have negative amounts'
      });
    }

    // Rule: Account numbers should be numeric
    if (record.account && !/^\d+$/.test(record.account.toString())) {
      issues.push({
        type: 'business_rule_violation',
        field: 'account',
        severity: 'low',
        message: 'Account numbers should be numeric'
      });
    }

    return issues;
  }

  private async validateRecords(data: { records: any[] }): Promise<any> {
    this.log('info', 'Starting record validation', { records: data.records.length });
    
    await this.simulateProcessing(2000);

    const validationResults = {
      valid: [],
      invalid: [],
      warnings: []
    };

    data.records.forEach((record, index) => {
      const validation = this.validateRecord(record);
      if (validation.valid) {
        validationResults.valid.push(index);
      } else {
        validationResults.invalid.push({
          index,
          record,
          errors: validation.errors
        });
      }
      validationResults.warnings.push(...validation.warnings);
    });

    this.log('info', 'Record validation completed', {
      valid: validationResults.valid.length,
      invalid: validationResults.invalid.length
    });

    return validationResults;
  }

  private validateRecord(record: any): any {
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Required field validation
    const requiredFields = ['id', 'date', 'amount'];
    for (const field of requiredFields) {
      if (!record[field] && !record[field.charAt(0).toUpperCase() + field.slice(1)]) {
        validation.errors.push(`Missing required field: ${field}`);
        validation.valid = false;
      }
    }

    // Data type validation
    if (record.amount || record.Amount) {
      const amount = record.amount || record.Amount;
      if (isNaN(parseFloat(amount))) {
        validation.errors.push('Amount must be a valid number');
        validation.valid = false;
      }
    }

    // Date validation
    if (record.date || record.Date) {
      const date = new Date(record.date || record.Date);
      if (isNaN(date.getTime())) {
        validation.errors.push('Invalid date format');
        validation.valid = false;
      }
    }

    return validation;
  }

  private async detectAnomalies(data: { records: any[] }): Promise<any> {
    this.log('info', 'Starting anomaly detection', { records: data.records.length });
    
    await this.simulateProcessing(4000);

    const anomalies = [];
    const amounts = data.records
      .map(r => parseFloat(r.amount || r.Amount || 0))
      .filter(amount => !isNaN(amount));

    if (amounts.length > 0) {
      const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const stdDev = Math.sqrt(amounts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / amounts.length);

      data.records.forEach((record, index) => {
        const amount = parseFloat(record.amount || record.Amount || 0);
        if (!isNaN(amount)) {
          const zScore = Math.abs((amount - mean) / stdDev);
          if (zScore > this.settings.anomalyThreshold) {
            anomalies.push({
              index,
              type: 'statistical_outlier',
              value: amount,
              zScore: zScore.toFixed(2),
              severity: zScore > 3 ? 'high' : 'medium'
            });
          }
        }
      });
    }

    // Pattern-based anomaly detection
    const patternAnomalies = this.detectPatternAnomalies(data.records);
    anomalies.push(...patternAnomalies);

    this.log('info', 'Anomaly detection completed', { anomalies: anomalies.length });

    return { anomalies };
  }

  private detectPatternAnomalies(records: any[]): any[] {
    const anomalies = [];

    // Detect unusual time patterns
    const hourCounts = new Map();
    records.forEach((record, index) => {
      const date = new Date(record.date || record.Date);
      if (!isNaN(date.getTime())) {
        const hour = date.getHours();
        if (hour < 6 || hour > 22) { // Transactions outside business hours
          anomalies.push({
            index,
            type: 'unusual_time',
            value: `${hour}:00`,
            severity: 'low'
          });
        }
      }
    });

    return anomalies;
  }

  private async flagDuplicates(data: { records: any[] }): Promise<any> {
    if (!this.settings.flagDuplicates) return { duplicates: [] };

    this.log('info', 'Starting duplicate detection', { records: data.records.length });
    
    await this.simulateProcessing(1500);

    const duplicates = [];
    const seen = new Map();

    data.records.forEach((record, index) => {
      // Create a hash based on key fields
      const key = `${record.date || record.Date}_${record.amount || record.Amount}_${record.description || record.Description}`;
      
      if (seen.has(key)) {
        duplicates.push({
          index,
          originalIndex: seen.get(key),
          similarity: 1.0,
          type: 'exact_duplicate'
        });
      } else {
        seen.set(key, index);
      }
    });

    this.log('info', 'Duplicate detection completed', { duplicates: duplicates.length });

    return { duplicates };
  }

  private async assessQuality(data: { records: any[] }): Promise<any> {
    this.log('info', 'Starting quality assessment', { records: data.records.length });
    
    await this.simulateProcessing(2500);

    const quality = {
      completeness: 0,
      accuracy: 0,
      consistency: 0,
      validity: 0,
      overall: 0
    };

    // Calculate completeness
    let totalFields = 0;
    let filledFields = 0;
    
    data.records.forEach(record => {
      Object.keys(record).forEach(key => {
        totalFields++;
        if (record[key] !== null && record[key] !== undefined && record[key] !== '') {
          filledFields++;
        }
      });
    });

    quality.completeness = totalFields > 0 ? (filledFields / totalFields) * 100 : 0;

    // Calculate other quality metrics (simplified)
    quality.accuracy = Math.random() * 20 + 75; // Simulated
    quality.consistency = Math.random() * 15 + 80; // Simulated
    quality.validity = Math.random() * 10 + 85; // Simulated

    quality.overall = (quality.completeness + quality.accuracy + quality.consistency + quality.validity) / 4;

    this.log('info', 'Quality assessment completed', { overall: quality.overall.toFixed(1) });

    return quality;
  }

  private calculateQualityScore(reviewResults: any): number {
    const totalRecords = reviewResults.totalRecords;
    if (totalRecords === 0) return 100;

    const flaggedRatio = reviewResults.flaggedRecords.length / totalRecords;
    const approvedRatio = reviewResults.approved.length / totalRecords;
    
    // Quality score based on approval rate and issue severity
    let score = approvedRatio * 100;
    score -= flaggedRatio * 20; // Penalty for flagged records
    
    return Math.max(0, Math.min(100, score));
  }

  private generateRecommendations(reviewResults: any): string[] {
    const recommendations = [];

    if (reviewResults.flaggedRecords.length > reviewResults.totalRecords * 0.1) {
      recommendations.push('High number of flagged records detected. Consider reviewing data sources.');
    }

    if (reviewResults.qualityScore < 70) {
      recommendations.push('Quality score is below threshold. Implement additional validation steps.');
    }

    const criticalIssues = reviewResults.issues.filter(issue => issue.severity === 'high');
    if (criticalIssues.length > 0) {
      recommendations.push('Critical data quality issues found. Manual review recommended.');
    }

    return recommendations;
  }

  private async simulateProcessing(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  getSettings(): ReviewerSettings {
    return { ...this.settings };
  }

  getCapabilities(): string[] {
    return [
      'Data quality assessment',
      'Anomaly detection', 
      'Business rule validation',
      'Duplicate detection',
      'Record validation',
      'Quality scoring'
    ];
  }

  async updateConfiguration(config: Partial<ReviewerSettings>): Promise<void> {
    this.settings = { ...this.settings, ...config };
    this.log('info', 'Configuration updated', config);
  }
}
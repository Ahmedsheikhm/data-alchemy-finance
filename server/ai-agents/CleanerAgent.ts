import { BaseAgent, AgentTask } from './BaseAgent';

interface CleanerSettings {
  normalizeText: boolean;
  standardizeCurrency: boolean;
  validateDates: boolean;
  removeInvalidEntries: boolean;
  fillMissingValues: 'none' | 'mean' | 'median' | 'forward' | 'backward';
  outlierDetection: boolean;
  outlierThreshold: number;
}

export class CleanerAgent extends BaseAgent {
  private settings: CleanerSettings = {
    normalizeText: true,
    standardizeCurrency: true,
    validateDates: true,
    removeInvalidEntries: false,
    fillMissingValues: 'forward',
    outlierDetection: true,
    outlierThreshold: 2.5
  };

  constructor() {
    super('Cleaner Agent');
  }

  async processTask(task: AgentTask): Promise<any> {
    switch (task.type) {
      case 'clean_data':
        return await this.cleanData(task.data);
      case 'normalize_text':
        return await this.normalizeText(task.data);
      case 'standardize_currency':
        return await this.standardizeCurrency(task.data);
      case 'validate_dates':
        return await this.validateDates(task.data);
      case 'detect_outliers':
        return await this.detectOutliers(task.data);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  private async cleanDataset(data: { rows: any[]; headers: string[] }): Promise<any> {
    this.log('info', 'Starting data normalization', { 
      totalRows: data.rows.length, 
      headers: data.headers 
    });

    const cleanedRows = [];
    const issues = [];
    
    for (let i = 0; i < data.rows.length; i++) {
      const row = data.rows[i];
      const cleanedRow = [];
      
      for (let j = 0; j < data.headers.length; j++) {
        const header = data.headers[j];
        const value = row[j];
        const result = this.cleanFieldValue(header, value);
        
        cleanedRow.push(result.cleaned);
        
        if (result.issues.length > 0) {
          issues.push({
            row: i,
            column: j,
            field: header,
            original: value,
            cleaned: result.cleaned,
            issues: result.issues
          });
        }
      }
      
      cleanedRows.push(cleanedRow);
    }

    this.log('info', 'Data cleaning completed', { 
      cleanedRows: cleanedRows.length,
      issuesFound: issues.length
    });

    return {
      cleanedRows,
      issues,
      stats: {
        totalRecords: data.rows.length,
        cleanedRecords: cleanedRows.length,
        flaggedRecords: issues.length
      }
    };
  }

  private cleanFieldValue(fieldName: string, value: any): { cleaned: any; issues: string[] } {
    const issues: string[] = [];
    let cleaned = value;

    if (value === null || value === undefined || value === '') {
      return { cleaned: null, issues: ['empty_value'] };
    }

    const fieldLower = fieldName.toLowerCase();

    // Gender normalization
    if (fieldLower.includes('gender') || fieldLower.includes('sex')) {
      cleaned = this.normalizeGender(value);
      if (cleaned !== value) {
        this.log('info', 'Normalized gender value', { original: value, cleaned });
      }
    }
    // Boolean normalization  
    else if (this.isBooleanField(fieldLower)) {
      cleaned = this.normalizeBoolean(value);
      if (cleaned !== value) {
        this.log('info', 'Normalized boolean value', { original: value, cleaned });
      }
    }
    // Currency normalization
    else if (this.isCurrencyField(fieldName)) {
      cleaned = this.standardizeCurrencyValue(value);
      if (cleaned !== value) {
        this.log('info', 'Normalized currency value', { original: value, cleaned });
      }
    }
    // Date normalization
    else if (this.isDateField(fieldName)) {
      cleaned = this.validateDateValue(value);
      if (cleaned !== value) {
        this.log('info', 'Normalized date value', { original: value, cleaned });
      }
    }
    // Text normalization
    else if (typeof value === 'string') {
      cleaned = this.normalizeTextValue(value);
      if (cleaned !== value) {
        this.log('info', 'Normalized text value', { original: value, cleaned });
      }
    }

    return { cleaned, issues };
  }

  private normalizeGender(value: any): string {
    if (!value) return null;
    
    const str = value.toString().toLowerCase().trim();
    
    if (str.match(/^(m|male|man|boy)$/)) return 'M';
    if (str.match(/^(f|female|woman|girl)$/)) return 'F';
    if (str.match(/^(o|other|non-binary|nb)$/)) return 'O';
    
    return 'U'; // Unknown
  }

  private normalizeBoolean(value: any): boolean | null {
    if (value === null || value === undefined) return null;
    
    const str = value.toString().toLowerCase().trim();
    
    if (str.match(/^(true|yes|y|1|on|active|enabled)$/)) return true;
    if (str.match(/^(false|no|n|0|off|inactive|disabled)$/)) return false;
    
    return null;
  }

  private isBooleanField(fieldName: string): boolean {
    return /^(is_|has_|active|enabled|verified|confirmed)/.test(fieldName) ||
           fieldName.includes('status') ||
           fieldName.includes('flag');
  }

  private async cleanData(data: { rows: any[]; headers: string[] }): Promise<any> {
    this.log('info', 'Starting comprehensive data cleaning', { 
      totalRows: data.rows.length,
      columns: data.headers.length 
    });

    let cleanedRows = [...data.rows];
    const issues: Array<{ row: number; column: string; issue: string; action: string }> = [];
    let cleanedCount = 0;

    // Simulate AI-powered cleaning process
    await this.simulateProcessing(3000);

    for (let rowIndex = 0; rowIndex < cleanedRows.length; rowIndex++) {
      const row = cleanedRows[rowIndex];
      
      for (const header of data.headers) {
        const originalValue = row[header];
        let cleanedValue = originalValue;
        let wasChanged = false;

        // Text normalization
        if (this.settings.normalizeText && typeof originalValue === 'string') {
          cleanedValue = this.normalizeTextValue(originalValue);
          if (cleanedValue !== originalValue) {
            wasChanged = true;
            issues.push({
              row: rowIndex,
              column: header,
              issue: 'Text formatting inconsistency',
              action: 'Normalized text case and whitespace'
            });
          }
        }

        // Currency standardization
        if (this.settings.standardizeCurrency && this.isCurrencyField(header)) {
          const standardized = this.standardizeCurrencyValue(cleanedValue);
          if (standardized !== cleanedValue) {
            cleanedValue = standardized;
            wasChanged = true;
            issues.push({
              row: rowIndex,
              column: header,
              issue: 'Currency format variation',
              action: 'Standardized currency format'
            });
          }
        }

        // Date validation
        if (this.settings.validateDates && this.isDateField(header)) {
          const validatedDate = this.validateDateValue(cleanedValue);
          if (validatedDate !== cleanedValue) {
            cleanedValue = validatedDate;
            wasChanged = true;
            issues.push({
              row: rowIndex,
              column: header,
              issue: 'Invalid date format',
              action: 'Corrected date format'
            });
          }
        }

        // Update the row if changes were made
        if (wasChanged) {
          row[header] = cleanedValue;
          cleanedCount++;
        }
      }
    }

    // Handle missing values
    if (this.settings.fillMissingValues !== 'none') {
      cleanedRows = this.fillMissingValues(cleanedRows, data.headers);
    }

    // Detect and handle outliers
    if (this.settings.outlierDetection) {
      const outlierResults = this.detectOutliersInData(cleanedRows, data.headers);
      issues.push(...outlierResults.issues);
    }

    this.log('info', 'Data cleaning completed', {
      originalRows: data.rows.length,
      cleanedRows: cleanedRows.length,
      changesApplied: cleanedCount,
      issuesFound: issues.length
    });

    return {
      originalData: data.rows,
      cleanedData: cleanedRows,
      headers: data.headers,
      issues,
      stats: {
        totalRecords: cleanedRows.length,
        cleanedRecords: cleanedCount,
        issuesFound: issues.length,
        accuracy: cleanedRows.length > 0 ? ((cleanedRows.length - issues.length) / cleanedRows.length) * 100 : 100
      }
    };
  }

  private normalizeTextValue(value: string): string {
    return value
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private standardizeCurrencyValue(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;

    // Remove currency symbols and formatting
    const cleaned = value
      .replace(/[$£€¥,\s]/g, '')
      .replace(/[()]/g, ''); // Handle negative values in parentheses

    const numValue = parseFloat(cleaned);
    return isNaN(numValue) ? 0 : numValue;
  }

  private validateDateValue(value: any): string {
    if (!value) return '';
    
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return ''; // Invalid date
      }
      return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    } catch {
      return '';
    }
  }

  private fillMissingValues(rows: any[], headers: string[]): any[] {
    const filledRows = rows.map(row => ({ ...row }));

    headers.forEach(header => {
      const values = filledRows.map(row => row[header]);
      const nonEmptyValues = values.filter(v => v !== null && v !== undefined && v !== '');

      if (nonEmptyValues.length === 0) return;

      for (let i = 0; i < filledRows.length; i++) {
        if (values[i] === null || values[i] === undefined || values[i] === '') {
          let fillValue;

          switch (this.settings.fillMissingValues) {
            case 'mean':
              if (this.isNumericField(header)) {
                const numValues = nonEmptyValues.filter(v => typeof v === 'number');
                fillValue = numValues.reduce((a, b) => a + b, 0) / numValues.length;
              }
              break;
            case 'median':
              if (this.isNumericField(header)) {
                const sorted = nonEmptyValues.filter(v => typeof v === 'number').sort((a, b) => a - b);
                fillValue = sorted[Math.floor(sorted.length / 2)];
              }
              break;
            case 'forward':
              fillValue = i > 0 ? values[i - 1] : nonEmptyValues[0];
              break;
            case 'backward':
              fillValue = i < values.length - 1 ? values[i + 1] : nonEmptyValues[nonEmptyValues.length - 1];
              break;
          }

          if (fillValue !== undefined) {
            filledRows[i][header] = fillValue;
          }
        }
      }
    });

    return filledRows;
  }

  private detectOutliersInData(rows: any[], headers: string[]): { issues: any[] } {
    const issues: any[] = [];

    headers.forEach(header => {
      if (this.isNumericField(header)) {
        const values = rows.map(row => row[header]).filter(v => typeof v === 'number');
        
        if (values.length > 0) {
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);

          rows.forEach((row, index) => {
            const value = row[header];
            if (typeof value === 'number') {
              const zScore = Math.abs((value - mean) / stdDev);
              if (zScore > this.settings.outlierThreshold) {
                issues.push({
                  row: index,
                  column: header,
                  issue: 'Statistical outlier detected',
                  action: `Value ${value} is ${zScore.toFixed(2)} standard deviations from mean`
                });
              }
            }
          });
        }
      }
    });

    return { issues };
  }

  private async normalizeText(data: { text: string }): Promise<string> {
    await this.simulateProcessing(500);
    return this.normalizeTextValue(data.text);
  }

  private async standardizeCurrency(data: { value: any }): Promise<number> {
    await this.simulateProcessing(300);
    return this.standardizeCurrencyValue(data.value);
  }

  private async validateDates(data: { date: any }): Promise<string> {
    await this.simulateProcessing(400);
    return this.validateDateValue(data.date);
  }

  private async detectOutliers(data: { values: number[] }): Promise<any> {
    await this.simulateProcessing(800);
    
    const values = data.values;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);

    const outliers = values
      .map((value, index) => ({ value, index, zScore: Math.abs((value - mean) / stdDev) }))
      .filter(item => item.zScore > this.settings.outlierThreshold);

    return { outliers, mean, stdDev, threshold: this.settings.outlierThreshold };
  }

  private isCurrencyField(header: string): boolean {
    const currencyKeywords = ['amount', 'price', 'cost', 'fee', 'balance', 'total', 'payment'];
    return currencyKeywords.some(keyword => header.toLowerCase().includes(keyword));
  }

  private isDateField(header: string): boolean {
    const dateKeywords = ['date', 'time', 'created', 'updated', 'timestamp'];
    return dateKeywords.some(keyword => header.toLowerCase().includes(keyword));
  }

  private isNumericField(header: string): boolean {
    const numericKeywords = ['amount', 'count', 'quantity', 'number', 'id', 'total', 'balance'];
    return numericKeywords.some(keyword => header.toLowerCase().includes(keyword));
  }

  private async simulateProcessing(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  getSettings(): CleanerSettings {
    return { ...this.settings };
  }

  getCapabilities(): string[] {
    return [
      'Text normalization',
      'Currency standardization',
      'Date validation',
      'Missing value imputation',
      'Outlier detection',
      'Data quality assessment'
    ];
  }

  async updateConfiguration(config: Partial<CleanerSettings>): Promise<void> {
    this.settings = { ...this.settings, ...config };
    this.log('info', 'Configuration updated', config);
  }
}
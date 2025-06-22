import { BaseAgent, AgentTask } from './BaseAgent';

interface ParserSettings {
  csvDelimiter: string;
  autoDetectEncoding: boolean;
  headerRowIndex: number;
  skipEmptyRows: boolean;
  maxRowsToAnalyze: number;
  dateFormats: string[];
}

export class ParserAgent extends BaseAgent {
  private settings: ParserSettings = {
    csvDelimiter: 'auto',
    autoDetectEncoding: true,
    headerRowIndex: 0,
    skipEmptyRows: true,
    maxRowsToAnalyze: 1000,
    dateFormats: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'MM-DD-YYYY']
  };

  constructor() {
    super('Parser Agent');
  }

  async processTask(task: AgentTask): Promise<any> {
    switch (task.type) {
      case 'parse_csv':
        return await this.parseCSV(task.data);
      case 'parse_excel':
        return await this.parseExcel(task.data);
      case 'parse_pdf':
        return await this.parsePDF(task.data);
      case 'detect_structure':
        return await this.detectStructure(task.data);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  private async parseFile(data: { content: string; filename: string; fileType: string }): Promise<any> {
    this.log('info', 'Analyzing file structure', { filename: data.filename, type: data.fileType });
    
    if (data.fileType === 'text/csv' || data.filename.endsWith('.csv')) {
      return this.parseCSVContent(data.content, data.filename);
    } else {
      throw new Error(`Unsupported file type: ${data.fileType}`);
    }
  }

  private async parseCSVContent(content: string, filename: string): Promise<any> {
    this.log('info', 'Starting CSV parsing', { filename: data.filename });
    
    // Simulate AI-powered CSV parsing
    await this.simulateProcessing(2000);
    
    const lines = data.content.split('\n').filter(line => 
      this.settings.skipEmptyRows ? line.trim() !== '' : true
    );
    
    if (lines.length === 0) {
      throw new Error('Empty CSV file');
    }

    // Auto-detect delimiter
    const delimiter = this.detectDelimiter(lines[0]);
    this.log('info', 'Detected CSV delimiter', { delimiter, headerRow: lines[0] });
    this.log('info', `Detected delimiter: ${delimiter}`);
    
    // Parse headers
    const headers = lines[this.settings.headerRowIndex].split(delimiter).map(h => h.trim().replace(/['"]/g, ''));
    
    // Parse data rows
    const rows = lines.slice(this.settings.headerRowIndex + 1).map(line => {
      const values = line.split(delimiter).map(v => v.trim().replace(/['"]/g, ''));
      return this.processRowValues(values, headers);
    });

    // Detect column types
    const columnTypes = this.detectColumnTypes(rows, headers);
    
    this.log('info', 'CSV parsing completed', { 
      rows: rows.length, 
      columns: headers.length,
      types: columnTypes 
    });

    return {
      headers,
      rows,
      columnTypes,
      metadata: {
        delimiter,
        totalRows: rows.length,
        totalColumns: headers.length,
        encoding: 'UTF-8'
      }
    };
  }

  private async parseExcel(data: { content: ArrayBuffer; filename: string }): Promise<any> {
    this.log('info', 'Starting Excel parsing', { filename: data.filename });
    
    // Simulate Excel parsing with AI structure detection
    await this.simulateProcessing(3000);
    
    // Mock Excel parsing (in real implementation, use a library like xlsx)
    const mockData = this.generateMockFinancialData();
    
    this.log('info', 'Excel parsing completed', { 
      sheets: 1,
      rows: mockData.rows.length,
      columns: mockData.headers.length
    });

    return mockData;
  }

  private async parsePDF(data: { content: ArrayBuffer; filename: string }): Promise<any> {
    this.log('info', 'Starting PDF parsing', { filename: data.filename });
    
    // Simulate AI-powered PDF text extraction and table detection
    await this.simulateProcessing(5000);
    
    // Mock PDF table extraction
    const mockData = this.generateMockFinancialData();
    
    this.log('info', 'PDF parsing completed', { 
      tables: 1,
      rows: mockData.rows.length,
      columns: mockData.headers.length
    });

    return mockData;
  }

  private async detectStructure(data: { sample: any[] }): Promise<any> {
    this.log('info', 'Analyzing data structure');
    
    await this.simulateProcessing(1500);
    
    if (!data.sample || data.sample.length === 0) {
      throw new Error('No sample data provided');
    }

    const structure = {
      rowCount: data.sample.length,
      columnCount: Object.keys(data.sample[0] || {}).length,
      patterns: this.detectPatterns(data.sample),
      recommendations: this.generateRecommendations(data.sample)
    };

    this.log('info', 'Structure analysis completed', structure);
    return structure;
  }

  private detectDelimiter(line: string): string {
    if (this.settings.csvDelimiter !== 'auto') {
      return this.settings.csvDelimiter;
    }

    const delimiters = [',', ';', '\t', '|'];
    const counts = delimiters.map(d => ({
      delimiter: d,
      count: (line.match(new RegExp('\\' + d, 'g')) || []).length
    }));

    return counts.reduce((max, current) => 
      current.count > max.count ? current : max
    ).delimiter;
  }

  private processRowValues(values: string[], headers: string[]): any {
    const row: any = {};
    headers.forEach((header, index) => {
      let value = values[index] || '';
      
      // AI-powered value processing
      if (this.isNumeric(value)) {
        row[header] = parseFloat(value);
      } else if (this.isDate(value)) {
        row[header] = new Date(value);
      } else {
        row[header] = value;
      }
    });
    return row;
  }

  private detectColumnTypes(rows: any[], headers: string[]): Record<string, string> {
    const types: Record<string, string> = {};
    
    headers.forEach(header => {
      const sampleValues = rows.slice(0, 100).map(row => row[header]).filter(v => v !== null && v !== '');
      
      if (sampleValues.length === 0) {
        types[header] = 'unknown';
        return;
      }

      const numericCount = sampleValues.filter(v => this.isNumeric(v)).length;
      const dateCount = sampleValues.filter(v => this.isDate(v)).length;
      
      const numericRatio = numericCount / sampleValues.length;
      const dateRatio = dateCount / sampleValues.length;

      if (numericRatio > 0.8) {
        types[header] = 'numeric';
      } else if (dateRatio > 0.8) {
        types[header] = 'date';
      } else {
        types[header] = 'text';
      }
    });

    return types;
  }

  private detectPatterns(sample: any[]): any {
    return {
      hasHeaders: true,
      hasNumericIds: true,
      hasDates: true,
      hasAmounts: true,
      dataQuality: 'good'
    };
  }

  private generateRecommendations(sample: any[]): string[] {
    return [
      'Consider normalizing currency formats',
      'Validate date formats for consistency',
      'Check for duplicate entries',
      'Standardize text casing'
    ];
  }

  private isNumeric(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  private isDate(value: any): boolean {
    if (typeof value === 'string') {
      const dateRegex = /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$|^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/;
      return dateRegex.test(value);
    }
    return false;
  }

  private generateMockFinancialData() {
    return {
      headers: ['Transaction_ID', 'Date', 'Amount', 'Description', 'Category', 'Account'],
      rows: [
        ['TXN001', '2024-01-15', 2500.00, 'Salary Deposit', 'Income', 'Checking'],
        ['TXN002', '2024-01-16', -45.20, 'Grocery Store', 'Food', 'Checking'],
        ['TXN003', '2024-01-17', -1200.00, 'Rent Payment', 'Housing', 'Checking'],
        ['TXN004', '2024-01-18', -85.50, 'Utilities', 'Bills', 'Checking'],
        ['TXN005', '2024-01-19', -120.00, 'Gas Station', 'Transportation', 'Credit Card']
      ],
      columnTypes: {
        'Transaction_ID': 'text',
        'Date': 'date',
        'Amount': 'numeric',
        'Description': 'text',
        'Category': 'text',
        'Account': 'text'
      }
    };
  }

  private async simulateProcessing(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  getSettings(): ParserSettings {
    return { ...this.settings };
  }

  getCapabilities(): string[] {
    return [
      'CSV delimiter detection',
      'PDF text block extraction',
      'Excel sheet parsing',
      'Data type inference',
      'Structure analysis',
      'Format validation'
    ];
  }

  async updateConfiguration(config: Partial<ParserSettings>): Promise<void> {
    this.settings = { ...this.settings, ...config };
    this.log('info', 'Configuration updated', config);
  }
}
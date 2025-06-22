export interface ParsedData {
  headers: string[];
  rows: any[][];
  metadata: {
    fileName: string;
    fileType: string;
    rowCount: number;
    columnCount: number;
    parseTime: number;
  };
}

export class FileParser {
  static async parseCSV(file: File): Promise<ParsedData> {
    const startTime = Date.now();
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('Empty CSV file');
    }

    const headers = this.parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => this.parseCSVLine(line));

    return {
      headers,
      rows,
      metadata: {
        fileName: file.name,
        fileType: 'CSV',
        rowCount: rows.length,
        columnCount: headers.length,
        parseTime: Date.now() - startTime
      }
    };
  }

  static async parseExcel(file: File): Promise<ParsedData> {
    const startTime = Date.now();
    
    // Simulate Excel parsing (in real implementation, use libraries like xlsx)
    const mockHeaders = ['Customer Name', 'Email', 'Phone', 'Address', 'Amount', 'Date'];
    const mockRows = [
      ['John Smith', 'john.smith@email.com', '+1-555-123-4567', '123 Main Street, New York, NY 10001', '1250.50', '2024-01-15'],
      ['jane doe', 'JANE.DOE@GMAIL.COM', '(555) 987-6543', '456 oak st', '890.25', '2024-01-14'],
      ['Bob Johnson', 'bob@company', '555.456.7890', '789 Pine Avenue, Los Angeles, CA', '2100.00', '2024-01-13']
    ];

    return {
      headers: mockHeaders,
      rows: mockRows,
      metadata: {
        fileName: file.name,
        fileType: 'Excel',
        rowCount: mockRows.length,
        columnCount: mockHeaders.length,
        parseTime: Date.now() - startTime
      }
    };
  }

  static async parsePDF(file: File): Promise<ParsedData> {
    const startTime = Date.now();
    
    // Simulate PDF parsing (in real implementation, use libraries like pdf-parse)
    const mockHeaders = ['Transaction ID', 'Date', 'Description', 'Amount', 'Balance'];
    const mockRows = [
      ['TXN001', '2024-01-15', 'Payment received from John Smith', '1250.50', '5430.75'],
      ['TXN002', '2024-01-14', 'Transfer to savings account', '-500.00', '4180.25'],
      ['TXN003', '2024-01-13', 'Direct deposit salary', '3200.00', '4680.25']
    ];

    return {
      headers: mockHeaders,
      rows: mockRows,
      metadata: {
        fileName: file.name,
        fileType: 'PDF',
        rowCount: mockRows.length,
        columnCount: mockHeaders.length,
        parseTime: Date.now() - startTime
      }
    };
  }

  private static parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  static async parseFile(file: File): Promise<ParsedData> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'csv':
        return this.parseCSV(file);
      case 'xlsx':
      case 'xls':
        return this.parseExcel(file);
      case 'pdf':
        return this.parsePDF(file);
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  }
}
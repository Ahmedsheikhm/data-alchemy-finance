// API client for server communication
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  lastActivity: string;
}

export interface ProcessedFile {
  id: string;
  userId: number;
  name: string;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  uploadTime: string;
  processTime?: string;
  originalData?: any[][];
  cleanedData?: any[][];
  headers?: string[];
  cleaningResults?: any[][];
  issues?: string[];
  stats?: {
    totalRecords: number;
    cleanedRecords: number;
    flaggedRecords: number;
    accuracy: number;
  };
}

export interface FeedbackEntry {
  id: string;
  userId: number;
  fileId: string;
  fieldName: string;
  originalValue: string;
  cleanedValue: string;
  userCorrection?: string;
  rating: 'correct' | 'incorrect' | 'partial';
  confidence: string;
  timestamp: string;
  notes?: string;
}

class APIClient {
  private baseURL = '';

  async login(email: string, name: string): Promise<User> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    return data.user;
  }

  async getUser(id: number): Promise<User> {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to get user');
    }

    const data = await response.json();
    return data.user;
  }

  async getFiles(userId: number): Promise<ProcessedFile[]> {
    const response = await fetch(`/api/files?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get files');
    }

    const data = await response.json();
    return data.files;
  }

  async createFile(fileData: Omit<ProcessedFile, 'uploadTime' | 'processTime'>): Promise<ProcessedFile> {
    const response = await fetch('/api/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fileData),
    });

    if (!response.ok) {
      throw new Error('Failed to create file');
    }

    const data = await response.json();
    return data.file;
  }

  async updateFile(id: string, updates: Partial<ProcessedFile>): Promise<ProcessedFile> {
    const response = await fetch(`/api/files/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update file');
    }

    const data = await response.json();
    return data.file;
  }

  async deleteFile(id: string): Promise<void> {
    const response = await fetch(`/api/files/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }
  }

  async getFile(id: string): Promise<ProcessedFile> {
    const response = await fetch(`/api/files/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to get file');
    }

    const data = await response.json();
    return data.file;
  }

  async getFeedback(fileId: string): Promise<FeedbackEntry[]> {
    const response = await fetch(`/api/feedback?fileId=${fileId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get feedback');
    }

    const data = await response.json();
    return data.feedback;
  }

  async createFeedback(feedbackData: Omit<FeedbackEntry, 'timestamp'>): Promise<FeedbackEntry> {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    });

    if (!response.ok) {
      throw new Error('Failed to create feedback');
    }

    const data = await response.json();
    return data.feedback;
  }

  async getStats(userId?: number): Promise<{ totalFiles: number; cleanedRecords: number; avgAccuracy: number }> {
    const url = userId ? `/api/stats?userId=${userId}` : '/api/stats';
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to get stats');
    }

    const data = await response.json();
    return data.stats;
  }
}

export const apiClient = new APIClient();
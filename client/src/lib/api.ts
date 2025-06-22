// API client for server communication
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  lastActivity: string;
}

export interface Project {
  id: string;
  userId: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  settings?: any;
}

export interface ProcessedFile {
  id: string;
  userId: number;
  projectId?: string;
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
  commonFields?: any;
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
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fileData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create file: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data.file;
    } catch (error) {
      console.error('Create file error:', error);
      throw error;
    }
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

  async getProjects(userId: number): Promise<Project[]> {
    const response = await fetch(`/api/projects?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get projects');
    }

    const data = await response.json();
    return data.projects;
  }

  async createProject(projectData: Omit<Project, 'createdAt' | 'updatedAt'>): Promise<Project> {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      throw new Error('Failed to create project');
    }

    const data = await response.json();
    return data.project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update project');
    }

    const data = await response.json();
    return data.project;
  }

  async deleteProject(id: string): Promise<void> {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete project');
    }
  }

  async getProject(id: string): Promise<Project> {
    const response = await fetch(`/api/projects/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to get project');
    }

    const data = await response.json();
    return data.project;
  }

  async getProjectFiles(projectId: string): Promise<ProcessedFile[]> {
    const response = await fetch(`/api/projects/${projectId}/files`);
    
    if (!response.ok) {
      throw new Error('Failed to get project files');
    }

    const data = await response.json();
    return data.files;
  }

  async getStats(userId?: number, projectId?: string): Promise<{ totalFiles: number; cleanedRecords: number; avgAccuracy: number }> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId.toString());
    if (projectId) params.append('projectId', projectId);
    
    const url = `/api/stats${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to get stats');
    }

    const data = await response.json();
    return data.stats;
  }
}

export const apiClient = new APIClient();
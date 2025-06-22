import { apiClient, type User, type ProcessedFile as APIProcessedFile, type FeedbackEntry as APIFeedbackEntry } from './api';

export interface ProcessedFile extends Omit<APIProcessedFile, 'uploadTime' | 'processTime'> {
  uploadTime: Date;
  processTime?: Date;
}

export interface UserSession extends Omit<User, 'createdAt' | 'lastActivity'> {
  loginTime: Date;
  lastActivity: Date;
}

export interface FeedbackEntry extends Omit<APIFeedbackEntry, 'timestamp' | 'confidence'> {
  confidence: number;
  timestamp: Date;
}

class DataStore {
  private currentSession: UserSession | null = null;

  // Session Management
  async createSession(email: string, name: string): Promise<UserSession> {
    try {
      const user = await apiClient.login(email, name);
      const session: UserSession = {
        id: user.id,
        email: user.email,
        name: user.name,
        loginTime: new Date(),
        lastActivity: new Date()
      };
      
      this.currentSession = session;
      this.saveCurrentSessionToStorage();
      return session;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }

  getCurrentSession(): UserSession | null {
    if (!this.currentSession) {
      this.loadCurrentSessionFromStorage();
    }
    return this.currentSession;
  }

  // File Management - now using API
  async addFile(file: Omit<ProcessedFile, 'userId' | 'uploadTime' | 'processTime'>): Promise<ProcessedFile> {
    const session = this.getCurrentSession();
    if (!session) {
      throw new Error('No active session');
    }

    const apiFile = await apiClient.createFile({
      ...file,
      userId: session.id,
      uploadTime: new Date().toISOString(),
    });

    return {
      ...apiFile,
      uploadTime: new Date(apiFile.uploadTime),
      processTime: apiFile.processTime ? new Date(apiFile.processTime) : undefined,
    };
  }

  async updateFile(id: string, updates: Partial<ProcessedFile>): Promise<ProcessedFile | undefined> {
    try {
      const apiUpdates = {
        ...updates,
        uploadTime: updates.uploadTime?.toISOString(),
        processTime: updates.processTime?.toISOString(),
      };
      
      const apiFile = await apiClient.updateFile(id, apiUpdates);
      return {
        ...apiFile,
        uploadTime: new Date(apiFile.uploadTime),
        processTime: apiFile.processTime ? new Date(apiFile.processTime) : undefined,
      };
    } catch (error) {
      console.error('Failed to update file:', error);
      return undefined;
    }
  }

  async getFile(id: string): Promise<ProcessedFile | undefined> {
    try {
      const apiFile = await apiClient.getFile(id);
      return {
        ...apiFile,
        uploadTime: new Date(apiFile.uploadTime),
        processTime: apiFile.processTime ? new Date(apiFile.processTime) : undefined,
      };
    } catch (error) {
      console.error('Failed to get file:', error);
      return undefined;
    }
  }

  async getAllFiles(): Promise<ProcessedFile[]> {
    const session = this.getCurrentSession();
    if (!session) {
      return [];
    }

    try {
      const apiFiles = await apiClient.getFiles(session.id);
      return apiFiles.map(file => ({
        ...file,
        uploadTime: new Date(file.uploadTime),
        processTime: file.processTime ? new Date(file.processTime) : undefined,
      }));
    } catch (error) {
      console.error('Failed to get files:', error);
      return [];
    }
  }

  async deleteFile(id: string): Promise<boolean> {
    try {
      await apiClient.deleteFile(id);
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  updateLastActivity(): void {
    if (this.currentSession) {
      this.currentSession.lastActivity = new Date();
      this.saveCurrentSessionToStorage();
    }
  }

  logout(): void {
    this.currentSession = null;
    this.saveCurrentSessionToStorage();
  }

  // Feedback Management - now using API
  async addFeedback(feedback: Omit<FeedbackEntry, 'id' | 'timestamp' | 'userId'>): Promise<FeedbackEntry> {
    const session = this.getCurrentSession();
    if (!session) {
      throw new Error('No active session');
    }

    try {
      const apiFeedback = await apiClient.createFeedback({
        ...feedback,
        id: this.generateId(),
        userId: session.id,
        confidence: feedback.confidence.toString(),
      });

      return {
        ...apiFeedback,
        confidence: parseFloat(apiFeedback.confidence),
        timestamp: new Date(apiFeedback.timestamp),
      };
    } catch (error) {
      console.error('Failed to add feedback:', error);
      throw error;
    }
  }

  async getFeedback(fileId?: string): Promise<FeedbackEntry[]> {
    if (!fileId) {
      return [];
    }

    try {
      const apiFeedback = await apiClient.getFeedback(fileId);
      return apiFeedback.map(feedback => ({
        ...feedback,
        confidence: parseFloat(feedback.confidence),
        timestamp: new Date(feedback.timestamp),
      }));
    } catch (error) {
      console.error('Failed to get feedback:', error);
      return [];
    }
  }

  // Statistics - now using API
  async getStats() {
    const session = this.getCurrentSession();
    
    try {
      const stats = await apiClient.getStats(session?.id);
      return {
        totalFiles: stats.totalFiles,
        completedFiles: stats.totalFiles, // Approximation
        totalRecords: stats.cleanedRecords,
        cleanedRecords: stats.cleanedRecords,
        avgAccuracy: Math.round(stats.avgAccuracy * 10) / 10,
        processingFiles: 0 // Would need additional API call
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      return {
        totalFiles: 0,
        completedFiles: 0,
        totalRecords: 0,
        cleanedRecords: 0,
        avgAccuracy: 0,
        processingFiles: 0
      };
    }
  }

  // Utility Methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private saveCurrentSessionToStorage(): void {
    try {
      localStorage.setItem('dataAlchemy_currentSession', JSON.stringify(this.currentSession));
    } catch (error) {
      console.warn('Failed to save current session to localStorage:', error);
    }
  }

  private loadCurrentSessionFromStorage(): void {
    try {
      const currentSessionData = localStorage.getItem('dataAlchemy_currentSession');
      if (currentSessionData) {
        const session = JSON.parse(currentSessionData);
        if (session) {
          this.currentSession = {
            ...session,
            loginTime: new Date(session.loginTime),
            lastActivity: new Date(session.lastActivity)
          };
        }
      }
    } catch (error) {
      console.warn('Failed to load current session from localStorage:', error);
    }
  }

  clearAll(): void {
    this.currentSession = null;
    localStorage.removeItem('dataAlchemy_currentSession');
  }

  constructor() {
    this.loadCurrentSessionFromStorage();
  }
}

export const dataStore = new DataStore();
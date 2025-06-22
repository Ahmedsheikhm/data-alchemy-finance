export interface ProcessedFile {
  id: string;
  name: string;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  uploadTime: Date;
  processTime?: Date;
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

export interface UserSession {
  id: string;
  email: string;
  name: string;
  loginTime: Date;
  lastActivity: Date;
}

export interface FeedbackEntry {
  id: string;
  userId: string;
  fileId: string;
  fieldName: string;
  originalValue: string;
  cleanedValue: string;
  userCorrection?: string;
  rating: 'correct' | 'incorrect' | 'partial';
  confidence: number;
  timestamp: Date;
  notes?: string;
}

class DataStore {
  private files: Map<string, ProcessedFile> = new Map();
  private sessions: Map<string, UserSession> = new Map();
  private feedback: Map<string, FeedbackEntry> = new Map();
  private currentSession: UserSession | null = null;

  // File Management
  addFile(file: ProcessedFile): void {
    this.files.set(file.id, file);
    this.saveToStorage();
  }

  updateFile(id: string, updates: Partial<ProcessedFile>): void {
    const file = this.files.get(id);
    if (file) {
      Object.assign(file, updates);
      this.saveToStorage();
    }
  }

  getFile(id: string): ProcessedFile | undefined {
    return this.files.get(id);
  }

  getAllFiles(): ProcessedFile[] {
    return Array.from(this.files.values()).sort((a, b) => 
      b.uploadTime.getTime() - a.uploadTime.getTime()
    );
  }

  deleteFile(id: string): boolean {
    const deleted = this.files.delete(id);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  // Session Management
  createSession(email: string, name: string): UserSession {
    const session: UserSession = {
      id: this.generateId(),
      email,
      name,
      loginTime: new Date(),
      lastActivity: new Date()
    };
    
    this.sessions.set(session.id, session);
    this.currentSession = session;
    this.saveToStorage();
    return session;
  }

  getCurrentSession(): UserSession | null {
    return this.currentSession;
  }

  updateLastActivity(): void {
    if (this.currentSession) {
      this.currentSession.lastActivity = new Date();
      this.saveToStorage();
    }
  }

  logout(): void {
    this.currentSession = null;
    this.saveToStorage();
  }

  getSessionHistory(): UserSession[] {
    return Array.from(this.sessions.values()).sort((a, b) => 
      b.loginTime.getTime() - a.loginTime.getTime()
    );
  }

  // Feedback Management
  addFeedback(feedback: Omit<FeedbackEntry, 'id' | 'timestamp'>): FeedbackEntry {
    const entry: FeedbackEntry = {
      ...feedback,
      id: this.generateId(),
      timestamp: new Date()
    };
    
    this.feedback.set(entry.id, entry);
    this.saveToStorage();
    return entry;
  }

  getFeedback(fileId?: string): FeedbackEntry[] {
    const allFeedback = Array.from(this.feedback.values());
    if (fileId) {
      return allFeedback.filter(f => f.fileId === fileId);
    }
    return allFeedback.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Statistics
  getStats() {
    const files = this.getAllFiles();
    const completedFiles = files.filter(f => f.status === 'completed');
    
    const totalRecords = completedFiles.reduce((sum, f) => sum + (f.stats?.totalRecords || 0), 0);
    const cleanedRecords = completedFiles.reduce((sum, f) => sum + (f.stats?.cleanedRecords || 0), 0);
    const avgAccuracy = completedFiles.length > 0 
      ? completedFiles.reduce((sum, f) => sum + (f.stats?.accuracy || 0), 0) / completedFiles.length
      : 0;

    return {
      totalFiles: files.length,
      completedFiles: completedFiles.length,
      totalRecords,
      cleanedRecords,
      avgAccuracy: Math.round(avgAccuracy * 10) / 10,
      processingFiles: files.filter(f => f.status === 'processing').length
    };
  }

  // Utility Methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('dataAlchemy_files', JSON.stringify(Array.from(this.files.entries())));
      localStorage.setItem('dataAlchemy_sessions', JSON.stringify(Array.from(this.sessions.entries())));
      localStorage.setItem('dataAlchemy_feedback', JSON.stringify(Array.from(this.feedback.entries())));
      localStorage.setItem('dataAlchemy_currentSession', JSON.stringify(this.currentSession));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  loadFromStorage(): void {
    try {
      const filesData = localStorage.getItem('dataAlchemy_files');
      if (filesData) {
        const entries = JSON.parse(filesData);
        this.files = new Map(entries.map(([id, file]: [string, any]) => [
          id, 
          { ...file, uploadTime: new Date(file.uploadTime), processTime: file.processTime ? new Date(file.processTime) : undefined }
        ]));
      }

      const sessionsData = localStorage.getItem('dataAlchemy_sessions');
      if (sessionsData) {
        const entries = JSON.parse(sessionsData);
        this.sessions = new Map(entries.map(([id, session]: [string, any]) => [
          id,
          { ...session, loginTime: new Date(session.loginTime), lastActivity: new Date(session.lastActivity) }
        ]));
      }

      const feedbackData = localStorage.getItem('dataAlchemy_feedback');
      if (feedbackData) {
        const entries = JSON.parse(feedbackData);
        this.feedback = new Map(entries.map(([id, feedback]: [string, any]) => [
          id,
          { ...feedback, timestamp: new Date(feedback.timestamp) }
        ]));
      }

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
      console.warn('Failed to load from localStorage:', error);
    }
  }

  clearAll(): void {
    this.files.clear();
    this.sessions.clear();
    this.feedback.clear();
    this.currentSession = null;
    localStorage.removeItem('dataAlchemy_files');
    localStorage.removeItem('dataAlchemy_sessions');
    localStorage.removeItem('dataAlchemy_feedback');
    localStorage.removeItem('dataAlchemy_currentSession');
  }
}

export const dataStore = new DataStore();

// Initialize on load
dataStore.loadFromStorage();
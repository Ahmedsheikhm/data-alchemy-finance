import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X, Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileParser } from '@/lib/fileParser';
import { aiAgentSystem } from '@/lib/aiAgents';
import { dataStore, ProcessedFile } from '@/lib/dataStore';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  cleanedRecords?: number;
  issues?: string[];
  file?: File;
}

interface FileUploadZoneProps {
  onFilesUploaded: (files: ProcessedFile[]) => void;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onFilesUploaded }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = async (uploadedFile: UploadedFile) => {
    if (!uploadedFile.file) return;

    try {
      // Update status to processing
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'processing', progress: 10 }
          : f
      ));

      // Parse file content
      const reader = new FileReader();
      const parsedData = await new Promise((resolve, reject) => {
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (uploadedFile.file.name.endsWith('.csv')) {
            const lines = content.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim());
            const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));
            resolve({ headers, rows, metadata: { fileType: 'csv' } });
          } else {
            reject(new Error('Only CSV files supported'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(uploadedFile.file);
      });
      
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, progress: 30 }
          : f
      ));

      // Process through AI agents pipeline
      const agentResults = await processWithAgents(parsedData);
      
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, progress: 80 }
          : f
      ));

      // Create processed file record
      const totalRecords = parsedData.rows.length;
      const cleanedRecords = agentResults.cleaner.stats.cleanedRecords;
      const flaggedRecords = agentResults.reviewer.summary.flaggedRecords;
      const accuracy = agentResults.reviewer.qualityScore;

      const processedFile: ProcessedFile = {
        id: uploadedFile.id,
        name: uploadedFile.name,
        type: parsedData.metadata.fileType,
        status: 'completed',
        progress: 100,
        uploadTime: new Date(),
        processTime: new Date(),
        originalData: parsedData.rows,
        cleanedData: agentResults.cleaner.cleanedRows,
        headers: agentResults.labeler.newHeaders,
        cleaningResults: agentResults.cleaner.issues,
        issues: agentResults.cleaner.issues || [],
        stats: {
          totalRecords,
          cleanedRecords,
          flaggedRecords,
          accuracy: Math.round(accuracy * 10) / 10
        }
      };

      // Update local state
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { 
              ...f, 
              status: 'completed', 
              progress: 100, 
              cleanedRecords: cleanedRecords,
              issues: processedFile.issues 
            }
          : f
      ));

      // Notify parent component with the processed file
      onFilesUploaded([processedFile]);

      toast({
        title: "File processed successfully",
        description: `${uploadedFile.name} has been cleaned and is ready for review.`,
      });

    } catch (error) {
      console.error('File processing error:', error);
      
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id 
          ? { ...f, status: 'error', issues: ['Processing failed'] }
          : f
      ));

      toast({
        title: "Processing failed",
        description: `Failed to process ${uploadedFile.name}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  };

  const processFiles = (fileList: File[]) => {
    const supportedTypes = ['.csv', '.xlsx', '.xls', '.pdf', '.json'];
    const validFiles = fileList.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return supportedTypes.includes(extension);
    });

    if (validFiles.length !== fileList.length) {
      toast({
        title: "Unsupported files detected",
        description: "Only CSV, Excel, PDF, and JSON files are supported.",
        variant: "destructive",
      });
    }

    const newFiles: UploadedFile[] = validFiles.map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2),
      name: file.name,
      size: file.size,
      type: file.type || 'unknown',
      status: 'uploading',
      progress: 0,
      file
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Start processing each file
    newFiles.forEach(file => {
      setTimeout(() => processFile(file), Math.random() * 500);
    });
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const retryFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'uploading', progress: 0, issues: [] }
          : f
      ));
      setTimeout(() => processFile(file), 500);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Financial Data</CardTitle>
          <CardDescription>
            Upload CSV, Excel, PDF, or JSON files for AI-powered data cleaning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Drop files here or click to upload</h3>
            <p className="text-sm text-gray-500 mb-4">
              Supports CSV, Excel (.xlsx, .xls), PDF, and JSON files up to 10MB each
            </p>
            <input
              type="file"
              multiple
              accept=".csv,.xlsx,.xls,.pdf,.json"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Choose Files
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Queue</CardTitle>
            <CardDescription>Track the progress of your uploaded files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          file.status === 'completed' ? 'default' :
                          file.status === 'error' ? 'destructive' :
                          file.status === 'processing' ? 'secondary' : 'outline'
                        }>
                          {file.status}
                        </Badge>
                        {file.status === 'error' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => retryFile(file.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      {file.status !== 'completed' && file.status !== 'error' && (
                        <Progress value={file.progress} className="flex-1 max-w-32" />
                      )}
                      {file.cleanedRecords && (
                        <span className="text-green-600 font-medium">
                          {file.cleanedRecords} records cleaned
                        </span>
                      )}
                    </div>
                    {file.issues && file.issues.length > 0 && (
                      <div className="mt-2 flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs text-yellow-600">
                          {file.issues.slice(0, 2).join(', ')}
                          {file.issues.length > 2 && ` +${file.issues.length - 2} more`}
                        </span>
                      </div>
                    )}
                  </div>
                  {file.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUploadZone;
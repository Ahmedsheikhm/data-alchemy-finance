
import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: number;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  cleanedRecords?: number;
  issues?: string[];
}

interface FileUploadZoneProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
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

  const simulateFileProcessing = (file: UploadedFile) => {
    const updateProgress = (progress: number, status?: UploadedFile['status']) => {
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, progress, status: status || f.status }
          : f
      ));
    };

    // Simulate upload progress
    updateProgress(20, 'uploading');
    setTimeout(() => updateProgress(50, 'processing'), 500);
    setTimeout(() => updateProgress(80, 'processing'), 1000);
    setTimeout(() => {
      const cleanedRecords = Math.floor(Math.random() * 1000) + 100;
      const issues = Math.random() > 0.7 ? ['Duplicate entries found', 'Missing values detected'] : [];
      
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, progress: 100, status: 'completed', cleanedRecords, issues }
          : f
      ));
      
      toast({
        title: "File processed successfully",
        description: `${file.name} has been cleaned and is ready for review.`,
      });
    }, 1500);
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

    const newFiles: UploadedFile[] = validFiles.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type || 'unknown',
      status: 'uploading',
      progress: 0,
    }));

    setFiles(prev => [...prev, ...newFiles]);
    onFilesUploaded([...files, ...newFiles]);

    // Start processing each file
    newFiles.forEach(file => {
      setTimeout(() => simulateFileProcessing(file), Math.random() * 500);
    });
  };

  const removeFile = (fileId: number) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
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
                      {file.status !== 'completed' && (
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
                          {file.issues.join(', ')}
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


import { useState, useCallback } from "react";
import { Upload, FileText, FileSpreadsheet, File, X, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface FileUploadZoneProps {
  onFilesUploaded: (files: any[]) => void;
}

const FileUploadZone = ({ onFilesUploaded }: FileUploadZoneProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, []);

  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: getFileType(file.name),
      status: "uploading",
      progress: 0,
      file: file
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach((file, index) => {
      simulateUpload(file.id, index * 500);
    });

    toast({
      title: "Files uploaded",
      description: `${newFiles.length} file(s) added to processing queue.`,
    });
  };

  const simulateUpload = (fileId: number, delay: number) => {
    setTimeout(() => {
      const interval = setInterval(() => {
        setUploadedFiles(prev => prev.map(file => {
          if (file.id === fileId) {
            const newProgress = Math.min(file.progress + Math.random() * 20, 100);
            const newStatus = newProgress === 100 ? "completed" : "uploading";
            return { ...file, progress: newProgress, status: newStatus };
          }
          return file;
        }));
      }, 200);

      setTimeout(() => {
        clearInterval(interval);
        setUploadedFiles(prev => prev.map(file => 
          file.id === fileId ? { ...file, progress: 100, status: "completed" } : file
        ));
      }, 3000);
    }, delay);
  };

  const getFileType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'csv': return 'CSV';
      case 'xlsx': case 'xls': return 'Excel';
      case 'pdf': return 'PDF';
      case 'json': return 'JSON';
      default: return 'Unknown';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'CSV': return FileText;
      case 'Excel': return FileSpreadsheet;
      case 'PDF': return File;
      case 'JSON': return FileText;
      default: return File;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'uploading': return Clock;
      case 'error': return AlertCircle;
      default: return Clock;
    }
  };

  const removeFile = (fileId: number) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Financial Data Files</CardTitle>
          <CardDescription>
            Drag and drop your CSV, Excel, PDF, or JSON files here. Our AI agents will automatically process and clean your data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Drop files here</h3>
            <p className="text-muted-foreground mb-4">
              Supports CSV, Excel, PDF, and JSON formats up to 100MB
            </p>
            <input
              type="file"
              multiple
              accept=".csv,.xlsx,.xls,.pdf,.json"
              onChange={handleChange}
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

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Queue</CardTitle>
            <CardDescription>Monitor the progress of your file uploads and processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((file) => {
                const FileIcon = getFileIcon(file.type);
                const StatusIcon = getStatusIcon(file.status);
                
                return (
                  <div key={file.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <FileIcon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{file.type}</Badge>
                          <StatusIcon className={`h-4 w-4 ${
                            file.status === 'completed' ? 'text-green-500' : 
                            file.status === 'error' ? 'text-red-500' : 
                            'text-yellow-500'
                          }`} />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={file.progress} className="flex-1" />
                        <span className="text-xs text-muted-foreground w-12">
                          {Math.round(file.progress)}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • Status: {file.status}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Supported File Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { type: "CSV", description: "Comma-separated values", icon: FileText },
              { type: "Excel", description: "Spreadsheet files (.xlsx, .xls)", icon: FileSpreadsheet },
              { type: "PDF", description: "Scanned documents with OCR", icon: File },
              { type: "JSON", description: "Structured data files", icon: FileText }
            ].map((format) => (
              <div key={format.type} className="flex items-center space-x-3 p-3 border rounded-lg">
                <format.icon className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">{format.type}</p>
                  <p className="text-xs text-muted-foreground">{format.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploadZone;

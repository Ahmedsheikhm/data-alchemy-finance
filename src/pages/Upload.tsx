import { useState } from "react";
import { Link } from "react-router-dom";
import { Brain, Settings, BarChart3, Database, Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileUploadZone from "@/components/FileUploadZone";
import { dataStore } from "@/lib/dataStore";

const Upload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const handleFilesUploaded = (files: any[]) => {
    setUploadedFiles(files);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Data Alchemy Finance</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Financial Data Cleaning Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  {dataStore.getCurrentSession()?.name.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 py-4 px-2 border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300 text-sm font-medium"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/upload"
              className="flex items-center space-x-2 py-4 px-2 border-b-2 border-primary text-primary text-sm font-medium"
            >
              <UploadIcon className="h-4 w-4" />
              <span>Upload Files</span>
            </Link>
            <Link
              to="/results"
              className="flex items-center space-x-2 py-4 px-2 border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300 text-sm font-medium"
            >
              <Database className="h-4 w-4" />
              <span>Results</span>
            </Link>
            <Link
              to="/feedback"
              className="flex items-center space-x-2 py-4 px-2 border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300 text-sm font-medium"
            >
              <Brain className="h-4 w-4" />
              <span>Feedback</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <FileUploadZone onFilesUploaded={handleFilesUploaded} />
      </main>
    </div>
  );
};

export default Upload;
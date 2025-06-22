import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, FileText, BarChart3, Settings, Download, Eye, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiClient, type Project, type ProcessedFile } from "@/lib/api";
import { dataStore } from "@/lib/dataStore";
import FileUploadZone from "@/components/FileUploadZone";
import DataViewer from "@/components/DataViewer";
import AgentMonitor from "@/components/AgentMonitor";
import ProcessingQueue from "@/components/ProcessingQueue";

const ProjectDashboard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [stats, setStats] = useState({ totalFiles: 0, cleanedRecords: 0, avgAccuracy: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const { toast } = useToast();

  const currentSession = dataStore.getCurrentSession();

  useEffect(() => {
    if (!currentSession) {
      navigate('/login');
      return;
    }

    if (!projectId) {
      navigate('/projects');
      return;
    }

    loadProjectData();
  }, [projectId, currentSession, navigate]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      
      // Load project details
      const projectData = await apiClient.getProject(projectId!);
      setProject(projectData);
      
      // Load project files
      const projectFiles = await apiClient.getProjectFiles(projectId!);
      setFiles(projectFiles);
      
      // Load project stats
      const projectStats = await apiClient.getStats(currentSession?.id, projectId);
      setStats(projectStats);
      
    } catch (error) {
      console.error('Failed to load project data:', error);
      toast({
        title: "Error",
        description: "Failed to load project data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilesUploaded = async (newFiles: ProcessedFile[]) => {
    try {
      // Add project ID to uploaded files and save them
      const updatedFiles = newFiles.map(file => ({
        ...file,
        projectId: projectId!,
        userId: currentSession?.id || 1
      }));
      
      // Save each file to the database with project association
      for (const file of updatedFiles) {
        try {
          await dataStore.saveFile(file);
        } catch (error) {
          console.error('Failed to save file:', error);
        }
      }
      
      setFiles(prev => [...prev, ...updatedFiles]);
      await loadProjectData(); // Refresh data
      
      toast({
        title: "Files uploaded successfully",
        description: `${updatedFiles.length} file(s) have been added to the project.`,
      });
    } catch (error) {
      console.error('Failed to process uploaded files:', error);
      toast({
        title: "Upload failed",
        description: "Failed to process uploaded files. Please try again.",
        variant: "destructive"
      });
    }
  };

  const agents = [
    { name: "Parser Agent", status: "active", task: "Processing CSV headers", progress: 80 },
    { name: "Cleaner Agent", status: "active", task: "Normalizing addresses", progress: 65 },
    { name: "Labeler Agent", status: "idle", task: "Ready for next batch", progress: 0 },
    { name: "Reviewer Agent", status: "active", task: "Flagging anomalies", progress: 90 },
    { name: "Trainer Agent", status: "training", task: "Fine-tuning model", progress: 45 },
    { name: "Supervisor Agent", status: "monitoring", task: "Overseeing workflow", progress: 100 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Project Not Found</h3>
          <p className="text-muted-foreground mb-4">The requested project could not be found.</p>
          <Link to="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/projects">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Projects
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <p className="text-sm text-muted-foreground">{project.description || 'Project dashboard'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{files.length} files</Badge>
              <Badge variant="outline">{stats.cleanedRecords} records</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="data">Data Viewer</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
            <TabsTrigger value="queue">Processing Queue</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalFiles}</div>
                  <p className="text-xs text-muted-foreground">Files in project</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cleaned Records</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.cleanedRecords.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Records processed</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgAccuracy.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Average accuracy</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Files */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Files</CardTitle>
                <CardDescription>Latest files uploaded to this project</CardDescription>
              </CardHeader>
              <CardContent>
                {files.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Files Yet</h3>
                    <p className="text-muted-foreground mb-4">Upload your first file to get started with data processing.</p>
                    <Button onClick={() => setActiveTab('upload')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {files.slice(0, 5).map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">{file.type} • {new Date(file.uploadTime).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={file.status === 'completed' ? 'default' : file.status === 'processing' ? 'secondary' : 'outline'}>
                            {file.status}
                          </Badge>
                          {file.status === 'completed' && (
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {files.length > 5 && (
                      <div className="text-center">
                        <Button variant="outline" onClick={() => setActiveTab('data')}>
                          View All Files
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Files to {project.name}</CardTitle>
                <CardDescription>
                  Upload CSV, Excel, or PDF files for AI-powered cleaning and processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploadZone onFilesUploaded={handleFilesUploaded} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <DataViewer />
          </TabsContent>

          <TabsContent value="agents">
            <AgentMonitor agents={agents} />
          </TabsContent>

          <TabsContent value="queue">
            <ProcessingQueue files={files.filter(f => f.status === 'processing' || f.status === 'uploading')} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProjectDashboard;
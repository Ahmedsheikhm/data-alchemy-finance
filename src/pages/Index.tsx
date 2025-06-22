import { useState } from "react";
import { Upload, Database, Brain, BarChart3, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import FileUploadZone from "@/components/FileUploadZone";
import DataViewer from "@/components/DataViewer";
import AgentMonitor from "@/components/AgentMonitor";
import ProcessingQueue from "@/components/ProcessingQueue";
import { Link } from "react-router-dom";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [uploadedFiles, setUploadedFiles] = useState([
    { id: 1, name: "bank_statements_q3.csv", status: "completed", progress: 100, type: "CSV" },
    { id: 2, name: "loan_applications.xlsx", status: "processing", progress: 67, type: "Excel" },
    { id: 3, name: "credit_reports.pdf", status: "queued", progress: 0, type: "PDF" }
  ]);

  const stats = {
    totalFiles: 156,
    cleanedRecords: 45231,
    accuracyRate: 97.3,
    activeAgents: 6
  };

  const agents = [
    { name: "Parser Agent", status: "active", task: "Processing CSV headers", progress: 80 },
    { name: "Cleaner Agent", status: "active", task: "Normalizing addresses", progress: 65 },
    { name: "Labeler Agent", status: "idle", task: "Ready for next batch", progress: 0 },
    { name: "Reviewer Agent", status: "active", task: "Flagging anomalies", progress: 90 },
    { name: "Trainer Agent", status: "training", task: "Fine-tuning model", progress: 45 },
    { name: "Supervisor Agent", status: "monitoring", task: "Overseeing workflow", progress: 100 }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalFiles}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cleaned Records</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.cleanedRecords.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+8.2% from last week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.accuracyRate}%</div>
                  <p className="text-xs text-muted-foreground">Target: 95%+</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeAgents}</div>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Files</CardTitle>
                  <CardDescription>Latest uploaded files and their processing status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {uploadedFiles.slice(0, 3).map((file) => (
                      <div key={file.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">{file.type}</Badge>
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">Status: {file.status}</p>
                          </div>
                        </div>
                        <Progress value={file.progress} className="w-20" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Agent Status</CardTitle>
                  <CardDescription>Current activity of your AI processing agents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {agents.slice(0, 3).map((agent, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{agent.task}</p>
                        </div>
                        <Badge variant={agent.status === 'active' ? 'default' : agent.status === 'idle' ? 'secondary' : 'outline'}>
                          {agent.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case "upload":
        return <FileUploadZone onFilesUploaded={setUploadedFiles} />;
      case "data":
        return <DataViewer />;
      case "agents":
        return <AgentMonitor agents={agents} />;
      case "processing":
        return <ProcessingQueue files={uploadedFiles} />;
      default:
        return null;
    }
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
              <Button asChild variant="outline" size="sm">
                <Link to="/login">
                  Login
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/dashboard">
                  Dashboard
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">JD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "upload", label: "Upload Files", icon: Upload },
              { id: "data", label: "Data Viewer", icon: Database },
              { id: "agents", label: "AI Agents", icon: Brain },
              { id: "processing", label: "Processing Queue", icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default Index;

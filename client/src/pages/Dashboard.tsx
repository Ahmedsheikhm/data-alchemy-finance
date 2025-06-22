import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, Database, Brain, BarChart3, Settings, Users, FileText, TrendingUp, LogOut, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import { dataStore } from "@/lib/dataStore";
import { aiAgentSystem } from "@/lib/aiAgents";

const Dashboard = () => {

  const [stats, setStats] = useState({
    totalFiles: 0,
    cleanedRecords: 0,
    accuracyRate: 0,
    activeAgents: 0
  });
  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load data from store
        const storeStats = await dataStore.getStats();
        setStats({
          totalFiles: storeStats.totalFiles,
          cleanedRecords: storeStats.cleanedRecords,
          accuracyRate: storeStats.avgAccuracy,
          activeAgents: 6
        });

        // Load recent files
        const files = await dataStore.getAllFiles();
        setRecentFiles(files.slice(0, 3).map(file => ({
          id: file.id,
          name: file.name,
          status: file.status,
          progress: file.progress,
          type: file.type
        })));

        // Load agent statuses
        setAgents(aiAgentSystem.getAgentStatuses().slice(0, 3));

        // Update activity
        dataStore.updateLastActivity();
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadData();
  }, []);

  const handleLogout = () => {
    dataStore.logout();
    navigate('/login');
  };

  const currentSession = dataStore.getCurrentSession();

  if (!currentSession) {
    navigate('/login');
    return null;
  }

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
              <Link to="/settings">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">
                    {currentSession.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium">{currentSession.name}</span>
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
              className="flex items-center space-x-2 py-4 px-2 border-b-2 border-primary text-primary text-sm font-medium"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/projects"
              className="flex items-center space-x-2 py-4 px-2 border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300 text-sm font-medium"
            >
              <FolderOpen className="h-4 w-4" />
              <span>Projects</span>
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
                <p className="text-xs text-muted-foreground">Files processed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cleaned Records</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.cleanedRecords.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Records cleaned</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.accuracyRate}%</div>
                <p className="text-xs text-muted-foreground">Average accuracy</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeAgents}</div>
                <p className="text-xs text-muted-foreground">AI agents running</p>
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
                  {recentFiles.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No files uploaded yet. Start by uploading your first file.
                    </p>
                  ) : (
                    recentFiles.map((file) => (
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
                    ))
                  )}
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
                  {agents.map((agent, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.task}</p>
                      </div>
                      <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                        {agent.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild className="h-auto p-4 flex-col space-y-2">
                  <Link to="/upload">
                    <Upload className="h-6 w-6" />
                    <span>Upload New Files</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
                  <Link to="/results">
                    <FileText className="h-6 w-6" />
                    <span>View Results</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
                  <Link to="/feedback">
                    <TrendingUp className="h-6 w-6" />
                    <span>Training Feedback</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>


    </div>
  );
};

export default Dashboard;
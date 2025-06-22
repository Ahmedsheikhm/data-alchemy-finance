
import { useState } from "react";
import { Link } from "react-router-dom";
import { Upload, Database, Brain, BarChart3, Settings, Users, FileText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const stats = {
    totalFiles: 156,
    cleanedRecords: 45231,
    accuracyRate: 97.3,
    activeAgents: 6
  };

  const recentFiles = [
    { id: 1, name: "bank_statements_q3.csv", status: "completed", progress: 100, type: "CSV" },
    { id: 2, name: "loan_applications.xlsx", status: "processing", progress: 67, type: "Excel" },
    { id: 3, name: "credit_reports.pdf", status: "queued", progress: 0, type: "PDF" }
  ];

  const agents = [
    { name: "Parser Agent", status: "active", task: "Processing CSV headers" },
    { name: "Cleaner Agent", status: "active", task: "Normalizing addresses" },
    { name: "Labeler Agent", status: "idle", task: "Ready for next batch" }
  ];

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
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 py-4 px-2 border-b-2 border-primary text-primary text-sm font-medium"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/upload"
              className="flex items-center space-x-2 py-4 px-2 border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300 text-sm font-medium"
            >
              <Upload className="h-4 w-4" />
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
                  {recentFiles.map((file) => (
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

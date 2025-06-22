
import { Clock, CheckCircle, AlertCircle, Play, Pause, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProcessingQueueProps {
  files: any[];
}

const ProcessingQueue = ({ files }: ProcessingQueueProps) => {
  const processingSteps = [
    { name: "File Parsing", agent: "Parser Agent", status: "completed" },
    { name: "Data Cleaning", agent: "Cleaner Agent", status: "active" },
    { name: "Labeling", agent: "Labeler Agent", status: "queued" },
    { name: "Review", agent: "Reviewer Agent", status: "queued" },
    { name: "Validation", agent: "Supervisor Agent", status: "queued" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle;
      case "processing": case "active": return Clock;
      case "queued": return Clock;
      case "error": return AlertCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "processing": case "active": return "text-blue-600";
      case "queued": return "text-gray-600";
      case "error": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Processing Queue</CardTitle>
          <CardDescription>
            Monitor the processing pipeline and manage queued files
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Processing Pipeline</CardTitle>
            <CardDescription>File: loan_applications.xlsx</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processingSteps.map((step, index) => {
                const StatusIcon = getStatusIcon(step.status);
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`flex-shrink-0 ${getStatusColor(step.status)}`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{step.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {step.agent}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">{step.status}</p>
                    </div>
                    {step.status === "active" && (
                      <div className="flex-shrink-0 w-20">
                        <Progress value={67} className="h-2" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue Management</CardTitle>
            <CardDescription>Control processing flow and priorities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button size="sm" className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Restart
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Processing Speed</span>
                  <span className="text-sm text-muted-foreground">2,840 records/min</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm text-muted-foreground">68%</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">CPU Usage</span>
                  <span className="text-sm text-muted-foreground">42%</span>
                </div>
                <Progress value={42} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>File Queue</CardTitle>
          <CardDescription>All files in the processing queue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {files.map((file) => {
              const StatusIcon = getStatusIcon(file.status);
              return (
                <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <StatusIcon className={`h-5 w-5 ${getStatusColor(file.status)}`} />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Type: {file.type} • Status: {file.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{file.progress}%</p>
                      <Progress value={file.progress} className="w-20 h-2" />
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        Priority
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessingQueue;

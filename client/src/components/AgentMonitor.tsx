
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Activity, Brain, Cpu, Zap, TrendingUp, Shield, Settings, Pause, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { aiAgentSystem } from "@/lib/aiAgents";

interface Agent {
  name: string;
  status: string;
  task: string;
  progress: number;
  performance?: {
    accuracy: number;
    speed: string;
  };
}

interface AgentMonitorProps {
  agents?: Agent[];
}

const AgentMonitor = ({ agents: propAgents }: AgentMonitorProps) => {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    if (propAgents) {
      setAgents(propAgents);
    } else {
      // Load agents from API
      const loadAgents = async () => {
        try {
          const response = await fetch('/api/agents');
          if (response.ok) {
            const data = await response.json();
            setAgents(data.agents.map((agent: any) => ({
              name: agent.name,
              status: agent.status,
              task: agent.task,
              progress: agent.progress,
              performance: agent.metrics ? {
                accuracy: agent.metrics.accuracy,
                speed: agent.metrics.speed
              } : undefined
            })));
          }
        } catch (error) {
          console.error('Failed to load agents:', error);
          // Fallback to mock data
          setAgents([
            { name: "Parser Agent", status: "active", task: "Processing CSV headers", progress: 80 },
            { name: "Cleaner Agent", status: "active", task: "Normalizing addresses", progress: 65 },
            { name: "Labeler Agent", status: "idle", task: "Ready for next batch", progress: 0 },
            { name: "Reviewer Agent", status: "active", task: "Flagging anomalies", progress: 90 },
            { name: "Trainer Agent", status: "training", task: "Fine-tuning model", progress: 45 },
            { name: "Supervisor Agent", status: "monitoring", task: "Overseeing workflow", progress: 100 }
          ]);
        }
      };

      loadAgents();
      const interval = setInterval(loadAgents, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [propAgents]);
  const getAgentIcon = (name: string) => {
    switch (name) {
      case "Parser Agent": return Brain;
      case "Cleaner Agent": return Zap;
      case "Labeler Agent": return TrendingUp;
      case "Reviewer Agent": return Shield;
      case "Trainer Agent": return Cpu;
      case "Supervisor Agent": return Activity;
      default: return Brain;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "idle": return "bg-gray-100 text-gray-800";
      case "training": return "bg-blue-100 text-blue-800";
      case "monitoring": return "bg-purple-100 text-purple-800";
      case "error": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const agentDetails = {
    "Parser Agent": {
      description: "Handles file structure parsing using format-specific logic",
      capabilities: ["CSV delimiter detection", "PDF text block extraction", "Excel sheet parsing"],
      performance: { accuracy: 99.2, speed: "1.2k rows/sec" }
    },
    "Cleaner Agent": {
      description: "Normalizes fields and applies business rules",
      capabilities: ["Address standardization", "Phone number formatting", "Duplicate detection"],
      performance: { accuracy: 97.8, speed: "850 rows/sec" }
    },
    "Labeler Agent": {
      description: "Uses ML to assign categories and tags to data entries",
      capabilities: ["Transaction classification", "Industry tagging", "Risk assessment"],
      performance: { accuracy: 94.5, speed: "2.1k rows/sec" }
    },
    "Reviewer Agent": {
      description: "Flags ambiguities and recommends manual review",
      capabilities: ["Anomaly detection", "Confidence scoring", "Quality assessment"],
      performance: { accuracy: 96.3, speed: "3.5k rows/sec" }
    },
    "Trainer Agent": {
      description: "Monitors feedback and continuously fine-tunes models",
      capabilities: ["Model fine-tuning", "Performance optimization", "Feedback processing"],
      performance: { accuracy: 98.7, speed: "Model updates/hour: 4" }
    },
    "Supervisor Agent": {
      description: "Oversees task routing and validates inter-agent communication",
      capabilities: ["Workflow orchestration", "Exception handling", "Resource allocation"],
      performance: { accuracy: 99.8, speed: "Tasks routed/sec: 156" }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Agent Monitoring</CardTitle>
          <CardDescription>
            Real-time status and performance monitoring of your AI processing agents
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agents.map((agent, index) => {
          const AgentIcon = getAgentIcon(agent.name);
          const details = agentDetails[agent.name as keyof typeof agentDetails];
          
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <AgentIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <CardDescription>{details?.description}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(agent.status)}>
                    {agent.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Current Task</span>
                    <span className="text-sm text-muted-foreground">{agent.progress}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{agent.task}</p>
                  <Progress value={agent.progress} className="h-2" />
                </div>

                {details && (
                  <>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Capabilities</h4>
                      <div className="flex flex-wrap gap-1">
                        {details.capabilities.map((capability, capIndex) => (
                          <Badge key={capIndex} variant="outline" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Accuracy</p>
                        <p className="text-sm font-medium">{details.performance.accuracy}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Speed</p>
                        <p className="text-sm font-medium">{details.performance.speed}</p>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex space-x-2 pt-2">
                  <Link to={`/agents/${agent.name.toLowerCase().replace(' agent', '').replace(' ', '_')}/logs`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Logs
                    </Button>
                  </Link>
                  <Link to={`/agents/${agent.name.toLowerCase().replace(' agent', '').replace(' ', '_')}/config`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Configure
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">99.2%</div>
              <p className="text-sm text-muted-foreground">Overall Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">2.8k</div>
              <p className="text-sm text-muted-foreground">Records/minute</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">97.3%</div>
              <p className="text-sm text-muted-foreground">Avg Accuracy</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">1.2s</div>
              <p className="text-sm text-muted-foreground">Avg Response</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentMonitor;

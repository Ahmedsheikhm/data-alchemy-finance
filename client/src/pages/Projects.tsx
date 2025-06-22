import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, FolderOpen, Settings, Calendar, Users, FileText, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { dataStore } from "@/lib/dataStore";
import { apiClient, type Project } from "@/lib/api";

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const currentSession = dataStore.getCurrentSession();

  useEffect(() => {
    if (!currentSession) {
      navigate('/login');
      return;
    }

    const loadProjects = async () => {
      try {
        const userProjects = await apiClient.getProjects(currentSession.id);
        setProjects(userProjects);
      } catch (error) {
        console.error('Failed to load projects:', error);
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive"
        });
      }
    };

    loadProjects();
  }, [currentSession, navigate, toast]);

  const handleCreateProject = async () => {
    if (!currentSession || !newProjectName.trim()) return;

    setLoading(true);
    try {
      const project = await apiClient.createProject({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        userId: currentSession.id,
        name: newProjectName.trim(),
        description: newProjectDescription.trim() || undefined,
      });

      setProjects(prev => [project, ...prev]);
      setIsCreateDialogOpen(false);
      setNewProjectName("");
      setNewProjectDescription("");
      
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    } catch (error) {
      console.error('Failed to create project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await apiClient.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive"
      });
    }
  };

  if (!currentSession) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FolderOpen className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Project Management</h1>
                <p className="text-sm text-muted-foreground">Organize your data cleaning projects</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Create a new project to organize and manage your data cleaning workflows.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="projectName">Project Name</Label>
                      <Input
                        id="projectName"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="Enter project name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="projectDescription">Description (Optional)</Label>
                      <Textarea
                        id="projectDescription"
                        value={newProjectDescription}
                        onChange={(e) => setNewProjectDescription(e.target.value)}
                        placeholder="Describe what this project is for..."
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateProject}
                        disabled={loading || !newProjectName.trim()}
                      >
                        {loading ? "Creating..." : "Create Project"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Link to="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first project to start organizing your data cleaning workflows.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      {project.description && (
                        <CardDescription className="mt-2">
                          {project.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement edit functionality
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <Link to={`/projects/${project.id}/dashboard`} className="flex-1">
                        <Button className="w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          Open Project
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects;
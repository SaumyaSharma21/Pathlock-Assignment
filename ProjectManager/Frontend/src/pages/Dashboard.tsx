import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LogOut, Plus, Trash2 } from "lucide-react";
import { ProjectsAPI, AuthAPI } from "@/lib/api";

interface Project {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await ProjectsAPI.getAllProjects();
      setProjects(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate project title (3-100 characters, required)
    if (!newProjectTitle.trim()) {
      toast.error("Please enter a project title");
      return;
    }
    if (newProjectTitle.trim().length < 3) {
      toast.error("Project title must be at least 3 characters long");
      return;
    }
    if (newProjectTitle.trim().length > 100) {
      toast.error("Project title cannot exceed 100 characters");
      return;
    }
    
    // Validate description (optional, up to 500 characters)
    if (newProjectDescription && newProjectDescription.length > 500) {
      toast.error("Project description cannot exceed 500 characters");
      return;
    }
    
    try {
      await ProjectsAPI.createProject({
        title: newProjectTitle,
        description: newProjectDescription || ""
      });
      toast.success("Project created successfully!");
      setNewProjectTitle("");
      setNewProjectDescription("");
      setDialogOpen(false);
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message || "Failed to create project");
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await ProjectsAPI.deleteProject(id);
      toast.success("Project deleted successfully!");
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message || "Failed to delete project");
    }
  };

  const handleLogout = async () => {
    AuthAPI.logout();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pathlock-primary/5 to-pathlock-secondary/10">
      <header className="bg-gradient-to-r from-white/95 via-pathlock-primary/5 to-white/95 backdrop-blur-md border-b border-pathlock-primary/20 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pathlock-primary to-pathlock-secondary flex items-center justify-center shadow-md">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pathlock-primary to-pathlock-secondary bg-clip-text text-transparent">My Projects</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="border-2 hover:bg-red-50 transition-colors border-red-600 text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="bg-gradient-to-r from-pathlock-primary/12 to-pathlock-secondary/12 rounded-xl px-4 py-3 shadow-sm border border-pathlock-primary/30">
            <p className="text-pathlock-primary font-medium">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="text-white bg-pathlock-accent hover:bg-pathlock-accentLight shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-white via-slate-50/50 to-pathlock-primary/5 border-pathlock-primary/20">
              <DialogHeader className="border-b border-pathlock-primary/20 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pathlock-primary to-pathlock-secondary flex items-center justify-center shadow-sm">
                    <Plus className="h-3 w-3 text-white" />
                  </div>
                  <DialogTitle className="bg-gradient-to-r from-pathlock-primary to-pathlock-secondary bg-clip-text text-transparent">Create New Project</DialogTitle>
                </div>
                <DialogDescription className="text-pathlock-primary/80">
                  Add a new project to track your tasks
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-6 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="title" className="text-pathlock-primary font-medium">Project Title</Label>
                    <span className={`text-xs ${
                      newProjectTitle.length < 3 
                        ? 'text-red-500' 
                        : newProjectTitle.length > 100 
                        ? 'text-red-500' 
                        : 'text-pathlock-primary/60'
                    }`}>
                      {newProjectTitle.length}/100
                    </span>
                  </div>
                  <Input
                    id="title"
                    placeholder="My awesome project"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    required
                    maxLength={100}
                    className={`border-pathlock-primary/30 focus:border-pathlock-primary focus:ring-pathlock-primary/20 bg-white/80 ${
                      newProjectTitle.length > 0 && newProjectTitle.length < 3 
                        ? 'border-red-300 focus:border-red-500' 
                        : newProjectTitle.length > 100 
                        ? 'border-red-300 focus:border-red-500' 
                        : ''
                    }`}
                  />
                  {newProjectTitle.length > 0 && newProjectTitle.length < 3 && (
                    <p className="text-xs text-red-500">Title must be at least 3 characters</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="description" className="text-pathlock-primary font-medium">Description (optional)</Label>
                    <span className={`text-xs ${
                      newProjectDescription.length > 500 
                        ? 'text-red-500' 
                        : 'text-pathlock-primary/60'
                    }`}>
                      {newProjectDescription.length}/500
                    </span>
                  </div>
                  <Textarea
                    id="description"
                    placeholder="What is this project about?"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className={`border-pathlock-primary/30 focus:border-pathlock-primary focus:ring-2 focus:ring-pathlock-primary/20 bg-white/80 transition-colors ${
                      newProjectDescription.length > 500 
                        ? 'border-red-300 focus:border-red-500' 
                        : ''
                    }`}
                  />
                  {newProjectDescription.length > 500 && (
                    <p className="text-xs text-red-500">Description cannot exceed 500 characters</p>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-pathlock-primary/20">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    className="border-pathlock-primary/30 text-pathlock-primary hover:bg-pathlock-primary/5 hover:text-pathlock-primary/80 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-pathlock-accent hover:bg-pathlock-accentLight text-white shadow-sm hover:shadow-md transition-all transform hover:scale-[1.02]"
                  >
                    Create Project
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {projects.length === 0 ? (
          <Card className="text-center py-12 bg-gradient-to-br from-white/95 via-pathlock-primary/5 to-pathlock-secondary/5 border-pathlock-primary/20">
            <CardHeader>
              <CardTitle className="text-pathlock-primary">No projects yet</CardTitle>
              <CardDescription className="text-pathlock-primary/80">Create your first project to get started</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer transition-all hover:shadow-md bg-gradient-to-br from-white/95 via-pathlock-primary/5 to-pathlock-secondary/5 border-pathlock-primary/20 hover:border-pathlock-primary/40 hover:shadow-pathlock-primary/10"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      {project.description && (
                        <CardDescription className="mt-2">
                          {project.description}
                        </CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

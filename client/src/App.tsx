
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Upload from "./pages/Upload";
import ResultsViewer from "./pages/ResultsViewer";
import Feedback from "./pages/Feedback";
import AgentLogs from "./pages/AgentLogs";
import AgentConfig from "./pages/AgentConfig";
import Settings from "./pages/Settings";
import ProjectDashboard from "./pages/ProjectDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/results" element={<ResultsViewer />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/agents/:agentName/logs" element={<AgentLogs />} />
          <Route path="/agents/:agentName/config" element={<AgentConfig />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/projects/:projectId/dashboard" element={<ProjectDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import React, { useState } from 'react';
import { Settings, User, Database, Brain, Shield, Download, Trash2, LogOut, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { dataStore } from '@/lib/dataStore';

interface SettingsPanelProps {
  onClose: () => void;
  onLogout: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose, onLogout }) => {
  const [settings, setSettings] = useState({
    autoClean: true,
    confidenceThreshold: 85,
    enableNotifications: true,
    saveHistory: true,
    autoBackup: false
  });
  
  const { toast } = useToast();
  const currentSession = dataStore.getCurrentSession();
  const sessionHistory = dataStore.getSessionHistory();
  const stats = dataStore.getStats();

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Setting updated",
      description: `${key} has been updated successfully.`,
    });
  };

  const handleExportData = () => {
    const allFiles = dataStore.getAllFiles();
    const exportData = {
      files: allFiles,
      feedback: dataStore.getFeedback(),
      stats: stats,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-alchemy-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data exported",
      description: "Your data has been exported successfully.",
    });
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      dataStore.clearAll();
      toast({
        title: "Data cleared",
        description: "All data has been cleared from the system.",
        variant: "destructive"
      });
      onLogout();
    }
  };

  const handleLogout = () => {
    dataStore.logout();
    onLogout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="h-6 w-6" />
              <CardTitle>Settings</CardTitle>
            </div>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
          <CardDescription>
            Manage your account settings and system preferences
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="ai">AI Settings</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Processing Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-clean data</Label>
                      <p className="text-sm text-muted-foreground">Automatically apply AI cleaning to uploaded files</p>
                    </div>
                    <Switch 
                      checked={settings.autoClean}
                      onCheckedChange={(checked) => handleSettingChange('autoClean', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Confidence Threshold: {settings.confidenceThreshold}%</Label>
                    <Input
                      type="range"
                      min="50"
                      max="100"
                      value={settings.confidenceThreshold}
                      onChange={(e) => handleSettingChange('confidenceThreshold', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      Minimum confidence level for automatic data cleaning
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified when processing is complete</p>
                    </div>
                    <Switch 
                      checked={settings.enableNotifications}
                      onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Model Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Model Version</Label>
                      <Input value="v2.1.3" disabled />
                    </div>
                    <div>
                      <Label>Training Status</Label>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Save training history</Label>
                      <p className="text-sm text-muted-foreground">Keep records of model improvements</p>
                    </div>
                    <Switch 
                      checked={settings.saveHistory}
                      onCheckedChange={(checked) => handleSettingChange('saveHistory', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-backup models</Label>
                      <p className="text-sm text-muted-foreground">Automatically backup trained models</p>
                    </div>
                    <Switch 
                      checked={settings.autoBackup}
                      onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Database className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="font-medium">{stats.totalFiles}</p>
                      <p className="text-sm text-muted-foreground">Total Files</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Brain className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="font-medium">{stats.totalRecords.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Records Processed</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Button onClick={handleExportData} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export All Data
                    </Button>
                    <Button variant="destructive" onClick={handleClearData} className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentSession && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{currentSession.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{currentSession.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Logged in: {currentSession.loginTime.toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <History className="h-4 w-4" />
                      <Label>Session History</Label>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {sessionHistory.slice(0, 5).map((session) => (
                        <div key={session.id} className="text-sm p-2 border rounded">
                          <p className="font-medium">{session.email}</p>
                          <p className="text-muted-foreground">
                            {session.loginTime.toLocaleDateString()} at {session.loginTime.toLocaleTimeString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <Button variant="destructive" onClick={handleLogout} className="w-full">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;
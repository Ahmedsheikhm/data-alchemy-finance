import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Bell, Shield, Database, Cpu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { dataStore } from "@/lib/dataStore";

interface DashboardSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    browser: boolean;
    processingComplete: boolean;
    errorAlerts: boolean;
  };
  privacy: {
    analytics: boolean;
    crashReporting: boolean;
    dataSharingOptOut: boolean;
  };
  performance: {
    autoRefreshInterval: number;
    maxConcurrentTasks: number;
    cacheEnabled: boolean;
  };
  dataRetention: {
    logRetentionDays: number;
    fileRetentionDays: number;
    autoCleanup: boolean;
  };
}

const Settings = () => {
  const [settings, setSettings] = useState<DashboardSettings>({
    theme: 'system',
    notifications: {
      email: true,
      browser: true,
      processingComplete: true,
      errorAlerts: true
    },
    privacy: {
      analytics: false,
      crashReporting: true,
      dataSharingOptOut: false
    },
    performance: {
      autoRefreshInterval: 5,
      maxConcurrentTasks: 5,
      cacheEnabled: true
    },
    dataRetention: {
      logRetentionDays: 30,
      fileRetentionDays: 90,
      autoCleanup: true
    }
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const currentSession = dataStore.getCurrentSession();

  useEffect(() => {
    if (!currentSession) {
      navigate('/login');
      return;
    }
    loadSettings();
  }, [currentSession, navigate]);

  const loadSettings = () => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('dashboardSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('dashboardSettings', JSON.stringify(settings));
      
      // Apply theme changes
      if (settings.theme !== 'system') {
        document.documentElement.classList.toggle('dark', settings.theme === 'dark');
      } else {
        // Apply system preference
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', systemDark);
      }

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const keys = path.split('.');
      const newSettings = { ...prev };
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
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
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Dashboard Settings</h1>
                <p className="text-sm text-muted-foreground">Customize your Data Alchemy Finance experience</p>
              </div>
            </div>
            <Button onClick={saveSettings} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about important events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => updateSetting('notifications.email', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="browser-notifications">Browser Notifications</Label>
                    <p className="text-sm text-muted-foreground">Show desktop notifications</p>
                  </div>
                  <Switch
                    id="browser-notifications"
                    checked={settings.notifications.browser}
                    onCheckedChange={(checked) => updateSetting('notifications.browser', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="processing-complete">Processing Complete</Label>
                    <p className="text-sm text-muted-foreground">Notify when file processing is complete</p>
                  </div>
                  <Switch
                    id="processing-complete"
                    checked={settings.notifications.processingComplete}
                    onCheckedChange={(checked) => updateSetting('notifications.processingComplete', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="error-alerts">Error Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify when errors occur</p>
                  </div>
                  <Switch
                    id="error-alerts"
                    checked={settings.notifications.errorAlerts}
                    onCheckedChange={(checked) => updateSetting('notifications.errorAlerts', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>
                  Control your data privacy and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics">Usage Analytics</Label>
                    <p className="text-sm text-muted-foreground">Help improve the platform by sharing usage data</p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={settings.privacy.analytics}
                    onCheckedChange={(checked) => updateSetting('privacy.analytics', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="crash-reporting">Crash Reporting</Label>
                    <p className="text-sm text-muted-foreground">Automatically report crashes to help fix issues</p>
                  </div>
                  <Switch
                    id="crash-reporting"
                    checked={settings.privacy.crashReporting}
                    onCheckedChange={(checked) => updateSetting('privacy.crashReporting', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="data-sharing">Data Sharing Opt-out</Label>
                    <p className="text-sm text-muted-foreground">Opt out of all data sharing</p>
                  </div>
                  <Switch
                    id="data-sharing"
                    checked={settings.privacy.dataSharingOptOut}
                    onCheckedChange={(checked) => updateSetting('privacy.dataSharingOptOut', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cpu className="h-5 w-5 mr-2" />
                  Performance Settings
                </CardTitle>
                <CardDescription>
                  Optimize performance based on your system capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="refresh-interval">Auto-refresh Interval</Label>
                  <div className="mt-2">
                    <Slider
                      value={[settings.performance.autoRefreshInterval]}
                      onValueChange={(value) => updateSetting('performance.autoRefreshInterval', value[0])}
                      min={1}
                      max={30}
                      step={1}
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      {settings.performance.autoRefreshInterval} seconds
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="concurrent-tasks">Max Concurrent Tasks</Label>
                  <div className="mt-2">
                    <Slider
                      value={[settings.performance.maxConcurrentTasks]}
                      onValueChange={(value) => updateSetting('performance.maxConcurrentTasks', value[0])}
                      min={1}
                      max={10}
                      step={1}
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      {settings.performance.maxConcurrentTasks} tasks
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cache-enabled">Enable Caching</Label>
                    <p className="text-sm text-muted-foreground">Cache data to improve performance</p>
                  </div>
                  <Switch
                    id="cache-enabled"
                    checked={settings.performance.cacheEnabled}
                    onCheckedChange={(checked) => updateSetting('performance.cacheEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Control how your data is stored and managed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="log-retention">Log Retention Period</Label>
                  <div className="mt-2">
                    <Slider
                      value={[settings.dataRetention.logRetentionDays]}
                      onValueChange={(value) => updateSetting('dataRetention.logRetentionDays', value[0])}
                      min={7}
                      max={365}
                      step={7}
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      {settings.dataRetention.logRetentionDays} days
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="file-retention">File Retention Period</Label>
                  <div className="mt-2">
                    <Slider
                      value={[settings.dataRetention.fileRetentionDays]}
                      onValueChange={(value) => updateSetting('dataRetention.fileRetentionDays', value[0])}
                      min={30}
                      max={730}
                      step={30}
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      {settings.dataRetention.fileRetentionDays} days
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-cleanup">Auto Cleanup</Label>
                    <p className="text-sm text-muted-foreground">Automatically delete old files and logs</p>
                  </div>
                  <Switch
                    id="auto-cleanup"
                    checked={settings.dataRetention.autoCleanup}
                    onCheckedChange={(checked) => updateSetting('dataRetention.autoCleanup', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, RotateCcw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

const AgentConfig = () => {
  const { agentName } = useParams<{ agentName: string }>();
  const [config, setConfig] = useState<any>({});
  const [originalConfig, setOriginalConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfiguration();
  }, [agentName]);

  const loadConfiguration = async () => {
    try {
      const response = await fetch(`/api/agents/${agentName}/config`);
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config.settings || {});
        setOriginalConfig(data.config.settings || {});
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
      toast({
        title: "Error",
        description: "Failed to load agent configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/agents/${agentName}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        setOriginalConfig(config);
        toast({
          title: "Success",
          description: "Configuration saved successfully",
        });
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const resetConfiguration = () => {
    setConfig(originalConfig);
  };

  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);

  const renderParserConfig = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="csvDelimiter">CSV Delimiter</Label>
          <Select value={config.csvDelimiter || 'auto'} onValueChange={(value) => updateConfig('csvDelimiter', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-detect</SelectItem>
              <SelectItem value=",">,</SelectItem>
              <SelectItem value=";">;</SelectItem>
              <SelectItem value="\t">Tab</SelectItem>
              <SelectItem value="|">|</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="autoDetectEncoding"
            checked={config.autoDetectEncoding || false}
            onCheckedChange={(checked) => updateConfig('autoDetectEncoding', checked)}
          />
          <Label htmlFor="autoDetectEncoding">Auto-detect encoding</Label>
        </div>

        <div>
          <Label htmlFor="headerRowIndex">Header Row Index</Label>
          <Input
            id="headerRowIndex"
            type="number"
            value={config.headerRowIndex || 0}
            onChange={(e) => updateConfig('headerRowIndex', parseInt(e.target.value))}
            min="0"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="skipEmptyRows"
            checked={config.skipEmptyRows || false}
            onCheckedChange={(checked) => updateConfig('skipEmptyRows', checked)}
          />
          <Label htmlFor="skipEmptyRows">Skip empty rows</Label>
        </div>

        <div>
          <Label htmlFor="maxRowsToAnalyze">Max Rows to Analyze</Label>
          <div className="mt-2">
            <Slider
              value={[config.maxRowsToAnalyze || 1000]}
              onValueChange={(value) => updateConfig('maxRowsToAnalyze', value[0])}
              min={100}
              max={10000}
              step={100}
            />
            <div className="text-sm text-muted-foreground mt-1">
              {config.maxRowsToAnalyze || 1000} rows
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCleanerConfig = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="normalizeText"
            checked={config.normalizeText || false}
            onCheckedChange={(checked) => updateConfig('normalizeText', checked)}
          />
          <Label htmlFor="normalizeText">Normalize text formatting</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="standardizeCurrency"
            checked={config.standardizeCurrency || false}
            onCheckedChange={(checked) => updateConfig('standardizeCurrency', checked)}
          />
          <Label htmlFor="standardizeCurrency">Standardize currency format</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="validateDates"
            checked={config.validateDates || false}
            onCheckedChange={(checked) => updateConfig('validateDates', checked)}
          />
          <Label htmlFor="validateDates">Validate date formats</Label>
        </div>

        <div>
          <Label htmlFor="fillMissingValues">Missing Value Strategy</Label>
          <Select value={config.fillMissingValues || 'none'} onValueChange={(value) => updateConfig('fillMissingValues', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Don't fill</SelectItem>
              <SelectItem value="mean">Use mean</SelectItem>
              <SelectItem value="median">Use median</SelectItem>
              <SelectItem value="forward">Forward fill</SelectItem>
              <SelectItem value="backward">Backward fill</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="outlierDetection"
            checked={config.outlierDetection || false}
            onCheckedChange={(checked) => updateConfig('outlierDetection', checked)}
          />
          <Label htmlFor="outlierDetection">Enable outlier detection</Label>
        </div>

        {config.outlierDetection && (
          <div>
            <Label htmlFor="outlierThreshold">Outlier Threshold (Z-Score)</Label>
            <div className="mt-2">
              <Slider
                value={[config.outlierThreshold || 2.5]}
                onValueChange={(value) => updateConfig('outlierThreshold', value[0])}
                min={1.0}
                max={5.0}
                step={0.1}
              />
              <div className="text-sm text-muted-foreground mt-1">
                {config.outlierThreshold || 2.5} standard deviations
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderLabelerConfig = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="confidenceThreshold">Confidence Threshold</Label>
          <div className="mt-2">
            <Slider
              value={[config.confidenceThreshold || 0.85]}
              onValueChange={(value) => updateConfig('confidenceThreshold', value[0])}
              min={0.5}
              max={1.0}
              step={0.05}
            />
            <div className="text-sm text-muted-foreground mt-1">
              {((config.confidenceThreshold || 0.85) * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="enableAutoLabeling"
            checked={config.enableAutoLabeling || false}
            onCheckedChange={(checked) => updateConfig('enableAutoLabeling', checked)}
          />
          <Label htmlFor="enableAutoLabeling">Enable automatic labeling</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="useContextualAnalysis"
            checked={config.useContextualAnalysis || false}
            onCheckedChange={(checked) => updateConfig('useContextualAnalysis', checked)}
          />
          <Label htmlFor="useContextualAnalysis">Use contextual analysis</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="ruleBasedLabeling"
            checked={config.ruleBasedLabeling || false}
            onCheckedChange={(checked) => updateConfig('ruleBasedLabeling', checked)}
          />
          <Label htmlFor="ruleBasedLabeling">Enable rule-based labeling</Label>
        </div>
      </div>
    </div>
  );

  const renderReviewerConfig = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="anomalyThreshold">Anomaly Detection Threshold</Label>
          <div className="mt-2">
            <Slider
              value={[config.anomalyThreshold || 0.85]}
              onValueChange={(value) => updateConfig('anomalyThreshold', value[0])}
              min={0.5}
              max={1.0}
              step={0.05}
            />
            <div className="text-sm text-muted-foreground mt-1">
              {((config.anomalyThreshold || 0.85) * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="autoApprove"
            checked={config.autoApprove || false}
            onCheckedChange={(checked) => updateConfig('autoApprove', checked)}
          />
          <Label htmlFor="autoApprove">Auto-approve high confidence records</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="strictMode"
            checked={config.strictMode || false}
            onCheckedChange={(checked) => updateConfig('strictMode', checked)}
          />
          <Label htmlFor="strictMode">Enable strict validation mode</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="flagDuplicates"
            checked={config.flagDuplicates || false}
            onCheckedChange={(checked) => updateConfig('flagDuplicates', checked)}
          />
          <Label htmlFor="flagDuplicates">Flag duplicate records</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="validateBusinessRules"
            checked={config.validateBusinessRules || false}
            onCheckedChange={(checked) => updateConfig('validateBusinessRules', checked)}
          />
          <Label htmlFor="validateBusinessRules">Validate business rules</Label>
        </div>
      </div>
    </div>
  );

  const renderTrainerConfig = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="learningRate">Learning Rate</Label>
          <Input
            id="learningRate"
            type="number"
            value={config.learningRate || 0.001}
            onChange={(e) => updateConfig('learningRate', parseFloat(e.target.value))}
            step="0.0001"
            min="0.0001"
            max="0.1"
          />
        </div>

        <div>
          <Label htmlFor="batchSize">Batch Size</Label>
          <div className="mt-2">
            <Slider
              value={[config.batchSize || 32]}
              onValueChange={(value) => updateConfig('batchSize', value[0])}
              min={8}
              max={128}
              step={8}
            />
            <div className="text-sm text-muted-foreground mt-1">
              {config.batchSize || 32} samples
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="maxEpochs">Maximum Epochs</Label>
          <Input
            id="maxEpochs"
            type="number"
            value={config.maxEpochs || 100}
            onChange={(e) => updateConfig('maxEpochs', parseInt(e.target.value))}
            min="10"
            max="1000"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="enableIncrementalLearning"
            checked={config.enableIncrementalLearning || false}
            onCheckedChange={(checked) => updateConfig('enableIncrementalLearning', checked)}
          />
          <Label htmlFor="enableIncrementalLearning">Enable incremental learning</Label>
        </div>
      </div>
    </div>
  );

  const renderSupervisorConfig = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="maxConcurrentTasks">Max Concurrent Tasks</Label>
          <div className="mt-2">
            <Slider
              value={[config.maxConcurrentTasks || 10]}
              onValueChange={(value) => updateConfig('maxConcurrentTasks', value[0])}
              min={1}
              max={50}
              step={1}
            />
            <div className="text-sm text-muted-foreground mt-1">
              {config.maxConcurrentTasks || 10} tasks
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="taskTimeoutMinutes">Task Timeout (minutes)</Label>
          <Input
            id="taskTimeoutMinutes"
            type="number"
            value={config.taskTimeoutMinutes || 30}
            onChange={(e) => updateConfig('taskTimeoutMinutes', parseInt(e.target.value))}
            min="5"
            max="120"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="autoRetryFailedTasks"
            checked={config.autoRetryFailedTasks || false}
            onCheckedChange={(checked) => updateConfig('autoRetryFailedTasks', checked)}
          />
          <Label htmlFor="autoRetryFailedTasks">Auto-retry failed tasks</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="loadBalancingEnabled"
            checked={config.loadBalancingEnabled || false}
            onCheckedChange={(checked) => updateConfig('loadBalancingEnabled', checked)}
          />
          <Label htmlFor="loadBalancingEnabled">Enable load balancing</Label>
        </div>
      </div>
    </div>
  );

  const renderConfigContent = () => {
    switch (agentName) {
      case 'parser':
        return renderParserConfig();
      case 'cleaner':
        return renderCleanerConfig();
      case 'labeler':
        return renderLabelerConfig();
      case 'reviewer':
        return renderReviewerConfig();
      case 'trainer':
        return renderTrainerConfig();
      case 'supervisor':
        return renderSupervisorConfig();
      default:
        return (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Configuration panel for {agentName} is not yet implemented.</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    );
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
                <h1 className="text-2xl font-bold">{agentName?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Configuration</h1>
                <p className="text-sm text-muted-foreground">Customize agent behavior and settings</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={resetConfiguration} disabled={!hasChanges}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={saveConfiguration} disabled={!hasChanges || saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Agent Settings</CardTitle>
            <CardDescription>
              Configure how the {agentName} agent processes and handles data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderConfigContent()}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AgentConfig;
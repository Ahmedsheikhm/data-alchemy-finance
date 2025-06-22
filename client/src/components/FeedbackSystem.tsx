import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Send, TrendingUp, Brain } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { dataStore, FeedbackEntry } from '@/lib/dataStore';
import { aiAgentSystem } from '@/lib/aiAgents';

interface PredictionSample {
  id: string;
  field: string;
  original: string;
  cleaned: string;
  confidence: number;
  fileId: string;
}

const FeedbackSystem: React.FC = () => {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState("");
  const [accuracy, setAccuracy] = useState("");
  const [predictions, setPredictions] = useState<PredictionSample[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackEntry[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load recent predictions from processed files
    const files = dataStore.getAllFiles().filter(f => f.status === 'completed');
    const samples: PredictionSample[] = [];
    
    files.slice(0, 3).forEach(file => {
      if (file.cleaningResults && file.headers) {
        file.cleaningResults.slice(0, 3).forEach((row, rowIndex) => {
          row.slice(0, 2).forEach((result, colIndex) => {
            if (result.issues.length > 0) {
              samples.push({
                id: `${file.id}-${rowIndex}-${colIndex}`,
                field: file.headers![colIndex],
                original: result.original,
                cleaned: result.cleaned,
                confidence: result.confidence,
                fileId: file.id
              });
            }
          });
        });
      }
    });
    
    setPredictions(samples.slice(0, 6));
    setFeedbackHistory(dataStore.getFeedback().slice(0, 10));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentSession = dataStore.getCurrentSession();
    if (!currentSession) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit feedback.",
        variant: "destructive"
      });
      return;
    }

    // Add general feedback
    dataStore.addFeedback({
      userId: currentSession.id,
      fileId: 'general',
      fieldName: 'general_feedback',
      originalValue: '',
      cleanedValue: '',
      rating: rating as any,
      confidence: accuracy === 'excellent' ? 95 : accuracy === 'good' ? 85 : accuracy === 'fair' ? 75 : 60,
      notes: feedback
    });

    // Trigger model training with feedback data
    const allFeedback = dataStore.getFeedback();
    await aiAgentSystem.trainModel(allFeedback);

    toast({
      title: "Feedback submitted",
      description: "Thank you for your feedback! This will help improve our AI models.",
    });
    
    setFeedback("");
    setRating("");
    setAccuracy("");
    setFeedbackHistory(dataStore.getFeedback().slice(0, 10));
  };

  const handlePredictionFeedback = (predictionId: string, isCorrect: boolean) => {
    const prediction = predictions.find(p => p.id === predictionId);
    if (!prediction) return;

    const currentSession = dataStore.getCurrentSession();
    if (!currentSession) {
      toast({
        title: "Authentication required",
        description: "Please log in to provide feedback.",
        variant: "destructive"
      });
      return;
    }

    dataStore.addFeedback({
      userId: currentSession.id,
      fileId: prediction.fileId,
      fieldName: prediction.field,
      originalValue: prediction.original,
      cleanedValue: prediction.cleaned,
      rating: isCorrect ? 'correct' : 'incorrect',
      confidence: prediction.confidence
    });

    // Remove the prediction from the list
    setPredictions(prev => prev.filter(p => p.id !== predictionId));
    setFeedbackHistory(dataStore.getFeedback().slice(0, 10));

    toast({
      title: isCorrect ? "Marked as correct" : "Marked as incorrect",
      description: "Your feedback has been recorded for model training.",
    });
  };

  const getAccuracyStats = () => {
    const correctFeedback = feedbackHistory.filter(f => f.rating === 'correct').length;
    const totalFeedback = feedbackHistory.length;
    return totalFeedback > 0 ? Math.round((correctFeedback / totalFeedback) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6" />
            <span>Model Training Feedback</span>
          </CardTitle>
          <CardDescription>
            Help us improve our AI models by providing feedback on data cleaning results
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Feedback Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Feedback Provided</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackHistory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getAccuracyStats()}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Training Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="bg-blue-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              Active Learning
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Predictions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Predictions</CardTitle>
            <CardDescription>Rate the accuracy of these AI cleaning results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No predictions available for feedback. Process some files to see AI cleaning results here.
                </p>
              ) : (
                predictions.map((prediction) => (
                  <div key={prediction.id} className="p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{prediction.field}</h4>
                        <span className="text-sm text-muted-foreground">
                          {prediction.confidence}% confidence
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Original:</p>
                          <p className="font-mono bg-gray-100 p-2 rounded">{prediction.original}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cleaned:</p>
                          <p className="font-mono bg-green-100 p-2 rounded">{prediction.cleaned}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePredictionFeedback(prediction.id, true)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Correct
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePredictionFeedback(prediction.id, false)}
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          Incorrect
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* General Feedback Form */}
        <Card>
          <CardHeader>
            <CardTitle>General Feedback</CardTitle>
            <CardDescription>Share your overall experience with the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label>Overall Rating</Label>
                <RadioGroup value={rating} onValueChange={setRating}>
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center space-x-2">
                      <RadioGroupItem value={stars.toString()} id={`rating-${stars}`} />
                      <Label htmlFor={`rating-${stars}`} className="flex items-center space-x-1">
                        {Array.from({ length: stars }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="ml-2">{stars} star{stars !== 1 ? 's' : ''}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Model Accuracy Assessment</Label>
                <RadioGroup value={accuracy} onValueChange={setAccuracy}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excellent" id="accuracy-excellent" />
                    <Label htmlFor="accuracy-excellent">Excellent (95%+ accurate)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="good" id="accuracy-good" />
                    <Label htmlFor="accuracy-good">Good (85-94% accurate)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fair" id="accuracy-fair" />
                    <Label htmlFor="accuracy-fair">Fair (70-84% accurate)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="poor" id="accuracy-poor" />
                    <Label htmlFor="accuracy-poor">Poor (Below 70% accurate)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Additional Comments</Label>
                <Textarea
                  id="feedback"
                  placeholder="Share any specific feedback, suggestions, or issues you've encountered..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Feedback History */}
      {feedbackHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback History</CardTitle>
            <CardDescription>Your recent contributions to model training</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedbackHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{entry.fieldName}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.timestamp.toLocaleDateString()} at {entry.timestamp.toLocaleTimeString()}
                    </p>
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={entry.rating === 'correct' ? 'default' : 'destructive'}>
                      {entry.rating}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{entry.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FeedbackSystem;
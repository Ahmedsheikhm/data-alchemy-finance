
import { useState } from "react";
import { Link } from "react-router-dom";
import { Brain, Settings, BarChart3, Database, Upload, Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

const Feedback = () => {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState("");
  const [accuracy, setAccuracy] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Feedback submitted",
      description: "Thank you for your feedback! This will help improve our AI models.",
    });
    setFeedback("");
    setRating("");
    setAccuracy("");
  };

  const recentPredictions = [
    { id: 1, field: "Customer Name", original: "john.smith@email", cleaned: "John Smith", confidence: 95 },
    { id: 2, field: "Phone Number", original: "(555) 123-4567", cleaned: "+1-555-123-4567", confidence: 98 },
    { id: 3, field: "Address", original: "123 main st", cleaned: "123 Main Street", confidence: 87 },
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
              className="flex items-center space-x-2 py-4 px-2 border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300 text-sm font-medium"
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
              className="flex items-center space-x-2 py-4 px-2 border-b-2 border-primary text-primary text-sm font-medium"
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
          <Card>
            <CardHeader>
              <CardTitle>Model Training Feedback</CardTitle>
              <CardDescription>
                Help us improve our AI models by providing feedback on data cleaning results
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Predictions</CardTitle>
                <CardDescription>Rate the accuracy of these AI cleaning results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPredictions.map((prediction) => (
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
                          <Button size="sm" variant="outline">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Correct
                          </Button>
                          <Button size="sm" variant="outline">
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            Incorrect
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

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
                    Submit Feedback
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Feedback;

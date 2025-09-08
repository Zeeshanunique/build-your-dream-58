import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2, Maximize, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface DemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DemoModal = ({ open, onOpenChange }: DemoModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedDemo, setSelectedDemo] = useState("overview");

  const demoVideos = [
    {
      id: "overview",
      title: "Platform Overview",
      duration: "3:24",
      description: "Get a complete walkthrough of CogniCare's features and capabilities"
    },
    {
      id: "therapist",
      title: "Therapist Dashboard",
      duration: "4:15", 
      description: "Learn how to manage patients, view analytics, and monitor EEG sessions"
    },
    {
      id: "parent",
      title: "Parent Interface",
      duration: "2:48",
      description: "Discover how parents can track progress and support home training"
    },
    {
      id: "child",
      title: "Child Experience",
      duration: "3:52",
      description: "See how children interact with games and cognitive exercises"
    },
    {
      id: "eeg",
      title: "EEG Integration",
      duration: "5:10",
      description: "Understanding real-time neurofeedback and brainwave monitoring"
    }
  ];

  // Simulate video progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const maxTime = parseInt(demoVideos.find(v => v.id === selectedDemo)?.duration.split(':')[0]) * 60 + 
                         parseInt(demoVideos.find(v => v.id === selectedDemo)?.duration.split(':')[1]) || 0;
          return prev < maxTime ? prev + 1 : prev;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedDemo]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentDemo = demoVideos.find(v => v.id === selectedDemo);
  const maxTime = currentDemo ? parseInt(currentDemo.duration.split(':')[0]) * 60 + parseInt(currentDemo.duration.split(':')[1]) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center text-primary">
            🎬 CogniCare Demo Center
          </DialogTitle>
          <DialogDescription>
            Explore our platform through interactive video demonstrations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Selection */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {demoVideos.map((video) => (
              <Button
                key={video.id}
                variant={selectedDemo === video.id ? "default" : "outline"}
                className={`h-auto p-3 text-left ${
                  selectedDemo === video.id 
                    ? "bg-primary text-white" 
                    : "hover:bg-muted"
                }`}
                onClick={() => {
                  setSelectedDemo(video.id);
                  setCurrentTime(0);
                  setIsPlaying(false);
                }}
              >
                <div className="space-y-1">
                  <div className="font-medium text-sm">{video.title}</div>
                  <div className="text-xs opacity-75">{video.duration}</div>
                </div>
              </Button>
            ))}
          </div>

          {/* Mock Video Player */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-therapeutic-green/20 flex items-center justify-center">
              {/* Mock Video Content */}
              <div className="text-center text-white space-y-4">
                <div className="text-6xl mb-4">🎥</div>
                <h3 className="text-2xl font-bold">{currentDemo?.title}</h3>
                <p className="text-lg opacity-90 max-w-md mx-auto">
                  {currentDemo?.description}
                </p>
                {isPlaying && (
                  <div className="text-sm opacity-75 animate-pulse">
                    Demonstration in progress...
                  </div>
                )}
              </div>
              
              {/* Play/Pause Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Button
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 backdrop-blur text-white border-white/20"
                    onClick={() => setIsPlaying(true)}
                  >
                    <Play className="h-6 w-6" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Video Controls */}
          <div className="space-y-3">
            {/* Progress Bar */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-mono text-muted-foreground">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${maxTime > 0 ? (currentTime / maxTime) * 100 : 0}%` }}
                />
              </div>
              <span className="text-sm font-mono text-muted-foreground">
                {currentDemo?.duration}
              </span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="ghost">
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{currentDemo?.duration}</span>
                </Badge>
                <Badge variant="outline">HD Quality</Badge>
              </div>
            </div>
          </div>

          {/* Demo Description */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold mb-2">{currentDemo?.title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentDemo?.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              💡 Tip: Try different user roles after watching the demos
            </div>
            <div className="space-x-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button className="bg-primary hover:bg-primary-dark text-white">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
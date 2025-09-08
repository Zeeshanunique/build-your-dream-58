import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Zap, 
  Play, 
  Pause, 
  Square, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  Brain,
  BarChart3,
  Settings
} from "lucide-react";
import { useEEGData, useAllPatients } from "@/hooks/use-database";
import { toast } from "sonner";

export const EEGMonitor = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("connected");
  const [sessionTime, setSessionTime] = useState(0);
  const [selectedPatientId, setSelectedPatientId] = useState(1); // Default to first patient
  
  // Fetch real data from database
  const { patients } = useAllPatients();
  const { eegData: dbEegData, loading } = useEEGData(selectedPatientId, 3); // Get EEG data for session 3

  const activePatient = patients?.find(p => p.id === selectedPatientId)?.name || "No patient selected";

  // Use real EEG data if available, otherwise use simulated data
  const [eegData, setEegData] = useState({
    alpha: dbEegData?.[0]?.alpha_waves || 45,
    beta: dbEegData?.[0]?.beta_waves || 32,
    theta: dbEegData?.[0]?.theta_waves || 28,
    delta: dbEegData?.[0]?.delta_waves || 15,
    gamma: 8 // Not in DB, use default
  });

  // Update EEG data when database data changes
  useEffect(() => {
    if (dbEegData && dbEegData.length > 0) {
      const latestReading = dbEegData[dbEegData.length - 1];
      setEegData({
        alpha: latestReading.alpha_waves,
        beta: latestReading.beta_waves,
        theta: latestReading.theta_waves,
        delta: latestReading.delta_waves,
        gamma: 8 // Not in DB schema
      });
    }
  }, [dbEegData]);

  // Simulate session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (isRecording) {
        setEegData(prev => ({
          alpha: Math.max(20, Math.min(60, prev.alpha + (Math.random() - 0.5) * 10)),
          beta: Math.max(15, Math.min(50, prev.beta + (Math.random() - 0.5) * 8)),
          theta: Math.max(10, Math.min(45, prev.theta + (Math.random() - 0.5) * 6)),
          delta: Math.max(5, Math.min(30, prev.delta + (Math.random() - 0.5) * 4)),
          gamma: Math.max(2, Math.min(20, prev.gamma + (Math.random() - 0.5) * 3))
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    toast("EEG recording started");
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setSessionTime(0);
    toast("EEG recording stopped and saved");
  };

  const handlePauseRecording = () => {
    setIsRecording(false);
    toast("EEG recording paused");
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case "connected": return "success";
      case "connecting": return "warning";
      case "disconnected": return "destructive";
      default: return "secondary";
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case "connected": return CheckCircle;
      case "connecting": return Activity;
      case "disconnected": return AlertTriangle;
      default: return Wifi;
    }
  };

  const brainwaveData = [
    { name: "Alpha (8-12 Hz)", value: eegData.alpha, color: "primary", description: "Relaxed awareness" },
    { name: "Beta (12-30 Hz)", value: eegData.beta, color: "therapeutic-green", description: "Active thinking" },
    { name: "Theta (4-8 Hz)", value: eegData.theta, color: "child-purple", description: "Deep relaxation" },
    { name: "Delta (0.5-4 Hz)", value: eegData.delta, color: "child-orange", description: "Deep sleep" },
    { name: "Gamma (30-100 Hz)", value: eegData.gamma, color: "warning", description: "High-level processing" }
  ];

  const recentSessions = [
    { date: "Today 2:15 PM", patient: "Emma Rodriguez", duration: "25 min", quality: "Excellent", notes: "Strong focus improvement" },
    { date: "Today 11:30 AM", patient: "Lucas Chen", duration: "20 min", quality: "Good", notes: "Stable baseline readings" },
    { date: "Yesterday 4:00 PM", patient: "Sophia Johnson", duration: "30 min", quality: "Excellent", notes: "Notable theta reduction" },
    { date: "Yesterday 1:15 PM", patient: "Mason Williams", duration: "15 min", quality: "Fair", notes: "Need to adjust protocol" }
  ];

  return (
    <div className="space-y-6">
      {/* EEG Status Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">EEG Neurofeedback Monitor</h2>
          <p className="text-muted-foreground">Real-time brainwave monitoring and analysis</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {(() => {
              const ConnectionIcon = getConnectionIcon();
              return <ConnectionIcon className={`h-5 w-5 text-${getConnectionColor()}`} />;
            })()}
            <Badge variant="secondary" className={`bg-${getConnectionColor()}/10 text-${getConnectionColor()}`}>
              {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
            </Badge>
          </div>
          
          <Badge variant="outline" className="text-sm">
            Patient: {activePatient}
          </Badge>
        </div>
      </div>

      {/* Recording Controls */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-primary" />
              Session Controls
            </span>
            <div className="flex items-center space-x-2">
              {isRecording && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                  <span className="text-lg font-mono font-bold text-destructive">
                    {formatTime(sessionTime)}
                  </span>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            {!isRecording ? (
              <Button 
                onClick={handleStartRecording}
                className="bg-success hover:bg-success/90 text-white"
                disabled={connectionStatus !== "connected"}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handlePauseRecording}
                  variant="outline"
                  className="border-warning text-warning hover:bg-warning hover:text-white"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
                <Button 
                  onClick={handleStopRecording}
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop & Save
                </Button>
              </>
            )}
            
            <Button variant="ghost" onClick={() => toast("EEG settings opened")}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          
          {connectionStatus !== "connected" && (
            <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">
                  EEG headset not connected. Please check the device connection.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Data Tabs */}
      <Tabs defaultValue="brainwaves" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="brainwaves">Brainwave Analysis</TabsTrigger>
          <TabsTrigger value="feedback">Neurofeedback</TabsTrigger>
          <TabsTrigger value="history">Session History</TabsTrigger>
        </TabsList>

        <TabsContent value="brainwaves" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real-time Brainwave Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-primary" />
                  Real-time Brainwaves
                </CardTitle>
                <CardDescription>
                  Live frequency band analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {brainwaveData.map((wave, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-sm">{wave.name}</span>
                        <p className="text-xs text-muted-foreground">{wave.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-lg">{wave.value.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground ml-1">μV</span>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={wave.value} 
                        className="h-3"
                        style={{
                          '--progress-background': `hsl(var(--${wave.color}))`
                        } as React.CSSProperties}
                      />
                      {isRecording && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Session Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-therapeutic-green" />
                  Session Metrics
                </CardTitle>
                <CardDescription>
                  Current session performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">87%</div>
                    <p className="text-sm text-muted-foreground">Focus Score</p>
                  </div>
                  <div className="text-center p-4 bg-therapeutic-green/10 rounded-lg">
                    <div className="text-2xl font-bold text-therapeutic-green">92%</div>
                    <p className="text-sm text-muted-foreground">Relaxation</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Attention Level</span>
                      <span className="text-sm text-muted-foreground">High</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Meditation State</span>
                      <span className="text-sm text-muted-foreground">Moderate</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Signal Quality</span>
                      <span className="text-sm text-success font-medium">Excellent</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-warning" />
                Neurofeedback Training
              </CardTitle>
              <CardDescription>
                Real-time feedback protocols and training modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-gentle-float" />
                <h3 className="text-lg font-medium mb-2">Neurofeedback Protocol Ready</h3>
                <p className="text-muted-foreground mb-6">
                  Start an EEG recording session to begin real-time neurofeedback training.
                </p>
                <Button 
                  onClick={handleStartRecording}
                  disabled={isRecording || connectionStatus !== "connected"}
                  className="bg-primary hover:bg-primary-dark text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Begin Neurofeedback Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent EEG Sessions</CardTitle>
              <CardDescription>
                Historical data and session summaries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        session.quality === 'Excellent' ? 'bg-success' :
                        session.quality === 'Good' ? 'bg-primary' : 'bg-warning'
                      }`}></div>
                      <div>
                        <p className="font-medium">{session.patient}</p>
                        <p className="text-sm text-muted-foreground">{session.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant="secondary" 
                          className={`${
                            session.quality === 'Excellent' ? 'bg-success/10 text-success' :
                            session.quality === 'Good' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'
                          }`}
                        >
                          {session.quality}
                        </Badge>
                        <span className="text-sm font-medium">{session.duration}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{session.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
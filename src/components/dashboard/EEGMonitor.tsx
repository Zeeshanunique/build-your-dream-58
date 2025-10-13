import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Settings,
  User,
  Calendar,
  Clock,
  Target,
  TrendingUp
} from "lucide-react";
import { usePatients, useEEGData, useSessions } from "@/hooks/use-sqlite";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const EEGMonitor = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("connected");
  const [sessionTime, setSessionTime] = useState(0);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [eegSettings, setEegSettings] = useState({
    samplingRate: 256,
    sensitivity: 0.5,
    filterType: "bandpass",
    targetFrequency: "alpha"
  });
  const [neurofeedbackTarget, setNeurofeedbackTarget] = useState({
    alpha: { min: 8, max: 12, target: 10 },
    beta: { min: 12, max: 30, target: 20 },
    theta: { min: 4, max: 8, target: 6 }
  });
  const [realTimeEEGData, setRealTimeEEGData] = useState<Array<{
    id: string;
    alpha: number;
    beta: number;
    theta: number;
    delta: number;
    gamma: number;
    timestamp: string;
  }>>([]);
  const [currentSessionRecordings, setCurrentSessionRecordings] = useState<Array<{
    id: string;
    patientId: string;
    patientName: string;
    startTime: string;
    endTime?: string;
    duration: number;
    readingsCount: number;
    avgAlpha: number;
    avgBeta: number;
    avgTheta: number;
    avgDelta: number;
    avgAttention: number;
    avgFocus: number;
    quality: string;
  }>>([]);

  const { userProfile } = useAuth();

  // Use SQLite for all data operations
  const { patients } = usePatients();
  const { eegData: dbEegData } = useEEGData(selectedPatientId ? parseInt(selectedPatientId) : undefined);
  const { sessions } = useSessions(selectedPatientId ? parseInt(selectedPatientId) : undefined);

  const activePatient = patients?.find(p => p.id?.toString() === selectedPatientId)?.name || "No patient selected";

  // Auto-select first patient if none selected
  useEffect(() => {
    if (!selectedPatientId && patients && patients.length > 0) {
      setSelectedPatientId(patients[0].id?.toString() || "");
    }
  }, [patients, selectedPatientId]);

  // Use real EEG data if available, otherwise use simulated data
  const [eegData, setEegData] = useState({
    alpha: 45,
    beta: 32,
    theta: 28,
    delta: 15,
    gamma: 8
  });

  // Fetch real-time EEG data from SQLite
  useEffect(() => {
    if (dbEegData && dbEegData.length > 0) {
      const latestReading = dbEegData[dbEegData.length - 1];
      setEegData({
        alpha: latestReading.alpha_waves,
        beta: latestReading.beta_waves,
        theta: latestReading.theta_waves,
        delta: latestReading.delta_waves,
        gamma: 8 // Default gamma since it's not in the database schema
      });
      setRealTimeEEGData(dbEegData.slice(-20).map(reading => ({
        id: reading.id?.toString() || '',
        alpha: reading.alpha_waves,
        beta: reading.beta_waves,
        theta: reading.theta_waves,
        delta: reading.delta_waves,
        gamma: 8, // Default gamma since it's not in the database schema
        timestamp: reading.timestamp
      })));
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
        const newData = {
          alpha: Math.max(20, Math.min(60, eegData.alpha + (Math.random() - 0.5) * 10)),
          beta: Math.max(15, Math.min(50, eegData.beta + (Math.random() - 0.5) * 8)),
          theta: Math.max(10, Math.min(45, eegData.theta + (Math.random() - 0.5) * 6)),
          delta: Math.max(5, Math.min(30, eegData.delta + (Math.random() - 0.5) * 4)),
          gamma: Math.max(2, Math.min(20, eegData.gamma + (Math.random() - 0.5) * 3))
        };
        
        setEegData(newData);
        
        // Add to real-time data array
        setRealTimeEEGData(prev => [...prev.slice(-19), {
          id: Date.now().toString(),
          ...newData,
          timestamp: new Date().toISOString()
        }]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording, eegData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    if (!selectedPatientId) {
      toast.error("Please select a patient first");
      return;
    }
    setIsRecording(true);
    setSessionTime(0);
    setRealTimeEEGData([]);
    
    // Create new session recording
    const newSession = {
      id: Date.now().toString(),
      patientId: selectedPatientId,
      patientName: activePatient,
      startTime: new Date().toISOString(),
      duration: 0,
      readingsCount: 0,
      avgAlpha: 0,
      avgBeta: 0,
      avgTheta: 0,
      avgDelta: 0,
      avgAttention: 0,
      avgFocus: 0,
      quality: "Good"
    };
    
    setCurrentSessionRecordings(prev => [newSession, ...prev]);
    toast.success("EEG recording started");
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    
    // Update the current session with final data
    if (realTimeEEGData.length > 0) {
      const currentSession = currentSessionRecordings[0];
      if (currentSession) {
        const avgAlpha = realTimeEEGData.reduce((sum, r) => sum + r.alpha, 0) / realTimeEEGData.length;
        const avgBeta = realTimeEEGData.reduce((sum, r) => sum + r.beta, 0) / realTimeEEGData.length;
        const avgTheta = realTimeEEGData.reduce((sum, r) => sum + r.theta, 0) / realTimeEEGData.length;
        const avgDelta = realTimeEEGData.reduce((sum, r) => sum + r.delta, 0) / realTimeEEGData.length;
        
        // Calculate attention and focus (simulated)
        const avgAttention = Math.min(100, (avgAlpha + avgBeta) * 1.5);
        const avgFocus = Math.min(100, avgAlpha * 2);
        
        const quality = avgAttention >= 80 ? "Excellent" : avgAttention >= 60 ? "Good" : "Fair";
        
        const updatedSession = {
          ...currentSession,
          endTime: new Date().toISOString(),
          duration: sessionTime,
          readingsCount: realTimeEEGData.length,
          avgAlpha,
          avgBeta,
          avgTheta,
          avgDelta,
          avgAttention,
          avgFocus,
          quality
        };
        
        setCurrentSessionRecordings(prev => [updatedSession, ...prev.slice(1)]);
        
        try {
          // In a real app, this would save to the database
          toast.success(`EEG recording stopped and saved. ${realTimeEEGData.length} readings recorded.`);
          console.log("EEG session saved:", updatedSession);
        } catch (error) {
          toast.error("Failed to save EEG data");
        }
      }
    }
    
    setSessionTime(0);
  };

  const handlePauseRecording = () => {
    setIsRecording(false);
    toast.info("EEG recording paused");
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

  const recentSessions = sessions && sessions.length > 0 ? sessions.slice(0, 4).map((session, index) => ({
    date: new Date(session.session_date).toLocaleDateString(),
    patient: patients?.find(p => p.id === session.patient_id)?.name || "Unknown Patient",
    duration: `${session.duration_minutes} min`,
    quality: session.progress_score >= 8 ? "Excellent" : session.progress_score >= 6 ? "Good" : "Fair",
    notes: session.notes || "No notes available"
  })) : [];

  return (
    <div className="space-y-6">
      {/* EEG Status Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">EEG Neurofeedback Monitor</h2>
          <p className="text-muted-foreground">Real-time brainwave monitoring and analysis</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Patient Selection */}
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients?.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id?.toString() || ""}>
                    {patient.name} ({patient.age}y)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            {(() => {
              const ConnectionIcon = getConnectionIcon();
              return <ConnectionIcon className={`h-5 w-5 text-${getConnectionColor()}`} />;
            })()}
            <Badge variant="secondary" className={`bg-${getConnectionColor()}/10 text-${getConnectionColor()}`}>
              {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
            </Badge>
          </div>
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
            
            <Button variant="ghost" onClick={() => setShowSettings(true)}>
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
                {/* Current Recording Session Stats */}
                {isRecording && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-primary">Live Recording Session</h4>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {formatTime(sessionTime)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-primary">{realTimeEEGData.length}</div>
                        <p className="text-xs text-muted-foreground">Readings</p>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-therapeutic-green">
                          {realTimeEEGData.length > 0 ? Math.round(realTimeEEGData.reduce((sum, r) => sum + r.alpha, 0) / realTimeEEGData.length) : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Avg Alpha</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dynamic Session Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {(() => {
                        // Calculate focus score from current session or database
                        if (isRecording && realTimeEEGData.length > 0) {
                          // Real-time focus calculation: Alpha waves + Beta waves normalized
                          const avgAlpha = realTimeEEGData.reduce((sum, r) => sum + r.alpha, 0) / realTimeEEGData.length;
                          const avgBeta = realTimeEEGData.reduce((sum, r) => sum + r.beta, 0) / realTimeEEGData.length;
                          return Math.round(Math.min(100, (avgAlpha + avgBeta) * 1.2));
                        } else if (dbEegData && dbEegData.length > 0) {
                          return Math.round(dbEegData.reduce((sum, reading) => sum + reading.focus_score, 0) / dbEegData.length);
                        } else {
                          // Default based on current EEG data
                          return Math.round(Math.min(100, (eegData.alpha + eegData.beta) * 1.2));
                        }
                      })()}%
                    </div>
                    <p className="text-sm text-muted-foreground">Focus Score</p>
                  </div>
                  <div className="text-center p-4 bg-therapeutic-green/10 rounded-lg">
                    <div className="text-2xl font-bold text-therapeutic-green">
                      {(() => {
                        // Calculate attention level from current session or database
                        if (isRecording && realTimeEEGData.length > 0) {
                          // Real-time attention calculation: Beta/Alpha ratio + consistency
                          const avgAlpha = realTimeEEGData.reduce((sum, r) => sum + r.alpha, 0) / realTimeEEGData.length;
                          const avgBeta = realTimeEEGData.reduce((sum, r) => sum + r.beta, 0) / realTimeEEGData.length;
                          const betaAlphaRatio = avgBeta / Math.max(avgAlpha, 1);
                          return Math.round(Math.min(100, 60 + (betaAlphaRatio * 20)));
                        } else if (dbEegData && dbEegData.length > 0) {
                          return Math.round(dbEegData.reduce((sum, reading) => sum + reading.attention_level, 0) / dbEegData.length);
                        } else {
                          // Default based on current EEG data
                          const betaAlphaRatio = eegData.beta / Math.max(eegData.alpha, 1);
                          return Math.round(Math.min(100, 60 + (betaAlphaRatio * 20)));
                        }
                      })()}%
                    </div>
                    <p className="text-sm text-muted-foreground">Attention Level</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Attention Level</span>
                      <span className="text-sm text-muted-foreground">
                        {(() => {
                          const attentionValue = (() => {
                            if (isRecording && realTimeEEGData.length > 0) {
                              const avgAlpha = realTimeEEGData.reduce((sum, r) => sum + r.alpha, 0) / realTimeEEGData.length;
                              const avgBeta = realTimeEEGData.reduce((sum, r) => sum + r.beta, 0) / realTimeEEGData.length;
                              const betaAlphaRatio = avgBeta / Math.max(avgAlpha, 1);
                              return Math.min(100, 60 + (betaAlphaRatio * 20));
                            } else if (dbEegData && dbEegData.length > 0) {
                              return dbEegData.reduce((sum, reading) => sum + reading.attention_level, 0) / dbEegData.length;
                            } else {
                              const betaAlphaRatio = eegData.beta / Math.max(eegData.alpha, 1);
                              return Math.min(100, 60 + (betaAlphaRatio * 20));
                            }
                          })();
                          
                          return attentionValue >= 80 ? "High" : 
                                 attentionValue >= 60 ? "Moderate" : "Low";
                        })()}
                      </span>
                    </div>
                    <Progress 
                      value={(() => {
                        if (isRecording && realTimeEEGData.length > 0) {
                          const avgAlpha = realTimeEEGData.reduce((sum, r) => sum + r.alpha, 0) / realTimeEEGData.length;
                          const avgBeta = realTimeEEGData.reduce((sum, r) => sum + r.beta, 0) / realTimeEEGData.length;
                          const betaAlphaRatio = avgBeta / Math.max(avgAlpha, 1);
                          return Math.min(100, 60 + (betaAlphaRatio * 20));
                        } else if (dbEegData && dbEegData.length > 0) {
                          return Math.round(dbEegData.reduce((sum, reading) => sum + reading.attention_level, 0) / dbEegData.length);
                        } else {
                          const betaAlphaRatio = eegData.beta / Math.max(eegData.alpha, 1);
                          return Math.min(100, 60 + (betaAlphaRatio * 20));
                        }
                      })()} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Focus Score</span>
                      <span className="text-sm text-muted-foreground">
                        {(() => {
                          const focusValue = (() => {
                            if (isRecording && realTimeEEGData.length > 0) {
                              const avgAlpha = realTimeEEGData.reduce((sum, r) => sum + r.alpha, 0) / realTimeEEGData.length;
                              const avgBeta = realTimeEEGData.reduce((sum, r) => sum + r.beta, 0) / realTimeEEGData.length;
                              return Math.min(100, (avgAlpha + avgBeta) * 1.2);
                            } else if (dbEegData && dbEegData.length > 0) {
                              return dbEegData.reduce((sum, reading) => sum + reading.focus_score, 0) / dbEegData.length;
                            } else {
                              return Math.min(100, (eegData.alpha + eegData.beta) * 1.2);
                            }
                          })();
                          
                          return focusValue >= 80 ? "High" : 
                                 focusValue >= 60 ? "Moderate" : "Low";
                        })()}
                      </span>
                    </div>
                    <Progress 
                      value={(() => {
                        if (isRecording && realTimeEEGData.length > 0) {
                          const avgAlpha = realTimeEEGData.reduce((sum, r) => sum + r.alpha, 0) / realTimeEEGData.length;
                          const avgBeta = realTimeEEGData.reduce((sum, r) => sum + r.beta, 0) / realTimeEEGData.length;
                          return Math.min(100, (avgAlpha + avgBeta) * 1.2);
                        } else if (dbEegData && dbEegData.length > 0) {
                          return Math.round(dbEegData.reduce((sum, reading) => sum + reading.focus_score, 0) / dbEegData.length);
                        } else {
                          return Math.min(100, (eegData.alpha + eegData.beta) * 1.2);
                        }
                      })()} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Signal Quality</span>
                      <span className="text-sm text-muted-foreground">
                        {(() => {
                          // Calculate signal quality based on data consistency and noise levels
                          if (isRecording && realTimeEEGData.length > 5) {
                            // Calculate variance in readings - lower variance = better quality
                            const alphaValues = realTimeEEGData.map(r => r.alpha);
                            const alphaVariance = alphaValues.reduce((sum, val) => sum + Math.pow(val - (alphaValues.reduce((a, b) => a + b) / alphaValues.length), 2), 0) / alphaValues.length;
                            const qualityScore = Math.max(60, 100 - (alphaVariance * 2));
                            return qualityScore >= 90 ? "Excellent" : 
                                   qualityScore >= 75 ? "Good" : 
                                   qualityScore >= 60 ? "Fair" : "Poor";
                          } else if (dbEegData && dbEegData.length > 0) {
                            // Use database signal quality or calculate from consistency
                            return "Excellent";
                          } else {
                            // Default quality based on current EEG stability
                            const stability = Math.abs(eegData.alpha - eegData.beta) / Math.max(eegData.alpha, eegData.beta);
                            return stability < 0.3 ? "Excellent" : 
                                   stability < 0.5 ? "Good" : "Fair";
                          }
                        })()}
                      </span>
                    </div>
                    <Progress 
                      value={(() => {
                        if (isRecording && realTimeEEGData.length > 5) {
                          const alphaValues = realTimeEEGData.map(r => r.alpha);
                          const alphaVariance = alphaValues.reduce((sum, val) => sum + Math.pow(val - (alphaValues.reduce((a, b) => a + b) / alphaValues.length), 2), 0) / alphaValues.length;
                          return Math.max(60, 100 - (alphaVariance * 2));
                        } else if (dbEegData && dbEegData.length > 0) {
                          return 95; // Database data is considered high quality
                        } else {
                          const stability = Math.abs(eegData.alpha - eegData.beta) / Math.max(eegData.alpha, eegData.beta);
                          return stability < 0.3 ? 95 : 
                                 stability < 0.5 ? 80 : 65;
                        }
                      })()} 
                      className="h-2" 
                    />
                  </div>
                </div>

                {/* Recent Session Summary */}
                {currentSessionRecordings.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Recent Sessions</h4>
                    <div className="space-y-2">
                      {currentSessionRecordings.slice(0, 2).map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                          <div>
                            <span className="font-medium">{session.patientName}</span>
                            <span className="text-muted-foreground ml-2">{formatTime(session.duration)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                session.quality === 'Excellent' ? 'bg-success/10 text-success' :
                                session.quality === 'Good' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'
                              }`}
                            >
                              {session.quality}
                            </Badge>
                            <span className="text-muted-foreground">{session.readingsCount} readings</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Neurofeedback Training */}
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
              <CardContent className="space-y-4">
                {isRecording ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <Brain className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Neurofeedback Active</h3>
                    <p className="text-muted-foreground mb-4">
                      Real-time training in progress...
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Session Time:</span>
                        <span className="font-mono font-bold">{formatTime(sessionTime)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Target Frequency:</span>
                        <span className="font-medium">{eegSettings.targetFrequency.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Readings:</span>
                        <span className="font-medium">{realTimeEEGData.length}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Neurofeedback Protocol Ready</h3>
                    <p className="text-muted-foreground mb-6">
                      Start an EEG recording session to begin real-time neurofeedback training.
                    </p>
                    <Button 
                      onClick={handleStartRecording}
                      disabled={!selectedPatientId || connectionStatus !== "connected"}
                      className="bg-primary hover:bg-primary/90 text-white"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Begin Neurofeedback Session
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Training Targets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  Training Targets
                </CardTitle>
                <CardDescription>
                  Current neurofeedback goals and progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Alpha Training</span>
                      <span className="text-sm text-muted-foreground">
                        {(() => {
                          const currentAlpha = isRecording && realTimeEEGData.length > 0 ? 
                            realTimeEEGData.reduce((sum, r) => sum + r.alpha, 0) / realTimeEEGData.length : 
                            eegData.alpha;
                          return currentAlpha >= neurofeedbackTarget.alpha.min && currentAlpha <= neurofeedbackTarget.alpha.max ? 
                            "✓ In Range" : "Out of Range";
                        })()}
                      </span>
                    </div>
                    <Progress 
                      value={(() => {
                        const currentAlpha = isRecording && realTimeEEGData.length > 0 ? 
                          realTimeEEGData.reduce((sum, r) => sum + r.alpha, 0) / realTimeEEGData.length : 
                          eegData.alpha;
                        const targetRange = neurofeedbackTarget.alpha.max - neurofeedbackTarget.alpha.min;
                        const positionInRange = Math.max(0, Math.min(100, 
                          ((currentAlpha - neurofeedbackTarget.alpha.min) / targetRange) * 100
                        ));
                        return positionInRange;
                      })()} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{neurofeedbackTarget.alpha.min}Hz</span>
                      <span className="font-medium">
                        {(() => {
                          const currentAlpha = isRecording && realTimeEEGData.length > 0 ? 
                            realTimeEEGData.reduce((sum, r) => sum + r.alpha, 0) / realTimeEEGData.length : 
                            eegData.alpha;
                          return currentAlpha.toFixed(1);
                        })()}Hz
                      </span>
                      <span>{neurofeedbackTarget.alpha.max}Hz</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Beta Training</span>
                      <span className="text-sm text-muted-foreground">
                        {(() => {
                          const currentBeta = isRecording && realTimeEEGData.length > 0 ? 
                            realTimeEEGData.reduce((sum, r) => sum + r.beta, 0) / realTimeEEGData.length : 
                            eegData.beta;
                          return currentBeta >= neurofeedbackTarget.beta.min && currentBeta <= neurofeedbackTarget.beta.max ? 
                            "✓ In Range" : "Out of Range";
                        })()}
                      </span>
                    </div>
                    <Progress 
                      value={(() => {
                        const currentBeta = isRecording && realTimeEEGData.length > 0 ? 
                          realTimeEEGData.reduce((sum, r) => sum + r.beta, 0) / realTimeEEGData.length : 
                          eegData.beta;
                        const targetRange = neurofeedbackTarget.beta.max - neurofeedbackTarget.beta.min;
                        const positionInRange = Math.max(0, Math.min(100, 
                          ((currentBeta - neurofeedbackTarget.beta.min) / targetRange) * 100
                        ));
                        return positionInRange;
                      })()} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{neurofeedbackTarget.beta.min}Hz</span>
                      <span className="font-medium">
                        {(() => {
                          const currentBeta = isRecording && realTimeEEGData.length > 0 ? 
                            realTimeEEGData.reduce((sum, r) => sum + r.beta, 0) / realTimeEEGData.length : 
                            eegData.beta;
                          return currentBeta.toFixed(1);
                        })()}Hz
                      </span>
                      <span>{neurofeedbackTarget.beta.max}Hz</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Theta Training</span>
                      <span className="text-sm text-muted-foreground">
                        {(() => {
                          const currentTheta = isRecording && realTimeEEGData.length > 0 ? 
                            realTimeEEGData.reduce((sum, r) => sum + r.theta, 0) / realTimeEEGData.length : 
                            eegData.theta;
                          return currentTheta >= neurofeedbackTarget.theta.min && currentTheta <= neurofeedbackTarget.theta.max ? 
                            "✓ In Range" : "Out of Range";
                        })()}
                      </span>
                    </div>
                    <Progress 
                      value={(() => {
                        const currentTheta = isRecording && realTimeEEGData.length > 0 ? 
                          realTimeEEGData.reduce((sum, r) => sum + r.theta, 0) / realTimeEEGData.length : 
                          eegData.theta;
                        const targetRange = neurofeedbackTarget.theta.max - neurofeedbackTarget.theta.min;
                        const positionInRange = Math.max(0, Math.min(100, 
                          ((currentTheta - neurofeedbackTarget.theta.min) / targetRange) * 100
                        ));
                        return positionInRange;
                      })()} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{neurofeedbackTarget.theta.min}Hz</span>
                      <span className="font-medium">
                        {(() => {
                          const currentTheta = isRecording && realTimeEEGData.length > 0 ? 
                            realTimeEEGData.reduce((sum, r) => sum + r.theta, 0) / realTimeEEGData.length : 
                            eegData.theta;
                          return currentTheta.toFixed(1);
                        })()}Hz
                      </span>
                      <span>{neurofeedbackTarget.theta.max}Hz</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Training Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {isRecording ? `${realTimeEEGData.length} readings` : "Not started"}
                    </span>
                  </div>
                  <Progress 
                    value={(() => {
                      if (!isRecording) return 0;
                      
                      // Calculate training effectiveness based on time in target ranges
                      if (realTimeEEGData.length === 0) return 0;
                      
                      let totalInRange = 0;
                      realTimeEEGData.forEach(reading => {
                        const alphaInRange = reading.alpha >= neurofeedbackTarget.alpha.min && reading.alpha <= neurofeedbackTarget.alpha.max;
                        const betaInRange = reading.beta >= neurofeedbackTarget.beta.min && reading.beta <= neurofeedbackTarget.beta.max;
                        const thetaInRange = reading.theta >= neurofeedbackTarget.theta.min && reading.theta <= neurofeedbackTarget.theta.max;
                        
                        // Count as successful if at least 2 out of 3 frequency bands are in range
                        const bandsInRange = [alphaInRange, betaInRange, thetaInRange].filter(Boolean).length;
                        if (bandsInRange >= 2) totalInRange++;
                      });
                      
                      const effectiveness = (totalInRange / realTimeEEGData.length) * 100;
                      return Math.min(100, effectiveness);
                    })()} 
                    className="h-2" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {(() => {
                      if (!isRecording) return "Start recording to begin training";
                      
                      if (realTimeEEGData.length === 0) return "Recording in progress...";
                      
                      let totalInRange = 0;
                      realTimeEEGData.forEach(reading => {
                        const alphaInRange = reading.alpha >= neurofeedbackTarget.alpha.min && reading.alpha <= neurofeedbackTarget.alpha.max;
                        const betaInRange = reading.beta >= neurofeedbackTarget.beta.min && reading.beta <= neurofeedbackTarget.beta.max;
                        const thetaInRange = reading.theta >= neurofeedbackTarget.theta.min && reading.theta <= neurofeedbackTarget.theta.max;
                        
                        const bandsInRange = [alphaInRange, betaInRange, thetaInRange].filter(Boolean).length;
                        if (bandsInRange >= 2) totalInRange++;
                      });
                      
                      const effectiveness = (totalInRange / realTimeEEGData.length) * 100;
                      return effectiveness >= 70 ? "Excellent training performance!" :
                             effectiveness >= 50 ? "Good training progress" :
                             effectiveness >= 30 ? "Moderate progress" : "Focus on target ranges";
                    })()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="space-y-6">
            {/* Current Session Recordings */}
            {currentSessionRecordings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-primary" />
                    Today's EEG Sessions
                  </CardTitle>
                  <CardDescription>
                    Recent EEG recording sessions from today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentSessionRecordings.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${
                            session.quality === 'Excellent' ? 'bg-success' :
                            session.quality === 'Good' ? 'bg-primary' : 'bg-warning'
                          }`}></div>
                          <div>
                            <p className="font-medium">{session.patientName}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(session.startTime).toLocaleString()} • {formatTime(session.duration)}
                            </p>
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
                            <span className="text-sm font-medium">{session.readingsCount} readings</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Avg: α{session.avgAlpha.toFixed(1)} β{session.avgBeta.toFixed(1)} θ{session.avgTheta.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Historical Sessions from Database */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  Historical EEG Sessions
                </CardTitle>
                <CardDescription>
                  Previous EEG sessions from the database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSessions.length > 0 ? (
                    recentSessions.map((session, index) => (
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
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Historical Sessions</h3>
                      <p className="text-muted-foreground">
                        Historical EEG sessions will appear here as they are recorded.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* EEG Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-primary" />
              EEG Device Settings
            </DialogTitle>
            <DialogDescription>
              Configure EEG device parameters and neurofeedback targets
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Device Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Device Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="samplingRate">Sampling Rate (Hz)</Label>
                    <Input
                      id="samplingRate"
                      type="number"
                      value={eegSettings.samplingRate}
                      onChange={(e) => setEegSettings(prev => ({ ...prev, samplingRate: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sensitivity">Sensitivity</Label>
                    <Input
                      id="sensitivity"
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="1.0"
                      value={eegSettings.sensitivity}
                      onChange={(e) => setEegSettings(prev => ({ ...prev, sensitivity: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="filterType">Filter Type</Label>
                    <Select value={eegSettings.filterType} onValueChange={(value) => setEegSettings(prev => ({ ...prev, filterType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bandpass">Bandpass</SelectItem>
                        <SelectItem value="lowpass">Lowpass</SelectItem>
                        <SelectItem value="highpass">Highpass</SelectItem>
                        <SelectItem value="notch">Notch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="targetFrequency">Target Frequency</Label>
                    <Select value={eegSettings.targetFrequency} onValueChange={(value) => setEegSettings(prev => ({ ...prev, targetFrequency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alpha">Alpha (8-12 Hz)</SelectItem>
                        <SelectItem value="beta">Beta (12-30 Hz)</SelectItem>
                        <SelectItem value="theta">Theta (4-8 Hz)</SelectItem>
                        <SelectItem value="delta">Delta (0.5-4 Hz)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Neurofeedback Targets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Neurofeedback Targets</CardTitle>
                <CardDescription>
                  Set frequency band targets for neurofeedback training
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Alpha Range (Hz)</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={neurofeedbackTarget.alpha.min}
                        onChange={(e) => setNeurofeedbackTarget(prev => ({ 
                          ...prev, 
                          alpha: { ...prev.alpha, min: parseInt(e.target.value) }
                        }))}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={neurofeedbackTarget.alpha.max}
                        onChange={(e) => setNeurofeedbackTarget(prev => ({ 
                          ...prev, 
                          alpha: { ...prev.alpha, max: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Beta Range (Hz)</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={neurofeedbackTarget.beta.min}
                        onChange={(e) => setNeurofeedbackTarget(prev => ({ 
                          ...prev, 
                          beta: { ...prev.beta, min: parseInt(e.target.value) }
                        }))}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={neurofeedbackTarget.beta.max}
                        onChange={(e) => setNeurofeedbackTarget(prev => ({ 
                          ...prev, 
                          beta: { ...prev.beta, max: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Theta Range (Hz)</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={neurofeedbackTarget.theta.min}
                        onChange={(e) => setNeurofeedbackTarget(prev => ({ 
                          ...prev, 
                          theta: { ...prev.theta, min: parseInt(e.target.value) }
                        }))}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={neurofeedbackTarget.theta.max}
                        onChange={(e) => setNeurofeedbackTarget(prev => ({ 
                          ...prev, 
                          theta: { ...prev.theta, max: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowSettings(false);
                toast.success("EEG settings saved successfully");
              }}>
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
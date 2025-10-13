import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Activity, 
  Brain, 
  BarChart3,
  FileText,
  Edit,
  Download,
  Plus
} from "lucide-react";
import { usePatients, useSessions, useKPIs, useEEGData } from "@/hooks/use-sqlite";
import { toast } from "sonner";

interface PatientDetailsModalProps {
  patientId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PatientDetailsModal = ({ patientId, open, onOpenChange }: PatientDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Get patient data
  const { patients } = usePatients();
  const patient = patients?.find(p => p.id?.toString() === patientId);
  
  // Get related data
  const { sessions, loading: sessionsLoading } = useSessions(patient ? parseInt(patientId!) : undefined);
  const { kpis, loading: kpisLoading } = useKPIs(patient ? parseInt(patientId!) : undefined);
  const { eegData, loading: eegLoading } = useEEGData(patient ? parseInt(patientId!) : undefined);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "scheduled": return "primary";
      case "attention": return "destructive";
      default: return "secondary";
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving": return "success";
      case "stable": return "warning";
      case "concerning": return "destructive";
      default: return "secondary";
    }
  };

  if (!patient) {
    return null;
  }

  const recentSessions = sessions?.slice(0, 5) || [];
  const recentKPIs = kpis?.slice(0, 10) || [];
  const latestEEG = eegData && eegData.length > 0 ? eegData[eegData.length - 1] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`/api/placeholder/64/64?text=${patient.name.split(' ').map(n => n[0]).join('')}`} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">{patient.name}</DialogTitle>
              <DialogDescription className="text-base">
                Age {patient.age} • {patient.condition}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="eeg">EEG Data</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Patient Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="text-2xl font-bold">{patient.progress}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-therapeutic-green" />
                    <div>
                      <p className="text-sm text-muted-foreground">Sessions</p>
                      <p className="text-2xl font-bold">{patient.completed_sessions}/{patient.total_sessions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-child-purple" />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Session</p>
                      <p className="text-sm font-medium">{formatDate(patient.last_session)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <div>
                      <p className="text-sm text-muted-foreground">Trend</p>
                      <Badge variant="secondary" className={`bg-${getTrendColor(patient.trend)}/10 text-${getTrendColor(patient.trend)}`}>
                        {patient.trend}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-muted-foreground">{patient.progress}%</span>
                    </div>
                    <Progress value={patient.progress} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Session Completion</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((patient.completed_sessions / Math.max(patient.total_sessions, 1)) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(patient.completed_sessions / Math.max(patient.total_sessions, 1)) * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{patient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-medium">{patient.age} years old</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Condition</p>
                    <p className="font-medium">{patient.condition}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant="secondary" className={`bg-${getStatusColor(patient.status)}/10 text-${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Therapist</p>
                    <p className="font-medium">{patient.therapist_name || "Dr. Sarah Johnson"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Parent</p>
                    <p className="font-medium">{patient.parent_name || "Parent Information"}</p>
                  </div>
                </div>
                
                {patient.notes && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm bg-muted p-3 rounded-md">{patient.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Sessions</h3>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Session
              </Button>
            </div>
            
            {sessionsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : recentSessions.length > 0 ? (
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{session.session_type}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(session.session_date)} • {session.duration_minutes} minutes
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-1">
                            Score: {session.progress_score}/10
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {session.therapist_name || "Dr. Sarah Johnson"}
                          </p>
                        </div>
                      </div>
                      {session.notes && (
                        <p className="text-sm mt-2 p-2 bg-muted rounded">{session.notes}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No sessions recorded</h3>
                  <p className="text-sm text-muted-foreground">
                    Start tracking sessions to monitor patient progress.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <h3 className="text-lg font-semibold">KPI Metrics</h3>
            
            {kpisLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : recentKPIs.length > 0 ? (
              <div className="space-y-4">
                {recentKPIs.map((kpi) => (
                  <Card key={kpi.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold capitalize">
                            {kpi.metric_type.replace(/_/g, ' ')}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(kpi.measurement_date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {kpi.metric_value}
                            {kpi.metric_type.includes('percentage') ? '%' : 
                             kpi.metric_type.includes('time') ? 'ms' : ''}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No KPI data available</h3>
                  <p className="text-sm text-muted-foreground">
                    KPI metrics will appear here as sessions are completed.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* EEG Data Tab */}
          <TabsContent value="eeg" className="space-y-4">
            <h3 className="text-lg font-semibold">EEG Readings</h3>
            
            {eegLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : latestEEG ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-primary" />
                      Latest EEG Reading
                    </CardTitle>
                    <CardDescription>
                      {formatDate(latestEEG.timestamp)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Alpha Waves</p>
                        <p className="text-xl font-bold text-primary">{latestEEG.alpha_waves.toFixed(1)} Hz</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Beta Waves</p>
                        <p className="text-xl font-bold text-therapeutic-green">{latestEEG.beta_waves.toFixed(1)} Hz</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Theta Waves</p>
                        <p className="text-xl font-bold text-child-purple">{latestEEG.theta_waves.toFixed(1)} Hz</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Delta Waves</p>
                        <p className="text-xl font-bold text-child-orange">{latestEEG.delta_waves.toFixed(1)} Hz</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Attention Level</p>
                        <p className="text-2xl font-bold text-success">{latestEEG.attention_level.toFixed(1)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Focus Score</p>
                        <p className="text-2xl font-bold text-primary">{latestEEG.focus_score.toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {eegData && eegData.length > 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>EEG History</CardTitle>
                      <CardDescription>
                        Recent EEG readings for trend analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {eegData.slice(-10).map((reading) => (
                          <div key={reading.id} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{formatDate(reading.timestamp)}</span>
                            <div className="flex space-x-4 text-sm">
                              <span>α: {reading.alpha_waves.toFixed(1)}</span>
                              <span>β: {reading.beta_waves.toFixed(1)}</span>
                              <span>θ: {reading.theta_waves.toFixed(1)}</span>
                              <span>δ: {reading.delta_waves.toFixed(1)}</span>
                              <span className="text-primary">Focus: {reading.focus_score.toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No EEG data available</h3>
                  <p className="text-sm text-muted-foreground">
                    EEG readings will appear here during neurofeedback sessions.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Patient
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

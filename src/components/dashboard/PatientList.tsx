import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  User,
  MoreHorizontal,
  Activity
} from "lucide-react";
import { useAllPatients, usePatientSessions } from "@/hooks/use-database";
import { toast } from "sonner";

interface PatientListProps {
  onPatientSelect: (patientId: string) => void;
}

export const PatientList = ({ onPatientSelect }: PatientListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch real patient data from database
  const { patients: dbPatients, loading: patientsLoading, error } = useAllPatients();

  // Transform database patients to match component interface
  const patients = dbPatients?.map(patient => {
    // Calculate some derived data
    const progress = Math.floor(Math.random() * 40) + 60; // Random progress between 60-100
    const totalSessions = Math.floor(Math.random() * 20) + 10; // Random total sessions
    const completedSessions = Math.floor(totalSessions * 0.7); // 70% completion rate
    
    return {
      id: patient.id.toString(),
      name: patient.name,
      age: patient.age,
      condition: patient.condition,
      lastSession: "2 hours ago", // This would come from session data
      nextSession: "Tomorrow 3:00 PM", // This would come from scheduling data
      progress: progress,
      status: progress > 75 ? "active" : progress > 50 ? "scheduled" : "attention",
      totalSessions: totalSessions,
      completedSessions: completedSessions,
      trend: progress > 75 ? "improving" : progress > 50 ? "stable" : "concerning"
    };
  }) || [];

  if (patientsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <User className="h-5 w-5 mr-2 text-primary" />
              Patient Management
            </span>
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
          </CardTitle>
          <CardDescription>Loading patient data...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
            Error Loading Patients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "scheduled": return "primary";
      case "attention": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return CheckCircle;
      case "scheduled": return Clock;
      case "attention": return AlertCircle;
      default: return User;
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

  const handlePatientClick = (patientId: string) => {
    onPatientSelect(patientId);
    toast(`Viewing details for patient #${patientId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <User className="h-5 w-5 mr-2 text-primary" />
            Patient Management
          </span>
          <Badge variant="secondary">{filteredPatients.length} patients</Badge>
        </CardTitle>
        <CardDescription>
          Manage and monitor patient progress and schedules
        </CardDescription>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients by name or condition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {filteredPatients.map((patient) => {
          const StatusIcon = getStatusIcon(patient.status);
          
          return (
            <Card 
              key={patient.id}
              className="cursor-pointer hover:shadow-md transition-shadow border border-border/50 hover:border-primary/30"
              onClick={() => handlePatientClick(patient.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`/api/placeholder/40/40?text=${patient.name.split(' ').map(n => n[0]).join('')}`} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Patient Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {patient.name}
                        </h3>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs bg-${getStatusColor(patient.status)}/10 text-${getStatusColor(patient.status)}`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {patient.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                        <span>Age {patient.age}</span>
                        <span>•</span>
                        <span>{patient.condition}</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">Progress</span>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs font-medium">{patient.progress}%</span>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs bg-${getTrendColor(patient.trend)}/10 text-${getTrendColor(patient.trend)}`}
                            >
                              {patient.trend === 'improving' && <TrendingUp className="h-3 w-3 mr-1" />}
                              {patient.trend}
                            </Badge>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full bg-${getStatusColor(patient.status)}`}
                            style={{ width: `${patient.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Session Info */}
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Last: {patient.lastSession}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground truncate">Next: {patient.nextSession}</span>
                        </div>
                      </div>
                      
                      {/* Session Stats */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                        <div className="flex items-center space-x-1 text-xs">
                          <Activity className="h-3 w-3 text-primary" />
                          <span className="text-muted-foreground">
                            {patient.completedSessions}/{patient.totalSessions} sessions
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast("Patient options menu opened");
                          }}
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {filteredPatients.length === 0 && (
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No patients found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search criteria or add a new patient.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
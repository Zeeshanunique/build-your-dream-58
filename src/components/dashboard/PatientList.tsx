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
import { toast } from "sonner";

interface PatientListProps {
  onPatientSelect: (patientId: string) => void;
}

export const PatientList = ({ onPatientSelect }: PatientListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const patients = [
    {
      id: "1",
      name: "Emma Rodriguez",
      age: 8,
      condition: "ADHD",
      lastSession: "2 hours ago",
      nextSession: "Tomorrow 3:00 PM",
      progress: 78,
      status: "active",
      totalSessions: 24,
      completedSessions: 18,
      trend: "improving"
    },
    {
      id: "2", 
      name: "Lucas Chen",
      age: 10,
      condition: "Autism Spectrum",
      lastSession: "1 day ago", 
      nextSession: "Today 4:30 PM",
      progress: 65,
      status: "scheduled",
      totalSessions: 30,
      completedSessions: 20,
      trend: "stable"
    },
    {
      id: "3",
      name: "Sophia Johnson", 
      age: 7,
      condition: "Learning Disability",
      lastSession: "3 days ago",
      nextSession: "Friday 2:00 PM", 
      progress: 82,
      status: "active",
      totalSessions: 20,
      completedSessions: 16,
      trend: "improving"
    },
    {
      id: "4",
      name: "Mason Williams",
      age: 9, 
      condition: "Processing Disorder",
      lastSession: "1 week ago",
      nextSession: "Needs scheduling",
      progress: 45,
      status: "attention",
      totalSessions: 15,
      completedSessions: 7,
      trend: "concerning"
    },
    {
      id: "5",
      name: "Ava Thompson",
      age: 11,
      condition: "Memory Difficulties", 
      lastSession: "Yesterday",
      nextSession: "Monday 1:00 PM",
      progress: 71,
      status: "active",
      totalSessions: 28,
      completedSessions: 22,
      trend: "improving"
    }
  ];

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
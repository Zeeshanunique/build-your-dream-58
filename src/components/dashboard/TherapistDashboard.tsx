import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Brain, 
  BarChart3, 
  Calendar, 
  FileText, 
  TrendingUp,
  Activity,
  Clock,
  Target,
  Plus
} from "lucide-react";
import { PatientList } from "./PatientList";
import { EEGMonitor } from "./EEGMonitor";
import { toast } from "sonner";

export const TherapistDashboard = () => {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const stats = [
    { title: "Active Patients", value: "24", change: "+3", icon: Users, color: "primary" },
    { title: "Sessions This Week", value: "89", change: "+12%", icon: Calendar, color: "therapeutic-green" },
    { title: "Avg. Improvement", value: "23%", change: "+5%", icon: TrendingUp, color: "success" },
    { title: "EEG Sessions", value: "156", change: "+8", icon: Activity, color: "child-purple" }
  ];

  const recentActivity = [
    { patient: "Emma Rodriguez", action: "Completed Attention Training", time: "2 hours ago", type: "session" },
    { patient: "Lucas Chen", action: "EEG Assessment Scheduled", time: "4 hours ago", type: "appointment" },
    { patient: "Sophia Johnson", action: "Progress Report Generated", time: "6 hours ago", type: "report" },
    { patient: "Mason Williams", action: "Training Protocol Updated", time: "1 day ago", type: "update" }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Dr. Smith</h1>
          <p className="text-muted-foreground mt-1">
            You have 3 patients scheduled for today and 2 pending assessments.
          </p>
        </div>
        <Button onClick={() => toast("New patient form opened")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <IconComponent className={`h-4 w-4 text-${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="text-success font-medium">{stat.change}</span>
                  <span className="ml-1">from last week</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="patients" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patients">Patient Management</TabsTrigger>
          <TabsTrigger value="eeg">EEG Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient List */}
            <div className="lg:col-span-2">
              <PatientList onPatientSelect={setSelectedPatient} />
            </div>
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'session' ? 'bg-therapeutic-green' :
                      activity.type === 'appointment' ? 'bg-primary' :
                      activity.type === 'report' ? 'bg-child-purple' : 'bg-warning'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.patient}</p>
                      <p className="text-xs text-muted-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="eeg" className="mt-6">
          <EEGMonitor />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Progress Overview</CardTitle>
                <CardDescription>Average improvement across all cognitive domains</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { domain: "Attention & Focus", progress: 78, improvement: "+15%" },
                  { domain: "Working Memory", progress: 65, improvement: "+22%" },
                  { domain: "Problem Solving", progress: 82, improvement: "+18%" },
                  { domain: "Processing Speed", progress: 71, improvement: "+12%" }
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.domain}</span>
                      <Badge variant="secondary" className="text-success">
                        {item.improvement}
                      </Badge>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Treatment Efficacy</CardTitle>
                <CardDescription>Success rates by intervention type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { name: "EEG Neurofeedback", rate: 89, patients: 18 },
                    { name: "Cognitive Training", rate: 76, patients: 24 },
                    { name: "Combined Therapy", rate: 94, patients: 12 }
                  ].map((treatment, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{treatment.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {treatment.patients} patients
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Progress value={treatment.rate} className="flex-1" />
                        <span className="text-sm font-medium w-12">{treatment.rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Clinical Reports
              </CardTitle>
              <CardDescription>
                Generate and manage patient progress reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No reports generated yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create comprehensive reports for patients, insurance, or research purposes.
                </p>
                <Button onClick={() => toast("Report generation started")}>
                  Generate New Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
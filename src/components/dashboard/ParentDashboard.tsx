import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Calendar, 
  Trophy, 
  MessageCircle, 
  BookOpen,
  Target,
  Clock,
  Star,
  Play,
  CheckCircle
} from "lucide-react";
import { MessageModal } from "@/components/modals/MessageModal";
import { useState } from "react";
import { toast } from "sonner";
import { usePatients, useSessions, useKPIs } from "@/hooks/use-sqlite";
import { useAuth } from "@/contexts/AuthContext";

export const ParentDashboard = () => {
  const [showMessageModal, setShowMessageModal] = useState(false);
  const { userProfile } = useAuth();
  const { patients, loading: patientsLoading } = usePatients();
  const { sessions, loading: sessionsLoading } = useSessions();
  const { kpis, loading: kpisLoading } = useKPIs();

  // Get the child's data (assuming parent has one child for now)
  const child = patients?.[0]; // For demo, using first patient as child
  
  if (patientsLoading || sessionsLoading || kpisLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your child's progress...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="text-center py-12">
        <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No child profile found</h3>
        <p className="text-muted-foreground">
          Please contact your therapist to set up your child's profile.
        </p>
      </div>
    );
  }

  // Calculate dynamic stats from real data
  const childSessions = sessions?.filter(s => s.patient_id === child.id) || [];
  const childKPIs = kpis?.filter(k => k.patient_id === child.id) || [];
  
  const sessionsCompleted = childSessions.length;
  const totalSessions = child.total_sessions || 30; // Default if not set
  const weeklyGoal = 5;
  const currentStreak = Math.min(7, Math.floor(sessionsCompleted / 2)); // Estimate based on sessions
  const overallProgress = child.progress || Math.round((sessionsCompleted / totalSessions) * 100);

  // Calculate cognitive areas progress from KPIs
  const cognitiveAreas = [
    { 
      name: "Attention & Focus", 
      progress: Math.round(childKPIs.filter(k => k.metric_type === 'attention_span_minutes').reduce((sum, k) => sum + k.metric_value, 0) / Math.max(childKPIs.filter(k => k.metric_type === 'attention_span_minutes').length, 1) * 4) || 78, 
      trend: "improving" 
    },
    { 
      name: "Working Memory", 
      progress: Math.round(childKPIs.filter(k => k.metric_type === 'memory_recall_percentage').reduce((sum, k) => sum + k.metric_value, 0) / Math.max(childKPIs.filter(k => k.metric_type === 'memory_recall_percentage').length, 1)) || 65, 
      trend: "stable" 
    },
    { 
      name: "Problem Solving", 
      progress: Math.round(childKPIs.filter(k => k.metric_type === 'accuracy_percentage').reduce((sum, k) => sum + k.metric_value, 0) / Math.max(childKPIs.filter(k => k.metric_type === 'accuracy_percentage').length, 1)) || 82, 
      trend: "improving" 
    },
    { 
      name: "Processing Speed", 
      progress: Math.round(childKPIs.filter(k => k.metric_type === 'reaction_time_ms').reduce((sum, k) => sum + (1000 - k.metric_value), 0) / Math.max(childKPIs.filter(k => k.metric_type === 'reaction_time_ms').length, 1) / 10) || 71, 
      trend: "improving" 
    }
  ];

  // Generate recent achievements from sessions
  const recentAchievements = childSessions.slice(0, 3).map((session, index) => ({
    title: session.session_type,
    description: `${session.duration_minutes} minutes completed`,
    icon: index === 0 ? "🧠" : index === 1 ? "🎯" : "🧩",
    date: new Date(session.session_date).toLocaleDateString()
  }));

  // Generate upcoming activities (mock for now, could be from schedule)
  const upcomingActivities = [
    { time: "3:00 PM", activity: "Attention Training", duration: "20 min", type: "cognitive" },
    { time: "4:30 PM", activity: "EEG Session", duration: "30 min", type: "feedback" },
    { time: "7:00 PM", activity: "Family Review", duration: "15 min", type: "review" }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">
            {child.name} has completed {sessionsCompleted} out of {totalSessions} training sessions.
          </p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">🌟</div>
          <Badge variant="secondary" className="bg-therapeutic-green/10 text-therapeutic-green">
            {currentStreak} day streak!
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center border-therapeutic-green/20">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-therapeutic-green">
              {overallProgress}%
            </div>
            <p className="text-sm text-muted-foreground">Overall Progress</p>
          </CardContent>
        </Card>
        
        <Card className="text-center border-primary/20">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {sessionsCompleted}
            </div>
            <p className="text-sm text-muted-foreground">Sessions Completed</p>
          </CardContent>
        </Card>
        
        <Card className="text-center border-child-purple/20">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-child-purple">
              {currentStreak}
            </div>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        
        <Card className="text-center border-warning/20">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-warning">
              {recentAchievements.length}
            </div>
            <p className="text-sm text-muted-foreground">New Achievements</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Today's Plan</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="communication">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Today's Activities
                </CardTitle>
                <CardDescription>
                  {child.name}'s scheduled training sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        activity.type === 'cognitive' ? 'bg-therapeutic-green' :
                        activity.type === 'feedback' ? 'bg-primary' : 'bg-child-purple'
                      }`}></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{activity.activity}</span>
                        <span className="text-sm text-muted-foreground">{activity.duration}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{activity.time}</div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weekly Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-therapeutic-green" />
                  Weekly Goals
                </CardTitle>
                <CardDescription>
                  Progress towards this week's training targets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Training Sessions</span>
                    <span className="text-sm text-muted-foreground">
                      3 of {weeklyGoal} completed
                    </span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Focus Time</span>
                    <span className="text-sm text-muted-foreground">
                      45 of 90 minutes
                    </span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">EEG Sessions</span>
                    <span className="text-sm text-muted-foreground">
                      2 of 3 completed
                    </span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cognitive Development Areas</CardTitle>
                <CardDescription>
                  {child.name}'s progress in key cognitive skills
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {cognitiveAreas.map((area, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{area.name}</span>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            area.trend === 'improving' ? 'bg-success/10 text-success' : 'bg-muted'
                          }`}
                        >
                          {area.trend === 'improving' ? '↗ Improving' : '→ Stable'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{area.progress}%</span>
                      </div>
                    </div>
                    <Progress value={area.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Progress Summary</CardTitle>
                <CardDescription>
                  Key improvements and milestones achieved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-success/10">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium">Attention span increased</p>
                      <p className="text-sm text-muted-foreground">From 8 to 15 minutes average</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/10">
                    <Star className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Memory recall improved</p>
                      <p className="text-sm text-muted-foreground">23% increase in working memory tasks</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-therapeutic-green/10">
                    <Trophy className="h-5 w-5 text-therapeutic-green" />
                    <div>
                      <p className="font-medium">Problem-solving milestone</p>
                      <p className="text-sm text-muted-foreground">Completed advanced puzzle series</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-warning" />
                Recent Achievements
              </CardTitle>
              <CardDescription>
                Celebrate {child.name}'s cognitive training milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentAchievements.map((achievement, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="text-4xl mb-3">{achievement.icon}</div>
                      <h3 className="font-semibold mb-2">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {achievement.date}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                Therapist Messages
              </CardTitle>
              <CardDescription>
                Communication with {child.name}'s care team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No new messages</h3>
                <p className="text-muted-foreground mb-4">
                  Stay connected with your child's therapy team for updates and guidance.
                </p>
                <Button onClick={() => setShowMessageModal(true)}>
                  Send Message to Therapist
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <MessageModal 
        open={showMessageModal} 
        onOpenChange={setShowMessageModal}
        recipientType="therapist"
      />
    </div>
  );
};
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

export const ParentDashboard = () => {
  const [showMessageModal, setShowMessageModal] = useState(false);
  const childStats = {
    name: "Emma",
    age: 8,
    sessionsCompleted: 24,
    totalSessions: 30,
    weeklyGoal: 5,
    currentStreak: 3,
    overallProgress: 72
  };

  const recentAchievements = [
    { title: "Memory Master", description: "Completed 10 memory exercises", icon: "🧠", date: "2 days ago" },
    { title: "Focus Champion", description: "20 minutes focused attention", icon: "🎯", date: "3 days ago" },
    { title: "Problem Solver", description: "Solved complex puzzle sequence", icon: "🧩", date: "5 days ago" }
  ];

  const upcomingActivities = [
    { time: "3:00 PM", activity: "Attention Training", duration: "20 min", type: "cognitive" },
    { time: "4:30 PM", activity: "EEG Session", duration: "30 min", type: "feedback" },
    { time: "7:00 PM", activity: "Family Review", duration: "15 min", type: "review" }
  ];

  const cognitiveAreas = [
    { name: "Attention & Focus", progress: 78, trend: "improving" },
    { name: "Working Memory", progress: 65, trend: "stable" },
    { name: "Problem Solving", progress: 82, trend: "improving" },
    { name: "Processing Speed", progress: 71, trend: "improving" }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">
            {childStats.name} has completed {childStats.sessionsCompleted} out of {childStats.totalSessions} training sessions.
          </p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">🌟</div>
          <Badge variant="secondary" className="bg-therapeutic-green/10 text-therapeutic-green">
            {childStats.currentStreak} day streak!
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center border-therapeutic-green/20">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-therapeutic-green">
              {childStats.overallProgress}%
            </div>
            <p className="text-sm text-muted-foreground">Overall Progress</p>
          </CardContent>
        </Card>
        
        <Card className="text-center border-primary/20">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {childStats.sessionsCompleted}
            </div>
            <p className="text-sm text-muted-foreground">Sessions Completed</p>
          </CardContent>
        </Card>
        
        <Card className="text-center border-child-purple/20">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-child-purple">
              {childStats.currentStreak}
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
                  {childStats.name}'s scheduled training sessions
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
                      3 of {childStats.weeklyGoal} completed
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
                  {childStats.name}'s progress in key cognitive skills
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
                Celebrate {childStats.name}'s cognitive training milestones
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
                Communication with {childStats.name}'s care team
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
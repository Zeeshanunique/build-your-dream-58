import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Gamepad2, 
  Star, 
  Trophy, 
  Brain, 
  Target, 
  Heart,
  Play,
  Gift,
  Zap,
  Smile
} from "lucide-react";
import { GameModal } from "@/components/modals/GameModal";
import { toast } from "sonner";
import { usePatients, useSessions, useKPIs } from "@/hooks/use-sqlite";
import { useGameSessions, useAchievements } from "@/hooks/use-game-sessions";
import { useAuth } from "@/contexts/AuthContext";

export const ChildDashboard = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [currentGameId, setCurrentGameId] = useState("");
  const [currentGameTitle, setCurrentGameTitle] = useState("");
  
  const { userProfile } = useAuth();
  const { patients, loading: patientsLoading } = usePatients();
  const { sessions, loading: sessionsLoading } = useSessions();
  const { kpis, loading: kpisLoading } = useKPIs();

  // Get the child's data - find patient that matches the logged-in child user
  // For now, we'll use Emma Smith as the child's patient profile
  const child = patients?.find(p => p.name === "Emma Smith") || patients?.[0];
  
  const { sessions: gameSessions, loading: gameSessionsLoading } = useGameSessions(child?.id);
  const { achievements, loading: achievementsLoading } = useAchievements(child?.id);
  
  if (patientsLoading || sessionsLoading || kpisLoading || gameSessionsLoading || achievementsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="text-center py-12">
        <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No profile found</h3>
        <p className="text-muted-foreground">
          Please contact your therapist to set up your profile.
        </p>
      </div>
    );
  }

  // Calculate dynamic stats from real data
  const childSessions = sessions?.filter(s => s.patient_id === child.id) || [];
  const childKPIs = kpis?.filter(k => k.patient_id === child.id) || [];
  
  const sessionsCompleted = childSessions.length;
  const totalSessions = child.total_sessions || 30;
  const dailyGoal = 5; // Increased to include games
  const currentStreak = Math.min(7, Math.floor(sessionsCompleted / 2));
  const level = Math.floor(sessionsCompleted / 5) + 1; // Level up every 5 sessions
  
  // Calculate game-related stats
  const totalGameStars = gameSessions?.reduce((sum, session) => sum + session.stars_earned, 0) || 0;
  const gamesCompletedToday = gameSessions?.filter(session => {
    const sessionDate = new Date(session.start_time);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  }).length || 0;
  const totalGamesCompleted = gameSessions?.length || 0;
  
  const completedToday = childSessions.filter(s => {
    const sessionDate = new Date(s.session_date);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  }).length + gamesCompletedToday;

  const playerStats = {
    name: userProfile?.name || child.name, // Use authenticated user's name first
    level: level,
    totalStars: totalGameStars, // Use actual game stars
    streakDays: currentStreak,
    completedToday: completedToday,
    dailyGoal: dailyGoal,
    gamesCompleted: totalGamesCompleted,
    achievementsUnlocked: achievements?.length || 0
  };

  // Calculate cognitive abilities from KPIs
  const memoryAbility = childKPIs.filter(k => k.metric_type === 'memory_recall_percentage').reduce((sum, k) => sum + k.metric_value, 0) / Math.max(childKPIs.filter(k => k.metric_type === 'memory_recall_percentage').length, 1) || 65;
  const attentionAbility = childKPIs.filter(k => k.metric_type === 'attention_span_minutes').reduce((sum, k) => sum + k.metric_value, 0) / Math.max(childKPIs.filter(k => k.metric_type === 'attention_span_minutes').length, 1) || 12;
  const accuracyAbility = childKPIs.filter(k => k.metric_type === 'accuracy_percentage').reduce((sum, k) => sum + k.metric_value, 0) / Math.max(childKPIs.filter(k => k.metric_type === 'accuracy_percentage').length, 1) || 75;
  const speedAbility = childKPIs.filter(k => k.metric_type === 'reaction_time_ms').reduce((sum, k) => sum + (1000 - k.metric_value), 0) / Math.max(childKPIs.filter(k => k.metric_type === 'reaction_time_ms').length, 1) / 10 || 60;

  // Dynamic game generation based on level and abilities
  const availableGames = [
    {
      id: "memory-match",
      title: "Memory Magic",
      description: "Match colorful patterns and boost your memory!",
      icon: "🧠",
      difficulty: memoryAbility >= 80 ? "Expert" : memoryAbility >= 60 ? "Medium" : "Easy",
      duration: `${Math.max(5, Math.min(20, Math.round(memoryAbility / 5)))} min`,
      stars: Math.min(3, Math.floor(memoryAbility / 25)),
      color: "child-purple",
      unlocked: level >= 1,
      progress: Math.round(memoryAbility),
      category: "memory"
    },
    {
      id: "focus-forest",
      title: "Focus Forest", 
      description: "Help the animals by staying focused!",
      icon: "🌳",
      difficulty: attentionAbility >= 20 ? "Expert" : attentionAbility >= 15 ? "Medium" : "Easy",
      duration: `${Math.max(8, Math.min(25, Math.round(attentionAbility * 1.2)))} min`, 
      stars: Math.min(3, Math.floor(attentionAbility / 6)),
      color: "therapeutic-green",
      unlocked: level >= 2,
      progress: Math.round(attentionAbility * 4),
      category: "attention"
    },
    {
      id: "puzzle-palace",
      title: "Puzzle Palace",
      description: "Solve amazing puzzles and unlock treasures!",
      icon: "🏰",
      difficulty: accuracyAbility >= 90 ? "Expert" : accuracyAbility >= 75 ? "Medium" : "Easy",
      duration: `${Math.max(10, Math.min(20, Math.round(accuracyAbility / 4)))} min`,
      stars: Math.min(3, Math.floor(accuracyAbility / 30)),
      color: "child-orange",
      unlocked: level >= 3,
      progress: Math.round(accuracyAbility),
      category: "problem-solving"
    },
    {
      id: "speed-racer",
      title: "Speed Racer",
      description: "Race through challenges at lightning speed!",
      icon: "🏎️",
      difficulty: speedAbility >= 80 ? "Expert" : speedAbility >= 60 ? "Medium" : "Easy",
      duration: `${Math.max(5, Math.min(15, Math.round(speedAbility / 6)))} min`,
      stars: Math.min(3, Math.floor(speedAbility / 25)),
      color: "primary",
      unlocked: level >= 4,
      progress: Math.round(speedAbility),
      category: "processing-speed"
    },
    {
      id: "brain-boost",
      title: "Brain Boost",
      description: "Combine all your skills in ultimate challenges!",
      icon: "⚡",
      difficulty: level >= 5 ? "Expert" : level >= 3 ? "Medium" : "Easy",
      duration: `${Math.max(15, Math.min(30, level * 3))} min`,
      stars: Math.min(3, Math.floor(level / 2)),
      color: "warning",
      unlocked: level >= 5,
      progress: Math.round((memoryAbility + attentionAbility + accuracyAbility + speedAbility) / 4),
      category: "comprehensive"
    },
    {
      id: "creativity-castle",
      title: "Creativity Castle",
      description: "Unleash your imagination and creative thinking!",
      icon: "🎨",
      difficulty: level >= 6 ? "Expert" : level >= 4 ? "Medium" : "Easy",
      duration: `${Math.max(12, Math.min(25, level * 2.5))} min`,
      stars: Math.min(3, Math.floor(level / 3)),
      color: "child-purple",
      unlocked: level >= 6,
      progress: Math.round((memoryAbility + accuracyAbility) / 2),
      category: "creativity"
    }
  ].filter(game => game.unlocked); // Only show unlocked games

  // Helper function to get achievement icon based on type
  const getAchievementIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'memory': return '🧠';
      case 'attention': return '🎯';
      case 'processing': return '⚡';
      case 'logic': return '🧩';
      case 'creativity': return '🎨';
      case 'speed': return '🏎️';
      case 'accuracy': return '🎯';
      case 'focus': return '🔍';
      case 'problem_solving': return '🧩';
      case 'pattern_recognition': return '🔢';
      default: return '🏆';
    }
  };

  // Use real achievements from database, with fallback to generated ones
  const realAchievements = achievements?.map(achievement => ({
    title: achievement.achievement_name,
    icon: getAchievementIcon(achievement.achievement_type),
    unlocked: true,
    unlockedAt: achievement.unlocked_at
  })) || [];
  
  // Generate additional achievements based on sessions and KPIs if not in database
  const generatedAchievements = [
    { title: "Memory Master", icon: "🧠", unlocked: childKPIs.some(k => k.metric_type === 'memory_recall_percentage' && k.metric_value >= 70) },
    { title: "Focus Champion", icon: "🎯", unlocked: childKPIs.some(k => k.metric_type === 'attention_span_minutes' && k.metric_value >= 15) },
    { title: "Puzzle Solver", icon: "🧩", unlocked: childKPIs.some(k => k.metric_type === 'accuracy_percentage' && k.metric_value >= 80) },
    { title: "Speed Demon", icon: "⚡", unlocked: childKPIs.some(k => k.metric_type === 'reaction_time_ms' && k.metric_value <= 400) },
    { title: "Super Star", icon: "⭐", unlocked: totalGameStars >= 50 },
    { title: "Brain Hero", icon: "🦸", unlocked: sessionsCompleted >= 20 }
  ].filter(achievement => !realAchievements.some(real => real.title === achievement.title));
  
  const allAchievements = [...realAchievements, ...generatedAchievements];

  // Generate today's progress from recent sessions
  const todayProgress = childSessions.slice(0, 4).map((session, index) => ({
    activity: session.session_type,
    completed: true,
    stars: Math.min(3, Math.floor(session.progress_score || 7)),
    time: new Date(session.session_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  // Add upcoming activities if not enough completed
  while (todayProgress.length < 4) {
    const upcomingIndex = todayProgress.length;
    const upcomingActivities = [
      { activity: "Memory Magic", time: "4:00 PM" },
      { activity: "Focus Forest", time: "5:30 PM" },
      { activity: "Puzzle Palace", time: "6:00 PM" },
      { activity: "EEG Training", time: "7:00 PM" }
    ];
    
    if (upcomingIndex < upcomingActivities.length) {
      todayProgress.push({
        activity: upcomingActivities[upcomingIndex].activity,
        completed: false,
        stars: 0,
        time: upcomingActivities[upcomingIndex].time
      });
    } else {
      break;
    }
  }

  const handleStartGame = (gameId: string) => {
    const game = availableGames.find(g => g.id === gameId);
    if (game) {
      setCurrentGameId(gameId);
      setCurrentGameTitle(game.title);
      setShowGameModal(true);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header with Fun Animation */}
      <div className="text-center relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
          <div className="animate-gentle-float text-4xl">⭐</div>
        </div>
        <h1 className="text-4xl font-bold bg-child-gradient bg-clip-text text-transparent mb-2">
          Hi {playerStats.name}! 🌟
        </h1>
        <p className="text-lg text-muted-foreground">
          Ready for some brain training adventures today?
        </p>
      </div>

      {/* Player Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center bg-child-gradient border-0 text-white">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">Level {playerStats.level}</div>
            <p className="text-sm opacity-90">Your Level</p>
          </CardContent>
        </Card>
        
        <Card className="text-center border-warning/20">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-warning">⭐ {playerStats.totalStars}</div>
            <p className="text-sm text-muted-foreground">Total Stars</p>
          </CardContent>
        </Card>
        
        <Card className="text-center border-therapeutic-green/20">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-therapeutic-green">🔥 {playerStats.streakDays}</div>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        
        <Card className="text-center border-primary/20">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary">
              {playerStats.completedToday}/{playerStats.dailyGoal}
            </div>
            <p className="text-sm text-muted-foreground">Today's Goals</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Progress */}
      <Card className="border-child-purple/20">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Target className="h-6 w-6 mr-2 text-child-purple" />
            Today's Adventures 🎮
          </CardTitle>
          <CardDescription>
            Complete your daily brain training activities!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Daily Progress</span>
              <span className="text-sm text-muted-foreground">
                {playerStats.completedToday} of {playerStats.dailyGoal} completed
              </span>
            </div>
            <Progress 
              value={(playerStats.completedToday / playerStats.dailyGoal) * 100} 
              className="h-3"
            />
          </div>
          
          <div className="space-y-3">
            {todayProgress.map((activity, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  activity.completed ? 'bg-success/10 border border-success/20' : 'bg-muted/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    activity.completed ? 'bg-success text-white' : 'bg-muted-foreground/20'
                  }`}>
                    {activity.completed ? '✓' : index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{activity.activity}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {activity.completed && (
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${
                            i < activity.stars ? 'text-warning fill-current' : 'text-muted-foreground'
                          }`} 
                        />
                      ))}
                    </div>
                  )}
                  {!activity.completed && (
                    <Button size="sm" className="bg-primary hover:bg-primary-dark text-white">
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Selection */}
      <Card className="border-child-orange/20">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Gamepad2 className="h-6 w-6 mr-2 text-child-orange" />
            Brain Training Games 🎯
          </CardTitle>
          <CardDescription>
            Choose your favorite games to train your super brain!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableGames.map((game) => (
              <Card 
                key={game.id} 
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 hover:border-${game.color} ${
                  game.unlocked ? 'opacity-100' : 'opacity-60'
                }`}
                onClick={() => game.unlocked ? handleStartGame(game.id) : toast("Complete more sessions to unlock this game! 🎮")}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl">{game.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-lg">{game.title}</h3>
                        {!game.unlocked && (
                          <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                            🔒 Locked
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{game.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-muted-foreground">Progress</span>
                          <span className="text-xs text-muted-foreground">{game.progress}%</span>
                        </div>
                        <Progress value={game.progress} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs bg-${game.color}/10 text-${game.color}`}
                          >
                            {game.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {game.duration}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {game.category}
                          </Badge>
                        </div>
                        <div className="flex space-x-1">
                          {[...Array(3)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < game.stars ? 'text-warning fill-current' : 'text-muted-foreground'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Show locked games preview */}
            {availableGames.length < 6 && (
              <Card className="border-dashed border-2 border-muted-foreground/30 opacity-60">
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">🔒</div>
                  <h3 className="font-bold text-lg mb-1">More Games Coming!</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Complete more sessions to unlock advanced games
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Level {level + 1} required for next unlock
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="border-warning/20">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Trophy className="h-6 w-6 mr-2 text-warning" />
            Your Awesome Achievements 🏆
          </CardTitle>
          <CardDescription>
            Look at all the amazing things you've accomplished!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {allAchievements.map((achievement, index) => (
              <div 
                key={index}
                className={`text-center p-4 rounded-lg border-2 transition-all ${
                  achievement.unlocked 
                    ? 'bg-success/10 border-success/20 text-success' 
                    : 'bg-muted/20 border-muted text-muted-foreground'
                }`}
              >
                <div className={`text-2xl mb-2 ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                  {achievement.icon}
                </div>
                <p className="text-xs font-medium">{achievement.title}</p>
                {achievement.unlocked && (
                  <div className="text-xs mt-1 font-bold">UNLOCKED!</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Encouragement Section */}
      <Card className="bg-therapeutic-gradient text-white border-0">
        <CardContent className="text-center py-8">
          <Smile className="h-12 w-12 mx-auto mb-4 animate-gentle-float" />
          <h2 className="text-2xl font-bold mb-2">You're Doing Amazing! 🌟</h2>
          <p className="text-lg opacity-90 mb-4">
            Keep up the great work, {playerStats.name}! Your brain is getting stronger every day!
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90"
            onClick={() => toast("Keep being awesome! 🌟")}
          >
            <Gift className="h-5 w-5 mr-2" />
            Claim Daily Bonus
          </Button>
        </CardContent>
      </Card>

      <GameModal 
        open={showGameModal}
        onOpenChange={setShowGameModal}
        gameId={currentGameId}
        gameTitle={currentGameTitle}
      />
    </div>
  );
};
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
import { toast } from "sonner";

export const ChildDashboard = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const playerStats = {
    name: "Emma",
    level: 7,
    totalStars: 156,
    streakDays: 3,
    completedToday: 2,
    dailyGoal: 4
  };

  const availableGames = [
    {
      id: "memory-match",
      title: "Memory Magic",
      description: "Match colorful patterns and boost your memory!",
      icon: "🧠",
      difficulty: "Easy",
      duration: "10 min",
      stars: 3,
      color: "child-purple"
    },
    {
      id: "focus-forest",
      title: "Focus Forest", 
      description: "Help the animals by staying focused!",
      icon: "🌳",
      difficulty: "Medium",
      duration: "15 min", 
      stars: 2,
      color: "therapeutic-green"
    },
    {
      id: "puzzle-palace",
      title: "Puzzle Palace",
      description: "Solve amazing puzzles and unlock treasures!",
      icon: "🏰",
      difficulty: "Medium",
      duration: "12 min",
      stars: 3,
      color: "child-orange"
    },
    {
      id: "speed-racer",
      title: "Speed Racer",
      description: "Race through challenges at lightning speed!",
      icon: "🏎️",
      difficulty: "Hard",
      duration: "8 min",
      stars: 1,
      color: "primary"
    }
  ];

  const achievements = [
    { title: "Memory Master", icon: "🧠", unlocked: true },
    { title: "Focus Champion", icon: "🎯", unlocked: true },
    { title: "Puzzle Solver", icon: "🧩", unlocked: true },
    { title: "Speed Demon", icon: "⚡", unlocked: false },
    { title: "Super Star", icon: "⭐", unlocked: false },
    { title: "Brain Hero", icon: "🦸", unlocked: false }
  ];

  const todayProgress = [
    { activity: "Memory Magic", completed: true, stars: 3, time: "10:30 AM" },
    { activity: "Focus Forest", completed: true, stars: 2, time: "2:15 PM" },
    { activity: "Puzzle Palace", completed: false, stars: 0, time: "4:00 PM" },
    { activity: "EEG Training", completed: false, stars: 0, time: "5:30 PM" }
  ];

  const handleStartGame = (gameId: string) => {
    setSelectedGame(gameId);
    toast(`Starting ${availableGames.find(g => g.id === gameId)?.title}! Have fun! 🎮`);
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
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-2 hover:border-${game.color}`}
                onClick={() => handleStartGame(game.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl">{game.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{game.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{game.description}</p>
                      
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
            {achievements.map((achievement, index) => (
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
    </div>
  );
};
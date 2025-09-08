import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, Heart, Brain, Target, Zap, Home, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface GameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameId: string;
  gameTitle: string;
}

export const GameModal = ({ open, onOpenChange, gameId, gameTitle }: GameModalProps) => {
  const [gameState, setGameState] = useState<"loading" | "playing" | "completed" | "paused">("loading");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [level, setLevel] = useState(1);
  const [starsEarned, setStarsEarned] = useState(0);

  // Game simulation
  useEffect(() => {
    if (open && gameState === "loading") {
      const timer = setTimeout(() => {
        setGameState("playing");
        toast(`🎮 ${gameTitle} started! Good luck!`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [open, gameState, gameTitle]);

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === "playing" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState("completed");
            calculateStars();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  // Simulate random scoring
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === "playing") {
      interval = setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance to score
          setScore(prev => prev + Math.floor(Math.random() * 50) + 10);
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const calculateStars = () => {
    let stars = 0;
    if (score >= 200) stars = 1;
    if (score >= 400) stars = 2;
    if (score >= 600) stars = 3;
    setStarsEarned(stars);
  };

  const handleGameAction = (action: string) => {
    switch (action) {
      case "correct":
        setScore(prev => prev + 50);
        toast("Correct! Great job! ✨");
        break;
      case "incorrect":
        setLives(prev => Math.max(0, prev - 1));
        toast("Oops! Try again! 💪");
        break;
      case "bonus":
        setScore(prev => prev + 100);
        toast("Bonus points! Awesome! 🌟");
        break;
      case "level-up":
        setLevel(prev => prev + 1);
        toast(`Level ${level + 1} unlocked! 🚀`);
        break;
    }
  };

  const resetGame = () => {
    setGameState("loading");
    setScore(0);
    setLives(3);
    setTimeLeft(60);
    setLevel(1);
    setStarsEarned(0);
  };

  const getGameContent = () => {
    switch (gameId) {
      case "memory-match":
        return {
          icon: "🧠",
          color: "child-purple",
          instructions: "Match the colorful patterns to improve your memory!",
          actions: [
            { label: "Easy Match", action: "correct", color: "success" },
            { label: "Hard Match", action: "bonus", color: "warning" },
            { label: "Miss", action: "incorrect", color: "destructive" }
          ]
        };
      case "focus-forest":
        return {
          icon: "🌳",
          color: "therapeutic-green", 
          instructions: "Help the forest animals by staying focused!",
          actions: [
            { label: "Help Animal", action: "correct", color: "success" },
            { label: "Super Focus", action: "bonus", color: "primary" },
            { label: "Distracted", action: "incorrect", color: "destructive" }
          ]
        };
      case "puzzle-palace":
        return {
          icon: "🏰",
          color: "child-orange",
          instructions: "Solve amazing puzzles and unlock treasures!",
          actions: [
            { label: "Solve Puzzle", action: "correct", color: "success" },
            { label: "Find Treasure", action: "bonus", color: "warning" },
            { label: "Wrong Move", action: "incorrect", color: "destructive" }
          ]
        };
      default:
        return {
          icon: "🎮",
          color: "primary",
          instructions: "Complete the challenges to train your brain!",
          actions: [
            { label: "Success", action: "correct", color: "success" },
            { label: "Perfect!", action: "bonus", color: "warning" },
            { label: "Try Again", action: "incorrect", color: "destructive" }
          ]
        };
    }
  };

  const gameContent = getGameContent();

  if (gameState === "loading") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="text-center py-12 space-y-4">
            <div className="text-6xl animate-bounce">{gameContent.icon}</div>
            <h3 className="text-2xl font-bold">Loading {gameTitle}...</h3>
            <Progress value={66} className="w-3/4 mx-auto animate-pulse" />
            <p className="text-muted-foreground">Get ready for some brain training fun!</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="text-2xl">{gameContent.icon}</span>
            <span>{gameTitle}</span>
            {gameState === "completed" && (
              <Badge className="bg-success text-white ml-2">Completed!</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {gameContent.instructions}
          </DialogDescription>
        </DialogHeader>

        {/* Game Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <div className="text-2xl font-bold text-primary">{score}</div>
            <div className="text-xs text-muted-foreground">Score</div>
          </div>
          <div className="text-center p-3 bg-destructive/10 rounded-lg">
            <div className="flex justify-center space-x-1">
              {[...Array(3)].map((_, i) => (
                <Heart key={i} className={`h-5 w-5 ${i < lives ? 'text-destructive fill-current' : 'text-muted-foreground'}`} />
              ))}
            </div>
            <div className="text-xs text-muted-foreground">Lives</div>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-lg">
            <div className="text-2xl font-bold text-warning">{timeLeft}s</div>
            <div className="text-xs text-muted-foreground">Time</div>
          </div>
          <div className="text-center p-3 bg-therapeutic-green/10 rounded-lg">
            <div className="text-2xl font-bold text-therapeutic-green">{level}</div>
            <div className="text-xs text-muted-foreground">Level</div>
          </div>
        </div>

        {/* Game Area */}
        <div className={`min-h-[200px] bg-${gameContent.color}/5 border-2 border-${gameContent.color}/20 rounded-lg p-6 flex items-center justify-center`}>
          {gameState === "playing" ? (
            <div className="text-center space-y-6">
              <div className="text-8xl animate-gentle-float">{gameContent.icon}</div>
              <p className="text-lg font-medium">Training your cognitive abilities...</p>
              
              {/* Game Actions */}
              <div className="grid grid-cols-3 gap-3">
                {gameContent.actions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={`border-${action.color} text-${action.color} hover:bg-${action.color} hover:text-white`}
                    onClick={() => handleGameAction(action.action)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            // Game Completed
            <div className="text-center space-y-6">
              <Trophy className="h-16 w-16 text-warning mx-auto animate-bounce" />
              <h3 className="text-2xl font-bold">Great Job!</h3>
              
              {/* Stars Earned */}
              <div className="flex justify-center space-x-2">
                {[...Array(3)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-8 w-8 ${i < starsEarned ? 'text-warning fill-current animate-pulse' : 'text-muted-foreground'}`} 
                  />
                ))}
              </div>
              
              <div className="space-y-2">
                <p className="text-lg">Final Score: <span className="font-bold text-primary">{score}</span></p>
                <p className="text-sm text-muted-foreground">
                  {starsEarned === 3 && "Perfect! You're a cognitive champion! 🏆"}
                  {starsEarned === 2 && "Excellent work! Keep it up! ⭐"}
                  {starsEarned === 1 && "Good job! Practice makes perfect! 💪"}
                  {starsEarned === 0 && "Nice try! You'll do better next time! 🌟"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar for time */}
        {gameState === "playing" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Time Remaining</span>
              <span>{timeLeft}s</span>
            </div>
            <Progress value={(timeLeft / 60) * 100} className="h-2" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex space-x-2">
            {gameState === "playing" && (
              <Button variant="outline" onClick={() => setGameState("paused")}>
                ⏸️ Pause
              </Button>
            )}
            {gameState === "completed" && (
              <Button variant="outline" onClick={resetGame} className="flex items-center space-x-2">
                <RotateCcw className="h-4 w-4" />
                <span>Play Again</span>
              </Button>
            )}
          </div>
          
          <div className="space-x-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Exit Game</span>
            </Button>
            {gameState === "completed" && (
              <Button className="bg-primary hover:bg-primary-dark text-white">
                Next Game
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
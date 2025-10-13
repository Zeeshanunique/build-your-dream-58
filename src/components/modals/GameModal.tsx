import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, Heart, Brain, Target, Zap, Home, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { MemoryMatchGame } from "@/components/games/MemoryMatchGame";
import { FocusForestGame } from "@/components/games/FocusForestGame";
import { PuzzlePalaceGame } from "@/components/games/PuzzlePalaceGame";
import { SpeedRacerGame } from "@/components/games/SpeedRacerGame";
import { BrainBoostGame } from "@/components/games/BrainBoostGame";
import { CreativityCastleGame } from "@/components/games/CreativityCastleGame";

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
          ],
          cognitiveSkill: "Memory",
          difficulty: "Easy"
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
          ],
          cognitiveSkill: "Attention",
          difficulty: "Medium"
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
          ],
          cognitiveSkill: "Problem Solving",
          difficulty: "Medium"
        };
      case "speed-racer":
        return {
          icon: "🏎️",
          color: "primary",
          instructions: "Race through challenges at lightning speed!",
          actions: [
            { label: "Quick Answer", action: "correct", color: "success" },
            { label: "Lightning Fast", action: "bonus", color: "warning" },
            { label: "Too Slow", action: "incorrect", color: "destructive" }
          ],
          cognitiveSkill: "Processing Speed",
          difficulty: "Hard"
        };
      case "brain-boost":
        return {
          icon: "⚡",
          color: "warning",
          instructions: "Combine all your skills in ultimate challenges!",
          actions: [
            { label: "Multi-Skill", action: "correct", color: "success" },
            { label: "Perfect Combo", action: "bonus", color: "warning" },
            { label: "Need Practice", action: "incorrect", color: "destructive" }
          ],
          cognitiveSkill: "Comprehensive",
          difficulty: "Expert"
        };
      case "creativity-castle":
        return {
          icon: "🎨",
          color: "child-purple",
          instructions: "Unleash your imagination and creative thinking!",
          actions: [
            { label: "Creative Idea", action: "correct", color: "success" },
            { label: "Genius Move", action: "bonus", color: "warning" },
            { label: "Try Again", action: "incorrect", color: "destructive" }
          ],
          cognitiveSkill: "Creativity",
          difficulty: "Expert"
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
          ],
          cognitiveSkill: "General",
          difficulty: "Easy"
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
          <DialogDescription className="space-y-2">
            <p>{gameContent.instructions}</p>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                <Brain className="h-3 w-3 mr-1" />
                {gameContent.cognitiveSkill}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Target className="h-3 w-3 mr-1" />
                {gameContent.difficulty}
              </Badge>
            </div>
          </DialogDescription>
        </DialogHeader>


        {/* Game Area */}
        <div className={`min-h-[400px] bg-${gameContent.color}/5 border-2 border-${gameContent.color}/20 rounded-lg p-6`}>
          {gameId === "memory-match" && (
            <MemoryMatchGame 
              onGameComplete={(score, stars) => {
                setScore(score);
                setStarsEarned(stars);
                setGameState("completed");
                toast(`Memory Magic completed! Score: ${score} ⭐`);
              }}
              onExit={() => onOpenChange(false)}
            />
          )}
          
          {gameId === "focus-forest" && (
            <FocusForestGame 
              onGameComplete={(score, stars) => {
                setScore(score);
                setStarsEarned(stars);
                setGameState("completed");
                toast(`Focus Forest completed! Score: ${score} 🌳`);
              }}
              onExit={() => onOpenChange(false)}
            />
          )}
          
          {gameId === "puzzle-palace" && (
            <PuzzlePalaceGame 
              onGameComplete={(score, stars) => {
                setScore(score);
                setStarsEarned(stars);
                setGameState("completed");
                toast(`Puzzle Palace completed! Score: ${score} 🏰`);
              }}
              onExit={() => onOpenChange(false)}
            />
          )}
          
          {gameId === "speed-racer" && (
            <SpeedRacerGame 
              onGameComplete={(score, stars) => {
                setScore(score);
                setStarsEarned(stars);
                setGameState("completed");
                toast(`Speed Racer completed! Score: ${score} 🏎️`);
              }}
              onExit={() => onOpenChange(false)}
            />
          )}
          
          {gameId === "brain-boost" && (
            <BrainBoostGame 
              onGameComplete={(score, stars) => {
                setScore(score);
                setStarsEarned(stars);
                setGameState("completed");
                toast(`Brain Boost completed! Score: ${score} 🧠`);
              }}
              onExit={() => onOpenChange(false)}
            />
          )}
          
          {gameId === "creativity-castle" && (
            <CreativityCastleGame 
              onGameComplete={(score, stars) => {
                setScore(score);
                setStarsEarned(stars);
                setGameState("completed");
                toast(`Creativity Castle completed! Score: ${score} 🏰`);
              }}
              onExit={() => onOpenChange(false)}
            />
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
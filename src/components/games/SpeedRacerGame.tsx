import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, RotateCcw, Home, Zap } from "lucide-react";
import { toast } from "sonner";

interface SpeedRacerGameProps {
  onGameComplete: (score: number, stars: number) => void;
  onExit: () => void;
}

interface ReactionTest {
  id: number;
  type: 'wait' | 'go';
  delay: number;
  timestamp: number;
}

export const SpeedRacerGame = ({ onGameComplete, onExit }: SpeedRacerGameProps) => {
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'go' | 'completed' | 'gameover'>('waiting');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute
  const [level, setLevel] = useState(1);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [currentTest, setCurrentTest] = useState<ReactionTest | null>(null);
  const [testsCompleted, setTestsCompleted] = useState(0);
  const [waitingStart, setWaitingStart] = useState<number>(0);
  const [goTimestamp, setGoTimestamp] = useState<number>(0);
  const [userClickTime, setUserClickTime] = useState<number>(0);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'ready' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('completed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  // Auto-start tests
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (gameState === 'waiting') {
      const delay = Math.random() * 3000 + 1000; // 1-4 seconds
      timeout = setTimeout(() => {
        setGameState('ready');
        setWaitingStart(Date.now());
      }, delay);
    }
    
    return () => clearTimeout(timeout);
  }, [gameState]);

  const initializeGame = () => {
    setScore(0);
    setLives(3);
    setTimeLeft(60);
    setLevel(1);
    setReactionTimes([]);
    setCurrentTest(null);
    setTestsCompleted(0);
    setGameState('waiting');
    setWaitingStart(0);
    setGoTimestamp(0);
    setUserClickTime(0);
  };

  const startTest = () => {
    if (gameState !== 'ready') return;
    
    setGameState('go');
    setGoTimestamp(Date.now());
    toast("GO! Click now! 🏎️");
  };

  const handleUserClick = () => {
    if (gameState !== 'go') return;
    
    const clickTime = Date.now();
    const reactionTime = clickTime - goTimestamp;
    
    setUserClickTime(clickTime);
    setReactionTimes(prev => [...prev, reactionTime]);
    
    // Calculate score based on reaction time
    let points = 0;
    if (reactionTime < 200) {
      points = 100; // Excellent
      toast("Lightning fast! ⚡");
    } else if (reactionTime < 300) {
      points = 80; // Good
      toast("Great reaction! 🏎️");
    } else if (reactionTime < 500) {
      points = 60; // Average
      toast("Good timing! 👍");
    } else if (reactionTime < 1000) {
      points = 40; // Slow
      toast("Keep practicing! 💪");
    } else {
      points = 20; // Very slow
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameState('gameover');
        }
        return newLives;
      });
      toast("Too slow! Try again! 🐌");
    }
    
    setScore(prev => prev + points);
    setTestsCompleted(prev => prev + 1);
    
    // Level up every 5 tests
    if ((testsCompleted + 1) % 5 === 0) {
      setLevel(prev => prev + 1);
      toast(`Level ${level + 1}! Faster reactions needed! 🚀`);
    }
    
    // Reset for next test
    setTimeout(() => {
      setGameState('waiting');
      setGoTimestamp(0);
      setUserClickTime(0);
    }, 1500);
  };

  const calculateFinalScore = () => {
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length 
      : 1000;
    
    const speedBonus = Math.max(0, (1000 - avgReactionTime) * 0.5);
    const completionBonus = testsCompleted * 50;
    const levelBonus = level * 100;
    const finalScore = score + speedBonus + completionBonus + levelBonus;
    
    let stars = 0;
    if (finalScore >= 3000) stars = 3;
    else if (finalScore >= 2000) stars = 2;
    else if (finalScore >= 1000) stars = 1;
    
    onGameComplete(finalScore, stars);
  };

  const getStarsEarned = () => {
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length 
      : 1000;
    
    const speedBonus = Math.max(0, (1000 - avgReactionTime) * 0.5);
    const completionBonus = testsCompleted * 50;
    const levelBonus = level * 100;
    const finalScore = score + speedBonus + completionBonus + levelBonus;
    
    if (finalScore >= 3000) return 3;
    if (finalScore >= 2000) return 2;
    if (finalScore >= 1000) return 1;
    return 0;
  };

  const getAverageReactionTime = () => {
    if (reactionTimes.length === 0) return 0;
    return Math.round(reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length);
  };

  if (gameState === 'completed') {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl">🏁</div>
        <h2 className="text-3xl font-bold text-success">Race Complete!</h2>
        <p className="text-lg">You finished the speed challenge!</p>
        
        <div className="space-y-4">
          <div className="text-2xl font-bold text-primary">
            Final Score: {score + Math.max(0, (1000 - getAverageReactionTime()) * 0.5) + (testsCompleted * 50) + (level * 100)}
          </div>
          
          <div className="flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-8 w-8 ${
                  i < getStarsEarned() ? 'text-warning fill-current' : 'text-muted-foreground'
                }`} 
              />
            ))}
          </div>
          
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="bg-primary/10 p-3 rounded">
              <div className="font-bold">{testsCompleted}</div>
              <div className="text-muted-foreground">Tests</div>
            </div>
            <div className="bg-success/10 p-3 rounded">
              <div className="font-bold">{getAverageReactionTime()}ms</div>
              <div className="text-muted-foreground">Avg Reaction</div>
            </div>
            <div className="bg-warning/10 p-3 rounded">
              <div className="font-bold">{level}</div>
              <div className="text-muted-foreground">Level</div>
            </div>
            <div className="bg-destructive/10 p-3 rounded">
              <div className="font-bold">{lives}</div>
              <div className="text-muted-foreground">Lives Left</div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button variant="outline" onClick={initializeGame}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Play Again
          </Button>
          <Button onClick={onExit}>
            <Home className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl">💥</div>
        <h2 className="text-3xl font-bold text-destructive">Race Over!</h2>
        <p className="text-lg">You ran out of lives!</p>
        
        <div className="space-y-4">
          <div className="text-2xl font-bold text-primary">Final Score: {score}</div>
          
          <div className="flex justify-center space-x-2">
            {[...Array(3)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-8 w-8 ${
                  i < getStarsEarned() ? 'text-warning fill-current' : 'text-muted-foreground'
                }`} 
              />
            ))}
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button variant="outline" onClick={initializeGame}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={onExit}>
            <Home className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="text-center p-3 bg-primary/10 rounded-lg">
          <div className="text-lg font-bold text-primary">{score}</div>
          <div className="text-xs text-muted-foreground">Score</div>
        </div>
        <div className="text-center p-3 bg-success/10 rounded-lg">
          <div className="text-lg font-bold text-success">{testsCompleted}</div>
          <div className="text-xs text-muted-foreground">Tests</div>
        </div>
        <div className="text-center p-3 bg-destructive/10 rounded-lg">
          <div className="flex justify-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i < lives ? 'bg-destructive' : 'bg-muted-foreground'}`} />
            ))}
          </div>
          <div className="text-xs text-muted-foreground">Lives</div>
        </div>
        <div className="text-center p-3 bg-warning/10 rounded-lg">
          <div className="text-lg font-bold text-warning">{level}</div>
          <div className="text-xs text-muted-foreground">Level</div>
        </div>
        <div className="text-center p-3 bg-destructive/10 rounded-lg">
          <div className="text-lg font-bold text-destructive">{timeLeft}s</div>
          <div className="text-xs text-muted-foreground">Time</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center">
        <Badge variant="outline" className="mb-2">
          ⚡ Click as fast as you can when you see "GO"!
        </Badge>
        <p className="text-sm text-muted-foreground">
          Wait for the signal, then click immediately when it appears!
        </p>
      </div>

      {/* Game Area */}
      <div className="relative bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg p-8 min-h-[300px] border-2 border-blue-300">
        <div className="absolute top-2 left-2 text-sm font-medium text-blue-800">
          🏎️ Speed Racer 🏎️
        </div>
        
        <div className="flex items-center justify-center h-full">
          {gameState === 'waiting' && (
            <div className="text-center space-y-4">
              <div className="text-6xl animate-pulse">⏳</div>
              <h3 className="text-2xl font-bold text-blue-700">Get Ready...</h3>
              <p className="text-lg text-blue-600">Wait for the signal!</p>
            </div>
          )}
          
          {gameState === 'ready' && (
            <div className="text-center space-y-4">
              <div className="text-8xl animate-bounce text-yellow-500">🚦</div>
              <h3 className="text-3xl font-bold text-yellow-600">GET READY!</h3>
              <p className="text-lg text-yellow-500">Click when you see GO!</p>
              <Button 
                size="lg" 
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={startTest}
              >
                <Zap className="h-6 w-6 mr-2" />
                Start Test
              </Button>
            </div>
          )}
          
          {gameState === 'go' && (
            <div className="text-center space-y-4">
              <div className="text-8xl animate-pulse text-green-500">🏁</div>
              <h3 className="text-4xl font-bold text-green-600 animate-pulse">GO!</h3>
              <p className="text-lg text-green-500">Click NOW!</p>
              <Button 
                size="lg" 
                className="bg-green-500 hover:bg-green-600 text-white animate-pulse"
                onClick={handleUserClick}
              >
                <Zap className="h-6 w-6 mr-2" />
                CLICK!
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Reaction Time Display */}
      {reactionTimes.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Average Reaction Time</span>
            <span>{getAverageReactionTime()}ms</span>
          </div>
          <Progress 
            value={Math.min(100, (1000 - getAverageReactionTime()) / 10)} 
            className="h-2" 
          />
          <p className="text-xs text-muted-foreground text-center">
            {getAverageReactionTime() < 200 && "Lightning fast! ⚡"}
            {getAverageReactionTime() >= 200 && getAverageReactionTime() < 300 && "Great speed! 🏎️"}
            {getAverageReactionTime() >= 300 && getAverageReactionTime() < 500 && "Good timing! 👍"}
            {getAverageReactionTime() >= 500 && "Keep practicing! 💪"}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={initializeGame}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Restart
        </Button>
        <Button variant="ghost" onClick={onExit}>
          <Home className="h-4 w-4 mr-2" />
          Exit Game
        </Button>
      </div>
    </div>
  );
};

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, RotateCcw, Home } from "lucide-react";
import { toast } from "sonner";

interface FocusForestGameProps {
  onGameComplete: (score: number, stars: number) => void;
  onExit: () => void;
}

interface Animal {
  id: number;
  emoji: string;
  x: number;
  y: number;
  isVisible: boolean;
  isTarget: boolean;
  speed: number;
}

const ANIMALS = ['🐰', '🐿️', '🦊', '🐻', '🦌', '🐺', '🦉', '🐸'];
const TARGET_ANIMAL = '🐰'; // Rabbit is the target

export const FocusForestGame = ({ onGameComplete, onExit }: FocusForestGameProps) => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(90); // 1.5 minutes
  const [gameState, setGameState] = useState<'playing' | 'completed' | 'gameover'>('playing');
  const [level, setLevel] = useState(1);
  const [targetsFound, setTargetsFound] = useState(0);
  const [distractionsClicked, setDistractionsClicked] = useState(0);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
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

  // Move animals
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setAnimals(prev => prev.map(animal => ({
          ...animal,
          x: Math.random() * 80 + 10, // Random position
          y: Math.random() * 60 + 20,
          isVisible: Math.random() > 0.3 // 70% chance to be visible
        })));
      }, 2000); // Move every 2 seconds
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Spawn new animals
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        spawnAnimal();
      }, 3000); // Spawn every 3 seconds
    }
    return () => clearInterval(interval);
  }, [gameState, level]);

  const initializeGame = () => {
    setAnimals([]);
    setScore(0);
    setLives(3);
    setTimeLeft(90);
    setGameState('playing');
    setLevel(1);
    setTargetsFound(0);
    setDistractionsClicked(0);
    
    // Spawn initial animals
    for (let i = 0; i < 3; i++) {
      spawnAnimal();
    }
  };

  const spawnAnimal = () => {
    const isTarget = Math.random() < 0.3; // 30% chance to be target
    const animalEmoji = isTarget ? TARGET_ANIMAL : ANIMALS[Math.floor(Math.random() * (ANIMALS.length - 1))];
    
    const newAnimal: Animal = {
      id: Date.now() + Math.random(),
      emoji: animalEmoji,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      isVisible: true,
      isTarget,
      speed: 1 + (level * 0.2)
    };

    setAnimals(prev => [...prev, newAnimal]);

    // Remove old animals (keep only last 8)
    setTimeout(() => {
      setAnimals(prev => prev.slice(-8));
    }, 5000);
  };

  const handleAnimalClick = (animalId: number) => {
    if (gameState !== 'playing') return;

    const animal = animals.find(a => a.id === animalId);
    if (!animal || !animal.isVisible) return;

    // Hide the clicked animal
    setAnimals(prev => prev.map(a => 
      a.id === animalId ? { ...a, isVisible: false } : a
    ));

    if (animal.isTarget) {
      // Correct target clicked
      setScore(prev => prev + 100);
      setTargetsFound(prev => prev + 1);
      toast("Great focus! Found the rabbit! 🐰");
      
      // Level up every 5 targets
      if ((targetsFound + 1) % 5 === 0) {
        setLevel(prev => prev + 1);
        toast(`Level ${level + 1}! Animals are moving faster! 🚀`);
      }
    } else {
      // Wrong animal clicked
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameState('gameover');
        }
        return newLives;
      });
      setDistractionsClicked(prev => prev + 1);
      toast("Oops! That's not the rabbit! Focus better! 🎯");
    }
  };

  const calculateFinalScore = () => {
    const levelBonus = level * 50;
    const focusBonus = Math.max(0, (targetsFound - distractionsClicked) * 25);
    const timeBonus = Math.max(0, timeLeft * 2);
    const finalScore = score + levelBonus + focusBonus + timeBonus;
    
    let stars = 0;
    if (finalScore >= 2000) stars = 3;
    else if (finalScore >= 1500) stars = 2;
    else if (finalScore >= 1000) stars = 1;
    
    onGameComplete(finalScore, stars);
  };

  const getStarsEarned = () => {
    const levelBonus = level * 50;
    const focusBonus = Math.max(0, (targetsFound - distractionsClicked) * 25);
    const timeBonus = Math.max(0, timeLeft * 2);
    const finalScore = score + levelBonus + focusBonus + timeBonus;
    
    if (finalScore >= 2000) return 3;
    if (finalScore >= 1500) return 2;
    if (finalScore >= 1000) return 1;
    return 0;
  };

  if (gameState === 'completed') {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl">🌳</div>
        <h2 className="text-3xl font-bold text-success">Forest Saved!</h2>
        <p className="text-lg">You helped all the rabbits find safety!</p>
        
        <div className="space-y-4">
          <div className="text-2xl font-bold text-primary">
            Final Score: {score + (level * 50) + Math.max(0, (targetsFound - distractionsClicked) * 25) + Math.max(0, timeLeft * 2)}
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
              <div className="font-bold">{level}</div>
              <div className="text-muted-foreground">Level</div>
            </div>
            <div className="bg-success/10 p-3 rounded">
              <div className="font-bold">{targetsFound}</div>
              <div className="text-muted-foreground">Rabbits Found</div>
            </div>
            <div className="bg-warning/10 p-3 rounded">
              <div className="font-bold">{distractionsClicked}</div>
              <div className="text-muted-foreground">Distractions</div>
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
        <div className="text-6xl">😢</div>
        <h2 className="text-3xl font-bold text-destructive">Game Over!</h2>
        <p className="text-lg">You lost all your lives!</p>
        
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
          <div className="text-lg font-bold text-success">{targetsFound}</div>
          <div className="text-xs text-muted-foreground">Found</div>
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
          🎯 Find the rabbits (🐰) but avoid other animals!
        </Badge>
        <p className="text-sm text-muted-foreground">
          Click only on rabbits to help them find safety in the forest!
        </p>
      </div>

      {/* Game Area */}
      <div className="relative bg-gradient-to-b from-green-100 to-green-200 rounded-lg p-6 min-h-[400px] border-2 border-green-300">
        <div className="absolute top-2 left-2 text-sm font-medium text-green-800">
          🌲 Focus Forest 🌲
        </div>
        
        {animals.map((animal) => (
          animal.isVisible && (
            <div
              key={animal.id}
              className="absolute cursor-pointer transition-all duration-300 hover:scale-125"
              style={{
                left: `${animal.x}%`,
                top: `${animal.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => handleAnimalClick(animal.id)}
            >
              <div className={`text-4xl ${animal.isTarget ? 'animate-bounce' : ''}`}>
                {animal.emoji}
              </div>
            </div>
          )
        ))}
        
        {animals.length === 0 && (
          <div className="flex items-center justify-center h-full text-green-600">
            <div className="text-center">
              <div className="text-6xl mb-4">🌲</div>
              <p className="text-lg">Animals are coming...</p>
            </div>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Focus Progress</span>
          <span>{Math.round((targetsFound / Math.max(targetsFound + distractionsClicked, 1)) * 100)}%</span>
        </div>
        <Progress value={(targetsFound / Math.max(targetsFound + distractionsClicked, 1)) * 100} className="h-2" />
      </div>

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

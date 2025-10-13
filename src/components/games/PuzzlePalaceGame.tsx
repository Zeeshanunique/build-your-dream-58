import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, RotateCcw, Home, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface PuzzlePalaceGameProps {
  onGameComplete: (score: number, stars: number) => void;
  onExit: () => void;
}

interface Puzzle {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const PUZZLES: Puzzle[] = [
  {
    id: 1,
    question: "What comes next in the pattern: 🟢, 🔴, 🟢, 🔴, ?",
    options: ["🟢", "🔴", "🟡", "🔵"],
    correctAnswer: 0,
    explanation: "The pattern alternates between green and red circles.",
    difficulty: 'easy'
  },
  {
    id: 2,
    question: "If 2 + 2 = 4, and 3 + 3 = 6, what does 4 + 4 equal?",
    options: ["6", "7", "8", "9"],
    correctAnswer: 2,
    explanation: "Each number added to itself equals double that number.",
    difficulty: 'easy'
  },
  {
    id: 3,
    question: "Which shape has 4 equal sides?",
    options: ["Triangle", "Circle", "Square", "Rectangle"],
    correctAnswer: 2,
    explanation: "A square has 4 equal sides and 4 right angles.",
    difficulty: 'easy'
  },
  {
    id: 4,
    question: "What number is missing: 1, 3, 5, ?, 9",
    options: ["6", "7", "8", "4"],
    correctAnswer: 1,
    explanation: "This is a sequence of odd numbers: 1, 3, 5, 7, 9.",
    difficulty: 'medium'
  },
  {
    id: 5,
    question: "If a cat has 4 legs, how many legs do 3 cats have?",
    options: ["8", "10", "12", "14"],
    correctAnswer: 2,
    explanation: "3 cats × 4 legs each = 12 legs total.",
    difficulty: 'medium'
  },
  {
    id: 6,
    question: "Which word doesn't belong: Apple, Banana, Carrot, Orange",
    options: ["Apple", "Banana", "Carrot", "Orange"],
    correctAnswer: 2,
    explanation: "Carrot is a vegetable, while the others are fruits.",
    difficulty: 'medium'
  },
  {
    id: 7,
    question: "What is 15 - 7?",
    options: ["6", "7", "8", "9"],
    correctAnswer: 2,
    explanation: "15 minus 7 equals 8.",
    difficulty: 'easy'
  },
  {
    id: 8,
    question: "Complete the pattern: A, C, E, G, ?",
    options: ["H", "I", "J", "K"],
    correctAnswer: 1,
    explanation: "This skips every other letter: A, C, E, G, I.",
    difficulty: 'hard'
  },
  {
    id: 9,
    question: "If today is Monday, what day will it be in 3 days?",
    options: ["Tuesday", "Wednesday", "Thursday", "Friday"],
    correctAnswer: 2,
    explanation: "Monday + 3 days = Thursday.",
    difficulty: 'medium'
  },
  {
    id: 10,
    question: "What is half of 20?",
    options: ["8", "9", "10", "11"],
    correctAnswer: 2,
    explanation: "Half of 20 is 10.",
    difficulty: 'easy'
  }
];

export const PuzzlePalaceGame = ({ onGameComplete, onExit }: PuzzlePalaceGameProps) => {
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<'playing' | 'completed' | 'gameover'>('playing');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0 && !showResult) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft, showResult]);

  const initializeGame = () => {
    setPuzzleIndex(0);
    setScore(0);
    setLives(3);
    setTimeLeft(30);
    setGameState('playing');
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectAnswers(0);
    setTotalAnswered(0);
    loadNextPuzzle();
  };

  const loadNextPuzzle = () => {
    if (puzzleIndex >= PUZZLES.length) {
      setGameState('completed');
      calculateFinalScore();
      return;
    }
    
    setCurrentPuzzle(PUZZLES[puzzleIndex]);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult || gameState !== 'playing') return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    setTotalAnswered(prev => prev + 1);
    
    const isCorrect = answerIndex === currentPuzzle?.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => {
        const difficultyMultiplier = currentPuzzle?.difficulty === 'easy' ? 1 : 
                                   currentPuzzle?.difficulty === 'medium' ? 1.5 : 2;
        return prev + Math.round(100 * difficultyMultiplier);
      });
      setCorrectAnswers(prev => prev + 1);
      toast("Correct! Great thinking! 🧠✨");
    } else {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameState('gameover');
        }
        return newLives;
      });
      toast(`Wrong! The answer was: ${currentPuzzle?.options[currentPuzzle.correctAnswer]} 💭`);
    }
    
    // Move to next puzzle after 2 seconds
    setTimeout(() => {
      setPuzzleIndex(prev => prev + 1);
      loadNextPuzzle();
    }, 2000);
  };

  const handleTimeUp = () => {
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setGameState('gameover');
      }
      return newLives;
    });
    setTotalAnswered(prev => prev + 1);
    toast("Time's up! Moving to next puzzle ⏰");
    
    setTimeout(() => {
      setPuzzleIndex(prev => prev + 1);
      loadNextPuzzle();
    }, 1000);
  };

  const calculateFinalScore = () => {
    const accuracyBonus = Math.round((correctAnswers / Math.max(totalAnswered, 1)) * 500);
    const completionBonus = correctAnswers * 100;
    const finalScore = score + accuracyBonus + completionBonus;
    
    let stars = 0;
    if (finalScore >= 2000) stars = 3;
    else if (finalScore >= 1500) stars = 2;
    else if (finalScore >= 1000) stars = 1;
    
    onGameComplete(finalScore, stars);
  };

  const getStarsEarned = () => {
    const accuracyBonus = Math.round((correctAnswers / Math.max(totalAnswered, 1)) * 500);
    const completionBonus = correctAnswers * 100;
    const finalScore = score + accuracyBonus + completionBonus;
    
    if (finalScore >= 2000) return 3;
    if (finalScore >= 1500) return 2;
    if (finalScore >= 1000) return 1;
    return 0;
  };

  if (gameState === 'completed') {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl">🏰</div>
        <h2 className="text-3xl font-bold text-success">Palace Master!</h2>
        <p className="text-lg">You solved all the puzzles!</p>
        
        <div className="space-y-4">
          <div className="text-2xl font-bold text-primary">
            Final Score: {score + Math.round((correctAnswers / Math.max(totalAnswered, 1)) * 500) + (correctAnswers * 100)}
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
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-primary/10 p-3 rounded">
              <div className="font-bold">{correctAnswers}</div>
              <div className="text-muted-foreground">Correct</div>
            </div>
            <div className="bg-success/10 p-3 rounded">
              <div className="font-bold">{Math.round((correctAnswers / Math.max(totalAnswered, 1)) * 100)}%</div>
              <div className="text-muted-foreground">Accuracy</div>
            </div>
            <div className="bg-warning/10 p-3 rounded">
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

  if (!currentPuzzle) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">🏰</div>
        <p>Loading puzzle...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center p-3 bg-primary/10 rounded-lg">
          <div className="text-lg font-bold text-primary">{score}</div>
          <div className="text-xs text-muted-foreground">Score</div>
        </div>
        <div className="text-center p-3 bg-success/10 rounded-lg">
          <div className="text-lg font-bold text-success">{correctAnswers}</div>
          <div className="text-xs text-muted-foreground">Correct</div>
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
          <div className="text-lg font-bold text-warning">{timeLeft}s</div>
          <div className="text-xs text-muted-foreground">Time</div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{puzzleIndex + 1} / {PUZZLES.length}</span>
        </div>
        <Progress value={((puzzleIndex + 1) / PUZZLES.length) * 100} className="h-2" />
      </div>

      {/* Puzzle Card */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {currentPuzzle.difficulty.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Puzzle {puzzleIndex + 1} of {PUZZLES.length}
              </span>
            </div>
            
            <h3 className="text-xl font-bold">{currentPuzzle.question}</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {currentPuzzle.options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswer === index ? 
                    (index === currentPuzzle.correctAnswer ? "default" : "destructive") : 
                    "outline"
                  }
                  className={`h-12 text-sm ${
                    showResult && index === currentPuzzle.correctAnswer 
                      ? 'bg-success text-white' 
                      : ''
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                >
                  <div className="flex items-center space-x-2">
                    {showResult && index === currentPuzzle.correctAnswer && (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    {showResult && selectedAnswer === index && index !== currentPuzzle.correctAnswer && (
                      <XCircle className="h-4 w-4" />
                    )}
                    <span>{option}</span>
                  </div>
                </Button>
              ))}
            </div>
            
            {showResult && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Explanation:</strong> {currentPuzzle.explanation}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Choose the correct answer before time runs out!</p>
        <p>Each puzzle has a different difficulty level.</p>
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

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, RotateCcw, Home, Brain, Target, Zap } from "lucide-react";
import { toast } from "sonner";

interface BrainBoostGameProps {
  onGameComplete: (score: number, stars: number) => void;
  onExit: () => void;
}

interface Challenge {
  id: number;
  type: 'memory' | 'attention' | 'processing' | 'logic';
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  timeLimit: number;
  points: number;
}

const CHALLENGES: Challenge[] = [
  // Memory Challenges
  {
    id: 1,
    type: 'memory',
    question: 'Remember this sequence: 🟢🔴🟡🔵. What was the second color?',
    options: ['🟢', '🔴', '🟡', '🔵'],
    correctAnswer: 1,
    explanation: 'The second color in the sequence was red (🔴).',
    timeLimit: 10,
    points: 50
  },
  {
    id: 2,
    type: 'memory',
    question: 'Remember: Apple, Banana, Cherry. Which fruit was mentioned first?',
    options: ['Apple', 'Banana', 'Cherry', 'Orange'],
    correctAnswer: 0,
    explanation: 'Apple was mentioned first in the sequence.',
    timeLimit: 8,
    points: 50
  },
  
  // Attention Challenges
  {
    id: 3,
    type: 'attention',
    question: 'Count how many times the letter "A" appears: BANANA',
    options: ['1', '2', '3', '4'],
    correctAnswer: 2,
    explanation: 'The letter "A" appears 3 times in BANANA.',
    timeLimit: 15,
    points: 60
  },
  {
    id: 4,
    type: 'attention',
    question: 'Find the odd one out: 🐶🐱🐭🐸🐹',
    options: ['🐶', '🐱', '🐭', '🐸', '🐹'],
    correctAnswer: 3,
    explanation: '🐸 (frog) is the only amphibian, while others are mammals.',
    timeLimit: 12,
    points: 60
  },
  
  // Processing Speed Challenges
  {
    id: 5,
    type: 'processing',
    question: 'What is 7 + 5?',
    options: ['10', '11', '12', '13'],
    correctAnswer: 2,
    explanation: '7 + 5 = 12',
    timeLimit: 5,
    points: 40
  },
  {
    id: 6,
    type: 'processing',
    question: 'Which number is larger: 15 or 23?',
    options: ['15', '23', 'Equal', 'Cannot tell'],
    correctAnswer: 1,
    explanation: '23 is larger than 15.',
    timeLimit: 5,
    points: 40
  },
  
  // Logic Challenges
  {
    id: 7,
    type: 'logic',
    question: 'If all cats are animals, and Fluffy is a cat, then Fluffy is...',
    options: ['A dog', 'An animal', 'A bird', 'A fish'],
    correctAnswer: 1,
    explanation: 'If all cats are animals and Fluffy is a cat, then Fluffy is an animal.',
    timeLimit: 20,
    points: 80
  },
  {
    id: 8,
    type: 'logic',
    question: 'Complete the pattern: 2, 4, 6, 8, ?',
    options: ['9', '10', '11', '12'],
    correctAnswer: 1,
    explanation: 'The pattern increases by 2 each time: 2, 4, 6, 8, 10.',
    timeLimit: 15,
    points: 80
  }
];

export const BrainBoostGame = ({ onGameComplete, onExit }: BrainBoostGameProps) => {
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'completed' | 'gameover'>('playing');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [challengeStats, setChallengeStats] = useState({
    memory: 0,
    attention: 0,
    processing: 0,
    logic: 0
  });

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  // Challenge timer
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
    setChallengeIndex(0);
    setScore(0);
    setLives(3);
    setGameState('playing');
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectAnswers(0);
    setTotalAnswered(0);
    setChallengeStats({ memory: 0, attention: 0, processing: 0, logic: 0 });
    loadNextChallenge();
  };

  const loadNextChallenge = () => {
    if (challengeIndex >= CHALLENGES.length) {
      setGameState('completed');
      calculateFinalScore();
      return;
    }
    
    const challenge = CHALLENGES[challengeIndex];
    setCurrentChallenge(challenge);
    setTimeLeft(challenge.timeLimit);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult || gameState !== 'playing' || !currentChallenge) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    setTotalAnswered(prev => prev + 1);
    
    const isCorrect = answerIndex === currentChallenge.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + currentChallenge.points);
      setCorrectAnswers(prev => prev + 1);
      setChallengeStats(prev => ({
        ...prev,
        [currentChallenge.type]: prev[currentChallenge.type] + 1
      }));
      toast(`Correct! +${currentChallenge.points} points! 🧠✨`);
    } else {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameState('gameover');
        }
        return newLives;
      });
      toast(`Wrong! The answer was: ${currentChallenge.options?.[currentChallenge.correctAnswer as number]} 💭`);
    }
    
    // Move to next challenge after 2 seconds
    setTimeout(() => {
      setChallengeIndex(prev => prev + 1);
      loadNextChallenge();
    }, 2000);
  };

  const handleTimeUp = () => {
    if (!currentChallenge) return;
    
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setGameState('gameover');
      }
      return newLives;
    });
    setTotalAnswered(prev => prev + 1);
    toast("Time's up! Moving to next challenge ⏰");
    
    setTimeout(() => {
      setChallengeIndex(prev => prev + 1);
      loadNextChallenge();
    }, 1000);
  };

  const calculateFinalScore = () => {
    const accuracyBonus = Math.round((correctAnswers / Math.max(totalAnswered, 1)) * 500);
    const completionBonus = correctAnswers * 100;
    const skillBonus = Object.values(challengeStats).reduce((sum, count) => sum + count * 50, 0);
    const finalScore = score + accuracyBonus + completionBonus + skillBonus;
    
    let stars = 0;
    if (finalScore >= 3000) stars = 3;
    else if (finalScore >= 2000) stars = 2;
    else if (finalScore >= 1000) stars = 1;
    
    onGameComplete(finalScore, stars);
  };

  const getStarsEarned = () => {
    const accuracyBonus = Math.round((correctAnswers / Math.max(totalAnswered, 1)) * 500);
    const completionBonus = correctAnswers * 100;
    const skillBonus = Object.values(challengeStats).reduce((sum, count) => sum + count * 50, 0);
    const finalScore = score + accuracyBonus + completionBonus + skillBonus;
    
    if (finalScore >= 3000) return 3;
    if (finalScore >= 2000) return 2;
    if (finalScore >= 1000) return 1;
    return 0;
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'memory': return '🧠';
      case 'attention': return '👁️';
      case 'processing': return '⚡';
      case 'logic': return '🧩';
      default: return '🎯';
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'memory': return 'purple';
      case 'attention': return 'blue';
      case 'processing': return 'green';
      case 'logic': return 'orange';
      default: return 'gray';
    }
  };

  if (gameState === 'completed') {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl">🧠</div>
        <h2 className="text-3xl font-bold text-success">Brain Boost Complete!</h2>
        <p className="text-lg">You've trained all your cognitive skills!</p>
        
        <div className="space-y-4">
          <div className="text-2xl font-bold text-primary">
            Final Score: {score + Math.round((correctAnswers / Math.max(totalAnswered, 1)) * 500) + (correctAnswers * 100) + Object.values(challengeStats).reduce((sum, count) => sum + count * 50, 0)}
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
            <div className="bg-purple/10 p-3 rounded">
              <div className="font-bold">{challengeStats.memory}</div>
              <div className="text-muted-foreground">Memory</div>
            </div>
            <div className="bg-blue/10 p-3 rounded">
              <div className="font-bold">{challengeStats.attention}</div>
              <div className="text-muted-foreground">Attention</div>
            </div>
            <div className="bg-green/10 p-3 rounded">
              <div className="font-bold">{challengeStats.processing}</div>
              <div className="text-muted-foreground">Processing</div>
            </div>
            <div className="bg-orange/10 p-3 rounded">
              <div className="font-bold">{challengeStats.logic}</div>
              <div className="text-muted-foreground">Logic</div>
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

  if (!currentChallenge) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">🧠</div>
        <p>Loading challenge...</p>
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
          <span>{challengeIndex + 1} / {CHALLENGES.length}</span>
        </div>
        <Progress value={((challengeIndex + 1) / CHALLENGES.length) * 100} className="h-2" />
      </div>

      {/* Challenge Card */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {getChallengeTypeIcon(currentChallenge.type)} {currentChallenge.type.toUpperCase()}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {currentChallenge.points} pts
              </Badge>
              <span className="text-sm text-muted-foreground">
                Challenge {challengeIndex + 1} of {CHALLENGES.length}
              </span>
            </div>
            
            <h3 className="text-xl font-bold">{currentChallenge.question}</h3>
            
            {currentChallenge.options && (
              <div className="grid grid-cols-2 gap-3">
                {currentChallenge.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? 
                      (index === currentChallenge.correctAnswer ? "default" : "destructive") : 
                      "outline"
                    }
                    className={`h-12 text-sm ${
                      showResult && index === currentChallenge.correctAnswer 
                        ? 'bg-success text-white' 
                        : ''
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                  >
                    <div className="flex items-center space-x-2">
                      {showResult && index === currentChallenge.correctAnswer && (
                        <Target className="h-4 w-4" />
                      )}
                      {showResult && selectedAnswer === index && index !== currentChallenge.correctAnswer && (
                        <Zap className="h-4 w-4" />
                      )}
                      <span>{option}</span>
                    </div>
                  </Button>
                ))}
              </div>
            )}
            
            {showResult && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Explanation:</strong> {currentChallenge.explanation}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skill Progress */}
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(challengeStats).map(([skill, count]) => (
          <div key={skill} className="text-center p-2 bg-muted/30 rounded">
            <div className="text-sm font-bold">{getChallengeTypeIcon(skill)} {count}</div>
            <div className="text-xs text-muted-foreground capitalize">{skill}</div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Complete all cognitive challenges to boost your brain power!</p>
        <p>Each challenge tests a different mental skill.</p>
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

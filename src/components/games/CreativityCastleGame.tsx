import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, RotateCcw, Home, Palette, Wand2 } from "lucide-react";
import { toast } from "sonner";

interface CreativityCastleGameProps {
  onGameComplete: (score: number, stars: number) => void;
  onExit: () => void;
}

interface CreativeChallenge {
  id: number;
  type: 'drawing' | 'story' | 'pattern' | 'rhyme';
  prompt: string;
  examples: string[];
  timeLimit: number;
  points: number;
  creativityCriteria: string[];
}

const CREATIVE_CHALLENGES: CreativeChallenge[] = [
  {
    id: 1,
    type: 'drawing',
    prompt: 'Draw a house using only circles and squares!',
    examples: ['🏠', '⭕⬜', '🔴🟦'],
    timeLimit: 60,
    points: 100,
    creativityCriteria: ['Uses only circles and squares', 'Creative arrangement', 'Clear house shape']
  },
  {
    id: 2,
    type: 'story',
    prompt: 'Create a story about a magical cat in 3 sentences!',
    examples: ['Once upon a time...', 'The cat had powers...', 'And they lived happily...'],
    timeLimit: 90,
    points: 120,
    creativityCriteria: ['Includes magical elements', 'Has a beginning, middle, end', 'Creative plot']
  },
  {
    id: 3,
    type: 'pattern',
    prompt: 'Create a pattern using these shapes: ⭐🟢⭐🟢⭐',
    examples: ['⭐🟢⭐🟢⭐🟢', '⭐🟢⭐🟢⭐🟢⭐', '⭐🟢⭐🟢⭐🟢⭐🟢'],
    timeLimit: 45,
    points: 80,
    creativityCriteria: ['Follows the pattern', 'Continues logically', 'Creative extension']
  },
  {
    id: 4,
    type: 'rhyme',
    prompt: 'Make a rhyme about a happy dog!',
    examples: ['A happy dog named Spot', 'Who likes to play a lot', 'He runs and jumps and hops'],
    timeLimit: 60,
    points: 100,
    creativityCriteria: ['Rhyming words', 'About a happy dog', 'Creative word choice']
  },
  {
    id: 5,
    type: 'drawing',
    prompt: 'Draw a robot using only triangles!',
    examples: ['🤖', '🔺🔻', '⬛🔺'],
    timeLimit: 60,
    points: 100,
    creativityCriteria: ['Uses only triangles', 'Looks like a robot', 'Creative design']
  },
  {
    id: 6,
    type: 'story',
    prompt: 'Tell a story about a flying elephant in 2 sentences!',
    examples: ['The elephant learned to fly...', 'Now it visits the sky!'],
    timeLimit: 75,
    points: 110,
    creativityCriteria: ['Includes flying elephant', 'Complete story', 'Imaginative details']
  }
];

export const CreativityCastleGame = ({ onGameComplete, onExit }: CreativityCastleGameProps) => {
  const [currentChallenge, setCurrentChallenge] = useState<CreativeChallenge | null>(null);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'completed' | 'gameover'>('playing');
  const [userResponse, setUserResponse] = useState('');
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [challengesCompleted, setChallengesCompleted] = useState(0);
  const [creativityScore, setCreativityScore] = useState(0);
  const [challengeStats, setChallengeStats] = useState({
    drawing: 0,
    story: 0,
    pattern: 0,
    rhyme: 0
  });

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  // Challenge timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0 && !showEvaluation) {
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
  }, [gameState, timeLeft, showEvaluation]);

  const initializeGame = () => {
    setChallengeIndex(0);
    setScore(0);
    setGameState('playing');
    setUserResponse('');
    setShowEvaluation(false);
    setChallengesCompleted(0);
    setCreativityScore(0);
    setChallengeStats({ drawing: 0, story: 0, pattern: 0, rhyme: 0 });
    loadNextChallenge();
  };

  const loadNextChallenge = () => {
    if (challengeIndex >= CREATIVE_CHALLENGES.length) {
      setGameState('completed');
      calculateFinalScore();
      return;
    }
    
    const challenge = CREATIVE_CHALLENGES[challengeIndex];
    setCurrentChallenge(challenge);
    setTimeLeft(challenge.timeLimit);
    setUserResponse('');
    setShowEvaluation(false);
  };

  const handleSubmitResponse = () => {
    if (!userResponse.trim() || !currentChallenge) return;
    
    setShowEvaluation(true);
    
    // Evaluate creativity based on response length and content
    const responseLength = userResponse.trim().length;
    const wordCount = userResponse.trim().split(/\s+/).length;
    
    let points = 0;
    let creativityPoints = 0;
    
    // Base points for attempting
    points += 20;
    
    // Length bonus
    if (responseLength > 10) points += 20;
    if (responseLength > 30) points += 20;
    if (responseLength > 50) points += 20;
    
    // Word count bonus for story/rhyme challenges
    if ((currentChallenge.type === 'story' || currentChallenge.type === 'rhyme') && wordCount > 5) {
      points += 30;
    }
    
    // Creativity bonus for unique responses
    if (responseLength > 20) {
      creativityPoints = Math.min(50, Math.floor(responseLength / 2));
    }
    
    const totalPoints = points + creativityPoints;
    setScore(prev => prev + totalPoints);
    setCreativityScore(prev => prev + creativityPoints);
    setChallengesCompleted(prev => prev + 1);
    setChallengeStats(prev => ({
      ...prev,
      [currentChallenge.type]: prev[currentChallenge.type] + 1
    }));
    
    toast(`Creative response! +${totalPoints} points! 🎨✨`);
    
    // Move to next challenge after 3 seconds
    setTimeout(() => {
      setChallengeIndex(prev => prev + 1);
      loadNextChallenge();
    }, 3000);
  };

  const handleTimeUp = () => {
    if (!currentChallenge) return;
    
    toast("Time's up! Moving to next challenge ⏰");
    
    setTimeout(() => {
      setChallengeIndex(prev => prev + 1);
      loadNextChallenge();
    }, 1000);
  };

  const calculateFinalScore = () => {
    const completionBonus = challengesCompleted * 100;
    const creativityBonus = creativityScore;
    const varietyBonus = Object.values(challengeStats).filter(count => count > 0).length * 50;
    const finalScore = score + completionBonus + creativityBonus + varietyBonus;
    
    let stars = 0;
    if (finalScore >= 2000) stars = 3;
    else if (finalScore >= 1500) stars = 2;
    else if (finalScore >= 1000) stars = 1;
    
    onGameComplete(finalScore, stars);
  };

  const getStarsEarned = () => {
    const completionBonus = challengesCompleted * 100;
    const creativityBonus = creativityScore;
    const varietyBonus = Object.values(challengeStats).filter(count => count > 0).length * 50;
    const finalScore = score + completionBonus + creativityBonus + varietyBonus;
    
    if (finalScore >= 2000) return 3;
    if (finalScore >= 1500) return 2;
    if (finalScore >= 1000) return 1;
    return 0;
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'drawing': return '🎨';
      case 'story': return '📚';
      case 'pattern': return '🔢';
      case 'rhyme': return '🎵';
      default: return '✨';
    }
  };

  const getEvaluationMessage = () => {
    if (!userResponse.trim()) return "No response submitted";
    
    const responseLength = userResponse.trim().length;
    const wordCount = userResponse.trim().split(/\s+/).length;
    
    if (responseLength < 10) return "Short but sweet! Try adding more details next time.";
    if (responseLength < 30) return "Good effort! Your creativity is showing!";
    if (responseLength < 50) return "Excellent creativity! You're really thinking outside the box!";
    return "Amazing! Your imagination knows no bounds! 🌟";
  };

  if (gameState === 'completed') {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl">🏰</div>
        <h2 className="text-3xl font-bold text-success">Castle Master!</h2>
        <p className="text-lg">You've unlocked your creative potential!</p>
        
        <div className="space-y-4">
          <div className="text-2xl font-bold text-primary">
            Final Score: {score + (challengesCompleted * 100) + creativityScore + (Object.values(challengeStats).filter(count => count > 0).length * 50)}
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
              <div className="font-bold">{challengeStats.drawing}</div>
              <div className="text-muted-foreground">Drawing</div>
            </div>
            <div className="bg-blue/10 p-3 rounded">
              <div className="font-bold">{challengeStats.story}</div>
              <div className="text-muted-foreground">Story</div>
            </div>
            <div className="bg-green/10 p-3 rounded">
              <div className="font-bold">{challengeStats.pattern}</div>
              <div className="text-muted-foreground">Pattern</div>
            </div>
            <div className="bg-orange/10 p-3 rounded">
              <div className="font-bold">{challengeStats.rhyme}</div>
              <div className="text-muted-foreground">Rhyme</div>
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

  if (!currentChallenge) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">🏰</div>
        <p>Loading creative challenge...</p>
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
          <div className="text-lg font-bold text-success">{challengesCompleted}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        <div className="text-center p-3 bg-warning/10 rounded-lg">
          <div className="text-lg font-bold text-warning">{creativityScore}</div>
          <div className="text-xs text-muted-foreground">Creativity</div>
        </div>
        <div className="text-center p-3 bg-destructive/10 rounded-lg">
          <div className="text-lg font-bold text-destructive">{timeLeft}s</div>
          <div className="text-xs text-muted-foreground">Time</div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{challengeIndex + 1} / {CREATIVE_CHALLENGES.length}</span>
        </div>
        <Progress value={((challengeIndex + 1) / CREATIVE_CHALLENGES.length) * 100} className="h-2" />
      </div>

      {/* Challenge Card */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-center items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {getChallengeTypeIcon(currentChallenge.type)} {currentChallenge.type.toUpperCase()}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {currentChallenge.points} pts
              </Badge>
              <span className="text-sm text-muted-foreground">
                Challenge {challengeIndex + 1} of {CREATIVE_CHALLENGES.length}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-center">{currentChallenge.prompt}</h3>
            
            {/* Examples */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Examples:</p>
              <div className="flex flex-wrap gap-2">
                {currentChallenge.examples.map((example, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {example}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Response Input */}
            {!showEvaluation ? (
              <div className="space-y-3">
                <textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="Type your creative response here..."
                  className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={200}
                />
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{userResponse.length}/200 characters</span>
                  <Button 
                    onClick={handleSubmitResponse}
                    disabled={!userResponse.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Submit Response
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-success/10 p-4 rounded-lg">
                  <h4 className="font-bold text-success mb-2">Your Response:</h4>
                  <p className="text-sm">{userResponse}</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">Evaluation:</h4>
                  <p className="text-sm">{getEvaluationMessage()}</p>
                </div>
              </div>
            )}
            
            {/* Creativity Criteria */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Creativity Criteria:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {currentChallenge.creativityCriteria.map((criteria, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="text-primary">•</span>
                    <span>{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>
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
        <p>Express your creativity! There are no wrong answers.</p>
        <p>Be imaginative and have fun with each challenge!</p>
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

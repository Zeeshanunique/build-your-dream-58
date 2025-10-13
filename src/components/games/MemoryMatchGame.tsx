import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, RotateCcw, Home } from "lucide-react";
import { toast } from "sonner";
import { useGameSessions } from "@/hooks/use-game-sessions";
import { useAuth } from "@/contexts/AuthContext";

interface MemoryMatchGameProps {
  onGameComplete: (score: number, stars: number) => void;
  onExit: () => void;
}

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'];

export const MemoryMatchGame = ({ onGameComplete, onExit }: MemoryMatchGameProps) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [gameState, setGameState] = useState<'playing' | 'completed' | 'timeout'>('playing');
  const [score, setScore] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  
  const { userProfile } = useAuth();
  const { createSession, completeSession } = useGameSessions(userProfile?.id);

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
            setGameState('timeout');
            calculateFinalScore().catch(console.error);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  const initializeGame = async () => {
    try {
      // Start database session
      const session = await createSession({
        game_id: 'memory-match',
        game_name: 'Memory Magic',
        cognitive_skill: 'memory',
        difficulty: 'easy'
      });
      setCurrentSessionId(session.id);
      
      // Create pairs of cards
      const gameEmojis = EMOJIS.slice(0, 8); // Use 8 pairs for 16 cards
      const cardPairs = [...gameEmojis, ...gameEmojis];
      
      // Shuffle cards
      const shuffledCards = cardPairs
        .map((emoji, index) => ({
          id: index,
          emoji,
          isFlipped: false,
          isMatched: false
        }))
        .sort(() => Math.random() - 0.5);

      setCards(shuffledCards);
      setFlippedCards([]);
      setMoves(0);
      setMatches(0);
      setTimeLeft(120);
      setGameState('playing');
      setScore(0);
    } catch (error) {
      console.error('Failed to initialize game:', error);
      toast('Failed to start game session');
    }
  };

  const handleCardClick = async (cardId: number) => {
    if (gameState !== 'playing') return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      setTimeout(() => {
        const [firstId, secondId] = newFlippedCards;
        const firstCard = cards.find(c => c.id === firstId);
        const secondCard = cards.find(c => c.id === secondId);

        if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
          // Match found!
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true, isFlipped: true }
              : c
          ));
          setMatches(prev => prev + 1);
          setScore(prev => prev + 100);
          toast("Great match! 🎉");
          
          // Check if game is complete
          if (matches + 1 === 8) {
            setGameState('completed');
            calculateFinalScore().catch(console.error);
          }
        } else {
          // No match, flip cards back
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false }
              : c
          ));
          toast("Try again! 💪");
        }
        
        setFlippedCards([]);
      }, 1000);
    }
  };

  const calculateFinalScore = async () => {
    const timeBonus = Math.max(0, timeLeft * 2);
    const moveBonus = Math.max(0, (20 - moves) * 10);
    const finalScore = score + timeBonus + moveBonus;
    
    let stars = 0;
    if (finalScore >= 2000) stars = 3;
    else if (finalScore >= 1500) stars = 2;
    else if (finalScore >= 1000) stars = 1;
    
    // Save to database
    if (currentSessionId) {
      try {
        await completeSession(currentSessionId, {
          score: finalScore,
          stars_earned: stars,
          level_reached: 1,
          game_data: JSON.stringify({
            moves,
            matches,
            timeLeft,
            timeBonus,
            moveBonus
          })
        });
      } catch (error) {
        console.error('Failed to save game session:', error);
      }
    }
    
    onGameComplete(finalScore, stars);
  };

  const getStarsEarned = () => {
    const timeBonus = Math.max(0, timeLeft * 2);
    const moveBonus = Math.max(0, (20 - moves) * 10);
    const finalScore = score + timeBonus + moveBonus;
    
    if (finalScore >= 2000) return 3;
    if (finalScore >= 1500) return 2;
    if (finalScore >= 1000) return 1;
    return 0;
  };

  if (gameState === 'completed') {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h2 className="text-3xl font-bold text-success">Congratulations!</h2>
        <p className="text-lg">You completed Memory Magic!</p>
        
        <div className="space-y-4">
          <div className="text-2xl font-bold text-primary">Final Score: {score + Math.max(0, timeLeft * 2) + Math.max(0, (20 - moves) * 10)}</div>
          
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
              <div className="font-bold">{moves}</div>
              <div className="text-muted-foreground">Moves</div>
            </div>
            <div className="bg-success/10 p-3 rounded">
              <div className="font-bold">{matches}</div>
              <div className="text-muted-foreground">Matches</div>
            </div>
            <div className="bg-warning/10 p-3 rounded">
              <div className="font-bold">{timeLeft}s</div>
              <div className="text-muted-foreground">Time Left</div>
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

  if (gameState === 'timeout') {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl">⏰</div>
        <h2 className="text-3xl font-bold text-warning">Time's Up!</h2>
        <p className="text-lg">You matched {matches} pairs!</p>
        
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
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center p-3 bg-primary/10 rounded-lg">
          <div className="text-xl font-bold text-primary">{score}</div>
          <div className="text-xs text-muted-foreground">Score</div>
        </div>
        <div className="text-center p-3 bg-success/10 rounded-lg">
          <div className="text-xl font-bold text-success">{matches}/8</div>
          <div className="text-xs text-muted-foreground">Matches</div>
        </div>
        <div className="text-center p-3 bg-warning/10 rounded-lg">
          <div className="text-xl font-bold text-warning">{moves}</div>
          <div className="text-xs text-muted-foreground">Moves</div>
        </div>
        <div className="text-center p-3 bg-destructive/10 rounded-lg">
          <div className="text-xl font-bold text-destructive">{timeLeft}s</div>
          <div className="text-xs text-muted-foreground">Time</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{Math.round((matches / 8) * 100)}%</span>
        </div>
        <Progress value={(matches / 8) * 100} className="h-2" />
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <Card
            key={card.id}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
              card.isFlipped || card.isMatched
                ? 'bg-primary/20 border-primary'
                : 'bg-muted/30 hover:bg-muted/50'
            } ${card.isMatched ? 'opacity-60' : ''}`}
            onClick={() => handleCardClick(card.id)}
          >
            <CardContent className="p-4 aspect-square flex items-center justify-center">
              <div className="text-3xl">
                {card.isFlipped || card.isMatched ? card.emoji : '❓'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Click cards to flip them and find matching pairs!</p>
        <p>Complete all 8 pairs before time runs out!</p>
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

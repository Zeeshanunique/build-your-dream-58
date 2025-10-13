import { useState, useEffect } from 'react';
import { 
  startGameSession, 
  updateGameSession, 
  getGameSessions, 
  unlockAchievement, 
  getAchievements,
  GameSession,
  GameAchievement 
} from '@/lib/game-api';

export const useGameSessions = (patientId?: number) => {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    if (!patientId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getGameSessions(patientId);
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch game sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [patientId]);

  const createSession = async (sessionData: {
    game_id: string;
    game_name: string;
    cognitive_skill: string;
    difficulty?: string;
  }) => {
    if (!patientId) throw new Error('Patient ID is required');
    
    try {
      const session = await startGameSession({
        patient_id: patientId,
        ...sessionData,
      });
      
      // Refresh sessions list
      await fetchSessions();
      
      return session;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game session');
      throw err;
    }
  };

  const completeSession = async (
    sessionId: number,
    sessionData: {
      score: number;
      stars_earned: number;
      level_reached?: number;
      game_data?: string;
    }
  ) => {
    try {
      const endTime = new Date().toISOString();
      const startTime = sessions.find(s => s.id === sessionId)?.start_time;
      const duration = startTime 
        ? Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)
        : 0;

      await updateGameSession(sessionId, {
        end_time: endTime,
        duration_seconds: duration,
        ...sessionData,
      });
      
      // Refresh sessions list
      await fetchSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete game session');
      throw err;
    }
  };

  return {
    sessions,
    loading,
    error,
    createSession,
    completeSession,
    refetch: fetchSessions,
  };
};

export const useAchievements = (patientId?: number) => {
  const [achievements, setAchievements] = useState<GameAchievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = async () => {
    if (!patientId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getAchievements(patientId);
      setAchievements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch achievements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [patientId]);

  const unlockNewAchievement = async (achievementData: {
    achievement_name: string;
    achievement_type: string;
    game_session_id?: number;
  }) => {
    if (!patientId) throw new Error('Patient ID is required');
    
    try {
      const achievement = await unlockAchievement({
        patient_id: patientId,
        ...achievementData,
      });
      
      // Refresh achievements list
      await fetchAchievements();
      
      return achievement;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock achievement');
      throw err;
    }
  };

  return {
    achievements,
    loading,
    error,
    unlockAchievement: unlockNewAchievement,
    refetch: fetchAchievements,
  };
};

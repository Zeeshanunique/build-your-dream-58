// Game session API service
const API_BASE_URL = 'http://localhost:3001/api';

export interface GameSession {
  id: number;
  patient_id: number;
  game_id: string;
  game_name: string;
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
  score: number;
  stars_earned: number;
  level_reached: number;
  difficulty: string;
  cognitive_skill: string;
  game_data?: string;
  created_at: string;
}

export interface GameAchievement {
  id: number;
  patient_id: number;
  achievement_name: string;
  achievement_type: string;
  unlocked_at: string;
  game_session_id?: number;
}

// Start a new game session
export const startGameSession = async (sessionData: {
  patient_id: number;
  game_id: string;
  game_name: string;
  cognitive_skill: string;
  difficulty?: string;
}): Promise<GameSession> => {
  const response = await fetch(`${API_BASE_URL}/game-sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...sessionData,
      start_time: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to start game session');
  }

  const result = await response.json();
  return result;
};

// Update game session with results
export const updateGameSession = async (
  sessionId: number,
  sessionData: {
    end_time?: string;
    duration_seconds?: number;
    score: number;
    stars_earned: number;
    level_reached?: number;
    game_data?: string;
  }
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/game-sessions/${sessionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sessionData),
  });

  if (!response.ok) {
    throw new Error('Failed to update game session');
  }
};

// Get game sessions for a patient
export const getGameSessions = async (patientId: number): Promise<GameSession[]> => {
  const response = await fetch(`${API_BASE_URL}/game-sessions/${patientId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch game sessions');
  }

  return response.json();
};

// Unlock an achievement
export const unlockAchievement = async (achievementData: {
  patient_id: number;
  achievement_name: string;
  achievement_type: string;
  game_session_id?: number;
}): Promise<GameAchievement> => {
  const response = await fetch(`${API_BASE_URL}/game-achievements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(achievementData),
  });

  if (!response.ok) {
    throw new Error('Failed to unlock achievement');
  }

  return response.json();
};

// Get achievements for a patient
export const getAchievements = async (patientId: number): Promise<GameAchievement[]> => {
  const response = await fetch(`${API_BASE_URL}/game-achievements/${patientId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch achievements');
  }

  return response.json();
};

// Database type definitions for Firestore

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  bio?: string;
  profilePictureURL?: string;
  subscription: 'free' | 'pro';
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  userId: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  progress: number; // 0-100
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PracticeSession {
  id: string;
  userId: string;
  lessonId?: string;
  date: Date;
  duration: number; // in minutes
  mistakesCount: number;
  correctCount: number;
  notes?: string;
  aiScore?: number; // 0-100
  createdAt: Date;
}

export interface UserAnalytics {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalPracticeTime: number; // in minutes
  totalSessions: number;
  weeklyStats: {
    week: string; // ISO week format: "2025-W01"
    practiceTime: number;
    sessions: number;
    mistakesFixed: number;
  }[];
  lastUpdated: Date;
}

export interface Achievement {
  id: string;
  userId: string;
  type: 'streak' | 'practice_time' | 'lesson_complete' | 'perfect_session' | 'milestone';
  title: string;
  description: string;
  earnedAt: Date;
  metadata?: Record<string, any>;
}

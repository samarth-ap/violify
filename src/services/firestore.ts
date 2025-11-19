import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile, Lesson, PracticeSession, UserAnalytics, Achievement } from '../types/database';

// Helper function to convert Firestore Timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return timestamp instanceof Date ? timestamp : new Date(timestamp);
};

// ============================================
// USER PROFILE OPERATIONS
// ============================================

export const createUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const userData: UserProfile = {
    uid: userId,
    displayName: data.displayName || '',
    email: data.email || '',
    phone: data.phone || '',
    bio: data.bio || '',
    profilePictureURL: data.profilePictureURL || '',
    subscription: data.subscription || 'free',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await setDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      ...data,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt)
    } as UserProfile;
  }

  return null;
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

// ============================================
// LESSON OPERATIONS
// ============================================

export const createLesson = async (userId: string, lessonData: Omit<Lesson, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const lessonRef = doc(collection(db, 'users', userId, 'lessons'));
  const lesson: Omit<Lesson, 'id'> = {
    userId,
    ...lessonData,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await setDoc(lessonRef, {
    ...lesson,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return lessonRef.id;
};

export const getUserLessons = async (userId: string, limitCount: number = 10): Promise<Lesson[]> => {
  const lessonsRef = collection(db, 'users', userId, 'lessons');
  const q = query(lessonsRef, orderBy('createdAt', 'desc'), limit(limitCount));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
      completedAt: data.completedAt ? convertTimestamp(data.completedAt) : undefined
    } as Lesson;
  });
};

export const updateLesson = async (userId: string, lessonId: string, data: Partial<Lesson>): Promise<void> => {
  const lessonRef = doc(db, 'users', userId, 'lessons', lessonId);
  await updateDoc(lessonRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const completeLesson = async (userId: string, lessonId: string): Promise<void> => {
  const lessonRef = doc(db, 'users', userId, 'lessons', lessonId);
  await updateDoc(lessonRef, {
    isCompleted: true,
    progress: 100,
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

// ============================================
// PRACTICE SESSION OPERATIONS
// ============================================

export const createPracticeSession = async (userId: string, sessionData: Omit<PracticeSession, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
  const sessionRef = doc(collection(db, 'users', userId, 'practice-sessions'));
  const session: Omit<PracticeSession, 'id'> = {
    userId,
    ...sessionData,
    createdAt: new Date()
  };

  await setDoc(sessionRef, {
    ...session,
    date: Timestamp.fromDate(sessionData.date),
    createdAt: serverTimestamp()
  });

  return sessionRef.id;
};

export const getUserPracticeSessions = async (userId: string, limitCount: number = 20): Promise<PracticeSession[]> => {
  const sessionsRef = collection(db, 'users', userId, 'practice-sessions');
  const q = query(sessionsRef, orderBy('date', 'desc'), limit(limitCount));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: convertTimestamp(data.date),
      createdAt: convertTimestamp(data.createdAt)
    } as PracticeSession;
  });
};

export const getRecentPracticeSessions = async (userId: string, days: number = 7): Promise<PracticeSession[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const sessionsRef = collection(db, 'users', userId, 'practice-sessions');
  const q = query(
    sessionsRef,
    where('date', '>=', Timestamp.fromDate(startDate)),
    orderBy('date', 'desc')
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: convertTimestamp(data.date),
      createdAt: convertTimestamp(data.createdAt)
    } as PracticeSession;
  });
};

// ============================================
// ANALYTICS OPERATIONS
// ============================================

export const getUserAnalytics = async (userId: string): Promise<UserAnalytics | null> => {
  const analyticsRef = doc(db, 'users', userId, 'analytics', 'summary');
  const analyticsSnap = await getDoc(analyticsRef);

  if (analyticsSnap.exists()) {
    const data = analyticsSnap.data();
    return {
      ...data,
      lastUpdated: convertTimestamp(data.lastUpdated),
      weeklyStats: data.weeklyStats || []
    } as UserAnalytics;
  }

  return null;
};

export const updateUserAnalytics = async (userId: string, data: Partial<UserAnalytics>): Promise<void> => {
  const analyticsRef = doc(db, 'users', userId, 'analytics', 'summary');
  await setDoc(analyticsRef, {
    ...data,
    userId,
    lastUpdated: serverTimestamp()
  }, { merge: true });
};

export const incrementStreak = async (userId: string): Promise<void> => {
  const analytics = await getUserAnalytics(userId);
  if (analytics) {
    const newStreak = analytics.currentStreak + 1;
    await updateUserAnalytics(userId, {
      currentStreak: newStreak,
      longestStreak: Math.max(analytics.longestStreak, newStreak)
    });
  }
};

// ============================================
// ACHIEVEMENT OPERATIONS
// ============================================

export const createAchievement = async (userId: string, achievementData: Omit<Achievement, 'id' | 'userId' | 'earnedAt'>): Promise<string> => {
  const achievementRef = doc(collection(db, 'users', userId, 'achievements'));
  const achievement: Omit<Achievement, 'id'> = {
    userId,
    ...achievementData,
    earnedAt: new Date()
  };

  await setDoc(achievementRef, {
    ...achievement,
    earnedAt: serverTimestamp()
  });

  return achievementRef.id;
};

export const getUserAchievements = async (userId: string, limitCount: number = 10): Promise<Achievement[]> => {
  const achievementsRef = collection(db, 'users', userId, 'achievements');
  const q = query(achievementsRef, orderBy('earnedAt', 'desc'), limit(limitCount));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      earnedAt: convertTimestamp(data.earnedAt)
    } as Achievement;
  });
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const checkIfUserExists = async (userId: string): Promise<boolean> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists();
};

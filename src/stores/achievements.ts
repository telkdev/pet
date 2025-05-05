import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Storage } from '@ionic/storage'

export type AchievementLevel = 'bronze' | 'silver' | 'gold'

export interface Achievement {
  id: string;
  name: string;
  description: string;
  level: AchievementLevel;
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt: string | null;  // Changed from optional to nullable
}

// Achievement categories for type safety
export type AchievementCategory = 
  | 'care-streak'
  | 'balanced-stats'
  | 'mood-master'
  | 'energy-efficient'
  | 'perfect-day'
  | 'milestone';

interface AchievementsState {
  achievements: Achievement[];
  streak: number;
  lastDayInteracted: string | null;
}

const MIN_PROGRESS = 0;

export const useAchievementsStore = defineStore('achievements', () => {
  const achievements = ref<Achievement[]>([
    {
      id: 'care-streak-bronze',
      name: 'Caring Beginner',
      description: 'Interact with your pet for 3 days in a row',
      level: 'bronze',
      icon: 'trophy',
      progress: 0,
      maxProgress: 3,
      unlocked: false,
      unlockedAt: null
    },
    {
      id: 'care-streak-silver',
      name: 'Caring Expert',
      description: 'Interact with your pet for 7 days in a row',
      level: 'silver',
      icon: 'trophy',
      progress: 0,
      maxProgress: 7,
      unlocked: false,
      unlockedAt: null
    },
    {
      id: 'care-streak-gold',
      name: 'Caring Master',
      description: 'Interact with your pet for 30 days in a row',
      level: 'gold',
      icon: 'trophy',
      progress: 0,
      maxProgress: 30,
      unlocked: false,
      unlockedAt: null
    },
    {
      id: 'balanced-stats-bronze',
      name: 'Balance Seeker',
      description: 'Keep all pet stats above 50% for 1 hour',
      level: 'bronze',
      icon: 'ribbon',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      unlockedAt: null
    },
    {
      id: 'balanced-stats-silver',
      name: 'Balance Keeper',
      description: 'Keep all pet stats above 70% for 2 hours',
      level: 'silver',
      icon: 'ribbon',
      progress: 0,
      maxProgress: 2,
      unlocked: false,
      unlockedAt: null
    },
    {
      id: 'balanced-stats-gold',
      name: 'Balance Master',
      description: 'Keep all pet stats above 90% for 1 hour',
      level: 'gold',
      icon: 'ribbon',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      unlockedAt: null
    },
    {
      id: 'mood-master-bronze',
      name: 'Mood Lifter',
      description: 'Keep your pet in joyful or love mood for 1 hour',
      level: 'bronze',
      icon: 'heart',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      unlockedAt: null
    },
    {
      id: 'mood-master-silver',
      name: 'Mood Expert',
      description: 'Keep your pet in joyful or love mood for 4 hours',
      level: 'silver',
      icon: 'heart',
      progress: 0,
      maxProgress: 4,
      unlocked: false,
      unlockedAt: null
    },
    {
      id: 'mood-master-gold',
      name: 'Mood Master',
      description: 'Keep your pet in joyful or love mood for 8 hours',
      level: 'gold',
      icon: 'heart',
      progress: 0,
      maxProgress: 8,
      unlocked: false,
      unlockedAt: null
    },
    {
      id: 'energy-efficient-bronze',
      name: 'Energy Saver',
      description: 'Play with your pet 3 times while keeping energy above 80%',
      level: 'bronze',
      icon: 'flash',
      progress: 0,
      maxProgress: 3,
      unlocked: false,
      unlockedAt: null
    },
    {
      id: 'energy-efficient-silver',
      name: 'Energy Pro',
      description: 'Play with your pet 10 times while keeping energy above 80%',
      level: 'silver',
      icon: 'flash',
      progress: 0,
      maxProgress: 10,
      unlocked: false,
      unlockedAt: null
    },
    {
      id: 'energy-efficient-gold',
      name: 'Energy Master',
      description: 'Play with your pet 20 times while keeping energy above 80%',
      level: 'gold',
      icon: 'flash',
      progress: 0,
      maxProgress: 20,
      unlocked: false,
      unlockedAt: null
    },
    {
      id: 'perfect-day-bronze',
      name: 'Perfect Morning',
      description: 'Maintain all stats above 90% for 4 hours',
      level: 'bronze',
      icon: 'star',
      progress: 0,
      maxProgress: 4,
      unlocked: false,
      unlockedAt: null
    },
    {
      id: 'perfect-day-silver',
      name: 'Perfect Day',
      description: 'Maintain all stats above 90% for 12 hours',
      level: 'silver',
      icon: 'star',
      progress: 0,
      maxProgress: 12,
      unlocked: false,
      unlockedAt: null
    },
    {
      id: 'perfect-day-gold',
      name: 'Perfect Week',
      description: 'Maintain all stats above 90% for 7 days',
      level: 'gold',
      icon: 'star',
      progress: 0,
      maxProgress: 168,
      unlocked: false,
      unlockedAt: null
    },
    {
      id: 'milestone-bronze',
      name: 'Happy Family',
      description: 'Unlock 5 achievements of any type',
      level: 'bronze',
      icon: 'medal',
      progress: 0,
      maxProgress: 5,
      unlocked: false,
      unlockedAt: null
    },
    {
      id: 'milestone-silver',
      name: 'Pet Enthusiast',
      description: 'Unlock 15 achievements of any type',
      level: 'silver',
      icon: 'medal',
      progress: 0,
      maxProgress: 15,
      unlocked: false,
      unlockedAt: null
    },
    {
      id: 'milestone-gold',
      name: 'Pet Legend',
      description: 'Unlock all other achievements',
      level: 'gold',
      icon: 'diamond',
      progress: 0,
      maxProgress: 17,
      unlocked: false,
      unlockedAt: null
    }
  ]);

  const streak = ref(0);
  const lastDayInteracted = ref<string | null>(null);
  const error = ref<string | null>(null);
  const isInitialized = ref(false);

  const unlockedAchievements = computed(() => 
    achievements.value.filter(a => a.unlocked)
  );

  async function initialize() {
    try {
      const storage = new Storage();
      await storage.create();
      
      const savedState = await storage.get('achievementsState');
      if (savedState) {
        achievements.value = savedState.achievements.map((achievement: Achievement) => ({
          ...achievement,
          progress: Math.max(MIN_PROGRESS, Number(achievement.progress)),
          maxProgress: Math.max(MIN_PROGRESS, Number(achievement.maxProgress))
        }));
        streak.value = Math.max(MIN_PROGRESS, Number(savedState.streak));
        lastDayInteracted.value = savedState.lastDayInteracted;
      }
      isInitialized.value = true;
      error.value = null;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to initialize achievements';
      throw e;
    }
  }

  async function save() {
    try {
      if (!isInitialized.value) {
        throw new Error('Achievements store not initialized');
      }

      const storage = new Storage();
      await storage.create();
      
      const serializableState: AchievementsState = {
        achievements: achievements.value.map(achievement => ({
          ...achievement,
          progress: Math.max(MIN_PROGRESS, Number(achievement.progress)),
          maxProgress: Math.max(MIN_PROGRESS, Number(achievement.maxProgress))
        })),
        streak: Math.max(MIN_PROGRESS, Number(streak.value)),
        lastDayInteracted: lastDayInteracted.value
      };
      
      await storage.set('achievementsState', JSON.parse(JSON.stringify(serializableState)));
      error.value = null;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to save achievements';
      throw e;
    }
  }

  function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return achievements.value.filter(a => a.id.startsWith(category));
  }

  function updateAchievementProgress(achievement: Achievement, newProgress: number) {
    achievement.progress = Math.min(achievement.maxProgress, Math.max(MIN_PROGRESS, newProgress));
    if (achievement.progress >= achievement.maxProgress && !achievement.unlocked) {
      unlockAchievement(achievement.id);
    }
  }

  function checkDayStreak(currentDate: string) {
    try {
      if (!isInitialized.value) {
        throw new Error('Achievements store not initialized');
      }

      const today = new Date(currentDate).toDateString();
      
      if (!lastDayInteracted.value) {
        streak.value = 1;
      } else {
        const lastDay = new Date(lastDayInteracted.value).toDateString();
        const dayDiff = Math.floor(
          (new Date(today).getTime() - new Date(lastDay).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        streak.value = dayDiff === 1 ? streak.value + 1 : 1;
      }
      
      lastDayInteracted.value = today;
      updateStreakAchievements();
      save();
      error.value = null;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to check day streak';
      throw e;
    }
  }

  function updateStreakAchievements() {
    const streakAchievements = getAchievementsByCategory('care-streak');
    for (const achievement of streakAchievements) {
      updateAchievementProgress(achievement, streak.value);
    }
  }

  function checkBalancedStats(stats: { hunger: number; happiness: number; energy: number; health: number }) {
    try {
      if (!isInitialized.value) {
        throw new Error('Achievements store not initialized');
      }

      const allStatsAbove90 = Object.values(stats).every(stat => stat > 90);
      const allStatsAbove70 = Object.values(stats).every(stat => stat > 70);
      const allStatsAbove50 = Object.values(stats).every(stat => stat > 50);

      if (allStatsAbove90) {
        const achievement = achievements.value.find(a => a.id === 'balanced-stats-gold');
        if (achievement && !achievement.unlocked) {
          updateAchievementProgress(achievement, achievement.progress + 1);
        }
      } else if (allStatsAbove70) {
        const achievement = achievements.value.find(a => a.id === 'balanced-stats-silver');
        if (achievement && !achievement.unlocked) {
          updateAchievementProgress(achievement, achievement.progress + 1);
        }
      } else if (allStatsAbove50) {
        const achievement = achievements.value.find(a => a.id === 'balanced-stats-bronze');
        if (achievement && !achievement.unlocked) {
          updateAchievementProgress(achievement, achievement.progress + 1);
        }
      }
      save();
      error.value = null;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to check balanced stats';
      throw e;
    }
  }

  function checkMoodStreak(mood: string) {
    try {
      if (!isInitialized.value) {
        throw new Error('Achievements store not initialized');
      }

      const isSuperHappy = mood === 'joyful' || mood === 'love';
      const moodAchievements = getAchievementsByCategory('mood-master');
      
      if (isSuperHappy) {
        for (const achievement of moodAchievements) {
          if (!achievement.unlocked) {
            updateAchievementProgress(achievement, achievement.progress + 1);
          }
        }
      } else {
        moodAchievements.forEach(a => {
          if (!a.unlocked) a.progress = MIN_PROGRESS;
        });
      }
      save();
      error.value = null;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to check mood streak';
      throw e;
    }
  }

  function checkEnergyEfficiency(energy: number) {
    try {
      if (!isInitialized.value) {
        throw new Error('Achievements store not initialized');
      }

      const energyAchievements = getAchievementsByCategory('energy-efficient');
      
      if (energy > 80) {
        for (const achievement of energyAchievements) {
          if (!achievement.unlocked) {
            updateAchievementProgress(achievement, achievement.progress + 1);
          }
        }
      }
      save();
      error.value = null;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to check energy efficiency';
      throw e;
    }
  }

  function checkPerfectDay(stats: { hunger: number; happiness: number; energy: number; health: number }) {
    try {
      if (!isInitialized.value) {
        throw new Error('Achievements store not initialized');
      }

      const allStatsAbove90 = Object.values(stats).every(stat => stat > 90);
      const perfectDayAchievements = getAchievementsByCategory('perfect-day');
      
      if (allStatsAbove90) {
        for (const achievement of perfectDayAchievements) {
          if (!achievement.unlocked) {
            updateAchievementProgress(achievement, achievement.progress + 1);
          }
        }
      } else {
        perfectDayAchievements.forEach(a => {
          if (!a.unlocked) a.progress = MIN_PROGRESS;
        });
      }
      save();
      error.value = null;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to check perfect day';
      throw e;
    }
  }

  function checkMilestones() {
    try {
      if (!isInitialized.value) {
        throw new Error('Achievements store not initialized');
      }

      const totalUnlocked = achievements.value.filter(a => a.unlocked && !a.id.startsWith('milestone')).length;
      const milestoneAchievements = getAchievementsByCategory('milestone');
      
      for (const achievement of milestoneAchievements) {
        updateAchievementProgress(achievement, totalUnlocked);
      }
      save();
      error.value = null;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to check milestones';
      throw e;
    }
  }

  function unlockAchievement(id: string) {
    try {
      if (!isInitialized.value) {
        throw new Error('Achievements store not initialized');
      }

      const achievement = achievements.value.find(a => a.id === id);
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date().toISOString();
        if (!id.startsWith('milestone')) {
          checkMilestones();
        }
        save();
      }
      error.value = null;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to unlock achievement';
      throw e;
    }
  }

  return {
    achievements,
    unlockedAchievements,
    isInitialized,
    error,
    initialize,
    checkDayStreak,
    checkBalancedStats,
    checkMoodStreak,
    checkEnergyEfficiency,
    checkPerfectDay,
    save
  }
});
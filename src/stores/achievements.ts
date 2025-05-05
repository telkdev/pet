import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Storage } from '@ionic/storage'

export interface Achievement {
  id: string;
  name: string;
  description: string;
  level: 'bronze' | 'silver' | 'gold';
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

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
      unlocked: false
    },
    {
      id: 'care-streak-silver',
      name: 'Caring Expert',
      description: 'Interact with your pet for 7 days in a row',
      level: 'silver',
      icon: 'trophy',
      progress: 0,
      maxProgress: 7,
      unlocked: false
    },
    {
      id: 'care-streak-gold',
      name: 'Caring Master',
      description: 'Interact with your pet for 30 days in a row',
      level: 'gold',
      icon: 'trophy',
      progress: 0,
      maxProgress: 30,
      unlocked: false
    },
    {
      id: 'balanced-stats-bronze',
      name: 'Balance Seeker',
      description: 'Keep all pet stats above 50% for 1 hour',
      level: 'bronze',
      icon: 'ribbon',
      progress: 0,
      maxProgress: 1,
      unlocked: false
    },
    {
      id: 'balanced-stats-silver',
      name: 'Balance Keeper',
      description: 'Keep all pet stats above 70% for 2 hours',
      level: 'silver',
      icon: 'ribbon',
      progress: 0,
      maxProgress: 2,
      unlocked: false
    },
    {
      id: 'balanced-stats-gold',
      name: 'Balance Master',
      description: 'Keep all pet stats above 90% for 1 hour',
      level: 'gold',
      icon: 'ribbon',
      progress: 0,
      maxProgress: 1,
      unlocked: false
    },
    {
      id: 'mood-master-bronze',
      name: 'Mood Lifter',
      description: 'Keep your pet in joyful or love mood for 1 hour',
      level: 'bronze',
      icon: 'heart',
      progress: 0,
      maxProgress: 1,
      unlocked: false
    },
    {
      id: 'mood-master-silver',
      name: 'Mood Expert',
      description: 'Keep your pet in joyful or love mood for 4 hours',
      level: 'silver',
      icon: 'heart',
      progress: 0,
      maxProgress: 4,
      unlocked: false
    },
    {
      id: 'mood-master-gold',
      name: 'Mood Master',
      description: 'Keep your pet in joyful or love mood for 8 hours',
      level: 'gold',
      icon: 'heart',
      progress: 0,
      maxProgress: 8,
      unlocked: false
    },
    {
      id: 'energy-efficient-bronze',
      name: 'Energy Saver',
      description: 'Play with your pet 3 times while keeping energy above 80%',
      level: 'bronze',
      icon: 'flash',
      progress: 0,
      maxProgress: 3,
      unlocked: false
    },
    {
      id: 'energy-efficient-silver',
      name: 'Energy Pro',
      description: 'Play with your pet 10 times while keeping energy above 80%',
      level: 'silver',
      icon: 'flash',
      progress: 0,
      maxProgress: 10,
      unlocked: false
    },
    {
      id: 'energy-efficient-gold',
      name: 'Energy Master',
      description: 'Play with your pet 20 times while keeping energy above 80%',
      level: 'gold',
      icon: 'flash',
      progress: 0,
      maxProgress: 20,
      unlocked: false
    },
    {
      id: 'perfect-day-bronze',
      name: 'Perfect Morning',
      description: 'Maintain all stats above 90% for 4 hours',
      level: 'bronze',
      icon: 'star',
      progress: 0,
      maxProgress: 4,
      unlocked: false
    },
    {
      id: 'perfect-day-silver',
      name: 'Perfect Day',
      description: 'Maintain all stats above 90% for 12 hours',
      level: 'silver',
      icon: 'star',
      progress: 0,
      maxProgress: 12,
      unlocked: false
    },
    {
      id: 'perfect-day-gold',
      name: 'Perfect Week',
      description: 'Maintain all stats above 90% for 7 days',
      level: 'gold',
      icon: 'star',
      progress: 0,
      maxProgress: 168,
      unlocked: false
    },
    {
      id: 'milestone-bronze',
      name: 'Happy Family',
      description: 'Unlock 5 achievements of any type',
      level: 'bronze',
      icon: 'medal',
      progress: 0,
      maxProgress: 5,
      unlocked: false
    },
    {
      id: 'milestone-silver',
      name: 'Pet Enthusiast',
      description: 'Unlock 15 achievements of any type',
      level: 'silver',
      icon: 'medal',
      progress: 0,
      maxProgress: 15,
      unlocked: false
    },
    {
      id: 'milestone-gold',
      name: 'Pet Legend',
      description: 'Unlock all other achievements',
      level: 'gold',
      icon: 'diamond',
      progress: 0,
      maxProgress: 17,
      unlocked: false
    }
  ]);

  const streak = ref(0);
  const lastDayInteracted = ref<string | null>(null);

  const unlockedAchievements = computed(() => 
    achievements.value.filter(a => a.unlocked)
  );

  async function initialize() {
    const storage = new Storage();
    await storage.create();
    
    const savedState = await storage.get('achievementsState');
    if (savedState) {
      achievements.value = savedState.achievements;
      streak.value = savedState.streak;
      lastDayInteracted.value = savedState.lastDayInteracted;
    }
  }

  async function save() {
    const storage = new Storage();
    await storage.create();
    
    // Create a serializable state object
    const serializableState = {
      achievements: achievements.value.map(achievement => ({
        ...achievement,
        unlockedAt: achievement.unlockedAt || null,
        progress: Number(achievement.progress),
        maxProgress: Number(achievement.maxProgress)
      })),
      streak: Number(streak.value),
      lastDayInteracted: lastDayInteracted.value || null
    };
    
    await storage.set('achievementsState', JSON.parse(JSON.stringify(serializableState)));
  }

  function checkDayStreak(currentDate: string) {
    const today = new Date(currentDate).toDateString();
    
    if (!lastDayInteracted.value) {
      streak.value = 1;
    } else {
      const lastDay = new Date(lastDayInteracted.value).toDateString();
      const dayDiff = Math.floor((new Date(today).getTime() - new Date(lastDay).getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        streak.value++;
      } else if (dayDiff > 1) {
        streak.value = 1;
      }
    }
    
    lastDayInteracted.value = today;
    updateStreakAchievements();
    save();
  }

  function updateStreakAchievements() {
    const streakAchievements = achievements.value.filter(a => a.id.startsWith('care-streak'));
    for (const achievement of streakAchievements) {
      achievement.progress = Math.min(streak.value, achievement.maxProgress);
      if (achievement.progress >= achievement.maxProgress && !achievement.unlocked) {
        unlockAchievement(achievement.id);
      }
    }
  }

  function checkBalancedStats(stats: { hunger: number; happiness: number; energy: number; health: number }) {
    const allStatsAbove90 = Object.values(stats).every(stat => stat > 90);
    const allStatsAbove70 = Object.values(stats).every(stat => stat > 70);
    const allStatsAbove50 = Object.values(stats).every(stat => stat > 50);

    if (allStatsAbove90) {
      const achievement = achievements.value.find(a => a.id === 'balanced-stats-gold');
      if (achievement && !achievement.unlocked) {
        achievement.progress = Math.min(achievement.progress + 1, achievement.maxProgress);
        if (achievement.progress >= achievement.maxProgress) {
          unlockAchievement(achievement.id);
        }
      }
    } else if (allStatsAbove70) {
      const achievement = achievements.value.find(a => a.id === 'balanced-stats-silver');
      if (achievement && !achievement.unlocked) {
        achievement.progress = Math.min(achievement.progress + 1, achievement.maxProgress);
        if (achievement.progress >= achievement.maxProgress) {
          unlockAchievement(achievement.id);
        }
      }
    } else if (allStatsAbove50) {
      const achievement = achievements.value.find(a => a.id === 'balanced-stats-bronze');
      if (achievement && !achievement.unlocked) {
        achievement.progress = Math.min(achievement.progress + 1, achievement.maxProgress);
        if (achievement.progress >= achievement.maxProgress) {
          unlockAchievement(achievement.id);
        }
      }
    }
    save();
  }

  function checkMoodStreak(mood: string) {
    const isSuperHappy = mood === 'joyful' || mood === 'love';
    const moodAchievements = achievements.value.filter(a => a.id.startsWith('mood-master'));
    
    if (isSuperHappy) {
      for (const achievement of moodAchievements) {
        if (!achievement.unlocked) {
          achievement.progress = Math.min(achievement.progress + 1, achievement.maxProgress);
          if (achievement.progress >= achievement.maxProgress) {
            unlockAchievement(achievement.id);
          }
        }
      }
    } else {
      moodAchievements.forEach(a => {
        if (!a.unlocked) a.progress = 0;
      });
    }
    save();
  }

  function checkEnergyEfficiency(energy: number) {
    const energyAchievements = achievements.value.filter(a => a.id.startsWith('energy-efficient'));
    
    if (energy > 80) {
      for (const achievement of energyAchievements) {
        if (!achievement.unlocked) {
          achievement.progress = Math.min(achievement.progress + 1, achievement.maxProgress);
          if (achievement.progress >= achievement.maxProgress) {
            unlockAchievement(achievement.id);
          }
        }
      }
    }
    save();
  }

  function checkPerfectDay(stats: { hunger: number; happiness: number; energy: number; health: number }) {
    const allStatsAbove90 = Object.values(stats).every(stat => stat > 90);
    const perfectDayAchievements = achievements.value.filter(a => a.id.startsWith('perfect-day'));
    
    if (allStatsAbove90) {
      for (const achievement of perfectDayAchievements) {
        if (!achievement.unlocked) {
          achievement.progress = Math.min(achievement.progress + 1, achievement.maxProgress);
          if (achievement.progress >= achievement.maxProgress) {
            unlockAchievement(achievement.id);
          }
        }
      }
    } else {
      perfectDayAchievements.forEach(a => {
        if (!a.unlocked) a.progress = 0;
      });
    }
    save();
  }

  function checkMilestones() {
    const totalUnlocked = achievements.value.filter(a => a.unlocked && !a.id.startsWith('milestone')).length;
    const milestoneAchievements = achievements.value.filter(a => a.id.startsWith('milestone'));
    
    for (const achievement of milestoneAchievements) {
      achievement.progress = Math.min(totalUnlocked, achievement.maxProgress);
      if (achievement.progress >= achievement.maxProgress && !achievement.unlocked) {
        unlockAchievement(achievement.id);
      }
    }
    save();
  }

  function unlockAchievement(id: string) {
    const achievement = achievements.value.find(a => a.id === id);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedAt = new Date().toISOString();
      if (!id.startsWith('milestone')) {
        checkMilestones();
      }
      save();
    }
  }

  return {
    achievements,
    unlockedAchievements,
    initialize,
    checkDayStreak,
    checkBalancedStats,
    checkMoodStreak,
    checkEnergyEfficiency,
    checkPerfectDay,
    save
  }
});
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Storage } from '@ionic/storage'

export type EvolutionPath = 'athletic' | 'intellectual' | 'social' | 'balanced'
export type EvolutionStage = 'baby' | 'child' | 'teen' | 'adult'

export interface PathPoints {
  athletic: number;
  intellectual: number;
  social: number;
  balanced: number;
}

export interface EvolutionState {
  level: number;
  experience: number;
  path: EvolutionPath;
  stage: EvolutionStage;
  lastEvolution: string | null;
  pathPoints: PathPoints;
}

// Constants for evolution logic
const MIN_LEVEL = 1
const EXPERIENCE_MULTIPLIER = 1.5
const BASE_EXPERIENCE = 100

const EVOLUTION_THRESHOLDS = {
  child: 5,
  teen: 15,
  adult: 30
} as const

export const useEvolutionStore = defineStore('evolution', () => {
  const level = ref(MIN_LEVEL)
  const experience = ref(0)
  const path = ref<EvolutionPath>('balanced')
  const stage = ref<EvolutionStage>('baby')
  const lastEvolution = ref<string | null>(null)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  const pathPoints = ref<PathPoints>({
    athletic: 0,
    intellectual: 0,
    social: 0,
    balanced: 0
  })

  // Experience required for next level = (current_level * BASE_EXPERIENCE) * EXPERIENCE_MULTIPLIER
  const experienceForNextLevel = computed(() => 
    Math.floor((level.value * BASE_EXPERIENCE) * EXPERIENCE_MULTIPLIER)
  )

  async function initialize() {
    try {
      const storage = new Storage()
      await storage.create()
      
      const savedState = await storage.get('evolutionState')
      if (savedState) {
        level.value = Math.max(MIN_LEVEL, Number(savedState.level))
        experience.value = Math.max(0, Number(savedState.experience))
        path.value = savedState.path
        stage.value = savedState.stage
        lastEvolution.value = savedState.lastEvolution
        pathPoints.value = {
          athletic: Math.max(0, Number(savedState.pathPoints.athletic)),
          intellectual: Math.max(0, Number(savedState.pathPoints.intellectual)),
          social: Math.max(0, Number(savedState.pathPoints.social)),
          balanced: Math.max(0, Number(savedState.pathPoints.balanced))
        }
      }
      isInitialized.value = true
      error.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to initialize evolution'
      throw e
    }
  }

  async function save() {
    try {
      const storage = new Storage()
      await storage.create()
      
      const serializableState: EvolutionState = {
        level: level.value,
        experience: experience.value,
        path: path.value,
        stage: stage.value,
        lastEvolution: lastEvolution.value,
        pathPoints: {
          athletic: Math.max(0, Number(pathPoints.value.athletic)),
          intellectual: Math.max(0, Number(pathPoints.value.intellectual)),
          social: Math.max(0, Number(pathPoints.value.social)),
          balanced: Math.max(0, Number(pathPoints.value.balanced))
        }
      }
      
      await storage.set('evolutionState', JSON.parse(JSON.stringify(serializableState)))
      error.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to save evolution state'
      throw e
    }
  }

  function getHighestPath(): EvolutionPath {
    const entries = Object.entries(pathPoints.value) as [EvolutionPath, number][]
    return entries.reduce(
      (max, [key, value]) => value > max.value ? { key, value } : max,
      { key: 'balanced' as EvolutionPath, value: -1 }
    ).key
  }

  function addExperience(amount: number, activityType: EvolutionPath) {
    try {
      if (!isInitialized.value) {
        throw new Error('Evolution store not initialized')
      }

      if (amount < 0) {
        throw new Error('Experience amount must be positive')
      }

      experience.value += amount
      pathPoints.value[activityType]++
      
      // Update evolution path based on highest points
      path.value = getHighestPath()

      // Check for level up
      while (experience.value >= experienceForNextLevel.value) {
        levelUp()
      }
      
      save()
      error.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add experience'
      throw e
    }
  }

  function levelUp() {
    try {
      experience.value -= experienceForNextLevel.value
      level.value++
      
      checkEvolution()
      save()
      error.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to level up'
      throw e
    }
  }

  function checkEvolution() {
    try {
      if (level.value >= EVOLUTION_THRESHOLDS.adult && stage.value === 'teen') {
        evolve('adult')
      } else if (level.value >= EVOLUTION_THRESHOLDS.teen && stage.value === 'child') {
        evolve('teen')
      } else if (level.value >= EVOLUTION_THRESHOLDS.child && stage.value === 'baby') {
        evolve('child')
      }
      error.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to check evolution'
      throw e
    }
  }

  function evolve(newStage: EvolutionStage) {
    try {
      stage.value = newStage
      lastEvolution.value = new Date().toISOString()
      save()
      error.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to evolve'
      throw e
    }
  }

  return {
    level,
    experience,
    experienceForNextLevel,
    path,
    stage,
    lastEvolution,
    pathPoints,
    isInitialized,
    error,
    initialize,
    addExperience,
    save
  }
})
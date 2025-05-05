import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Storage } from '@ionic/storage'

export type EvolutionPath = 'athletic' | 'intellectual' | 'social' | 'balanced'
export type EvolutionStage = 'baby' | 'child' | 'teen' | 'adult'

export interface EvolutionState {
  level: number;
  experience: number;
  path: EvolutionPath;
  stage: EvolutionStage;
  lastEvolution: string | null;
}

export const useEvolutionStore = defineStore('evolution', () => {
  const level = ref(1)
  const experience = ref(0)
  const path = ref<EvolutionPath>('balanced')
  const stage = ref<EvolutionStage>('baby')
  const lastEvolution = ref<string | null>(null)

  // Experience required for next level = (current_level * 100) * 1.5
  const experienceForNextLevel = computed(() => Math.floor((level.value * 100) * 1.5))
  
  // Evolution thresholds
  const evolutionThresholds = {
    child: 5, // Level 5 to evolve to child
    teen: 15, // Level 15 to evolve to teen
    adult: 30  // Level 30 to evolve to adult
  }

  // Path points to track pet's tendencies
  const pathPoints = ref({
    athletic: 0,
    intellectual: 0,
    social: 0,
    balanced: 0
  })

  async function initialize() {
    const storage = new Storage()
    await storage.create()
    
    const savedState = await storage.get('evolutionState')
    if (savedState) {
      level.value = savedState.level
      experience.value = savedState.experience
      path.value = savedState.path
      stage.value = savedState.stage
      lastEvolution.value = savedState.lastEvolution
      pathPoints.value = savedState.pathPoints
    }
  }

  async function save() {
    const storage = new Storage()
    await storage.create()
    
    // Create a serializable state object
    const serializableState = {
      level: level.value,
      experience: experience.value,
      path: path.value,
      stage: stage.value,
      lastEvolution: lastEvolution.value || null,
      pathPoints: JSON.parse(JSON.stringify(pathPoints.value))
    }
    
    await storage.set('evolutionState', JSON.parse(JSON.stringify(serializableState)))
  }

  function addExperience(amount: number, activityType: EvolutionPath) {
    experience.value += amount
    
    // Add path points based on activity
    pathPoints.value[activityType]++
    
    // Update evolution path based on highest points
    const highestPath = Object.entries(pathPoints.value)
      .reduce((max, [key, value]) => value > max.value ? { key, value } : max, 
        { key: 'balanced', value: -1 })
    path.value = highestPath.key as EvolutionPath

    // Check for level up
    while (experience.value >= experienceForNextLevel.value) {
      levelUp()
    }
    
    save()
  }

  function levelUp() {
    experience.value -= experienceForNextLevel.value
    level.value++
    
    // Check for evolution
    checkEvolution()
    save()
  }

  function checkEvolution() {
    if (level.value >= evolutionThresholds.adult && stage.value === 'teen') {
      evolve('adult')
    } else if (level.value >= evolutionThresholds.teen && stage.value === 'child') {
      evolve('teen')
    } else if (level.value >= evolutionThresholds.child && stage.value === 'baby') {
      evolve('child')
    }
  }

  function evolve(newStage: EvolutionStage) {
    stage.value = newStage
    lastEvolution.value = new Date().toISOString()
    save()
  }

  return {
    level,
    experience,
    experienceForNextLevel,
    path,
    stage,
    lastEvolution,
    pathPoints,
    initialize,
    addExperience,
    save
  }
})
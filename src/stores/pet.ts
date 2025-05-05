import { defineStore } from 'pinia'
import { ref, onUnmounted, computed } from 'vue'
import { Storage } from '@ionic/storage'
import { useAchievementsStore } from './achievements'
import { useEvolutionStore } from './evolution'
import { useItemsStore } from './items'

type Emotion = 'happy' | 'sad' | 'angry' | 'cry' | 'dissatisfied' | 'joyful' | 'love' | 'satisfied' | 'upset'

const HOUR_IN_MS = 3600000 // 1 hour in milliseconds
const MIN_STAT = 0
const MAX_STAT = 100

export const usePetStore = defineStore('pet', () => {
  const name = ref('My Pet')
  const hunger = ref(MAX_STAT)
  const happiness = ref(MAX_STAT)
  const energy = ref(MAX_STAT)
  const health = ref(MAX_STAT)
  const lastInteraction = ref(new Date().toISOString())
  const emotion = ref<Emotion>('happy')
  const isInitialized = ref(false)
  const error = ref<string | null>(null)

  const achievementsStore = useAchievementsStore()
  const evolutionStore = useEvolutionStore()
  const itemsStore = useItemsStore()

  const equippedItems = computed(() => itemsStore.equippedItems)

  let cleanupLifeCycle: (() => void) | null = null

  async function initialize() {
    try {
      const storage = new Storage()
      await storage.create()
      
      const savedState = await storage.get('petState')
      if (savedState) {
        name.value = savedState.name
        hunger.value = Number(savedState.hunger)
        happiness.value = Number(savedState.happiness)
        energy.value = Number(savedState.energy)
        health.value = Number(savedState.health)
        lastInteraction.value = savedState.lastInteraction
        emotion.value = savedState.emotion
      }
      
      await Promise.all([
        achievementsStore.initialize(),
        evolutionStore.initialize()
      ])

      // Clean up any existing interval
      cleanup()
      
      // Start new lifecycle and store cleanup function
      cleanupLifeCycle = startLifeCycle()
      isInitialized.value = true
      error.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to initialize pet'
      throw e
    }
  }

  function cleanup() {
    if (cleanupLifeCycle) {
      cleanupLifeCycle()
      cleanupLifeCycle = null
    }
  }

  // Ensure cleanup on store disposal
  onUnmounted(cleanup)

  async function save() {
    try {
      const storage = new Storage()
      await storage.create()
      
      // Create a serializable state object with validated numbers
      const serializableState = {
        name: name.value,
        hunger: Math.min(MAX_STAT, Math.max(MIN_STAT, Number(hunger.value))),
        happiness: Math.min(MAX_STAT, Math.max(MIN_STAT, Number(happiness.value))),
        energy: Math.min(MAX_STAT, Math.max(MIN_STAT, Number(energy.value))),
        health: Math.min(MAX_STAT, Math.max(MIN_STAT, Number(health.value))),
        lastInteraction: lastInteraction.value,
        emotion: emotion.value
      }
      
      await storage.set('petState', JSON.parse(JSON.stringify(serializableState)))
      error.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to save pet state'
      throw e
    }
  }

  function startLifeCycle(intervalMs: number = HOUR_IN_MS) {
    const interval = setInterval(() => {
      updateStats()
      updateEmotion()
      save()
    }, intervalMs)
    
    return () => clearInterval(interval)
  }

  function applyEquippedItemEffects() {
    for (const item of equippedItems.value) {
      if (item.effects) {
        if (item.effects.hunger) hunger.value = Math.min(MAX_STAT, hunger.value + item.effects.hunger)
        if (item.effects.happiness) happiness.value = Math.min(MAX_STAT, happiness.value + item.effects.happiness)
        if (item.effects.energy) energy.value = Math.min(MAX_STAT, energy.value + item.effects.energy)
        if (item.effects.health) health.value = Math.min(MAX_STAT, health.value + item.effects.health)
      }
    }
  }

  function updateStats() {
    const now = new Date()
    const last = new Date(lastInteraction.value)
    const secondsPassed = (now.getTime() - last.getTime()) / 1000
    
    hunger.value = Math.max(MIN_STAT, hunger.value - secondsPassed * 0.1)
    happiness.value = Math.max(MIN_STAT, happiness.value - secondsPassed * 0.08)
    energy.value = Math.max(MIN_STAT, energy.value - secondsPassed * 0.05)
    
    if (hunger.value < 30 || happiness.value < 30) {
      health.value = Math.max(MIN_STAT, health.value - secondsPassed * 0.1)
    }
    
    // Apply effects from equipped items
    applyEquippedItemEffects()
    
    lastInteraction.value = now.toISOString()

    // Check achievements
    achievementsStore.checkDayStreak(now.toISOString())
    achievementsStore.checkBalancedStats({
      hunger: hunger.value,
      happiness: happiness.value,
      energy: energy.value,
      health: health.value
    })
    achievementsStore.checkMoodStreak(emotion.value)
    achievementsStore.checkPerfectDay({
      hunger: hunger.value,
      happiness: happiness.value,
      energy: energy.value,
      health: health.value
    })
  }

  function updateEmotion() {
    // Critical conditions
    if (health.value < 30) {
      emotion.value = 'cry'
    } else if (hunger.value < 20) {
      emotion.value = 'angry'
    } 
    // Low states
    else if (happiness.value < 20) {
      emotion.value = 'sad'
    } else if (energy.value < 20) {
      emotion.value = 'dissatisfied'
    }
    // Happy states
    else if (happiness.value > 80 && hunger.value > 80 && energy.value > 80) {
      emotion.value = 'love'
    } else if (happiness.value > 70 && hunger.value > 60) {
      emotion.value = 'joyful'
    } else if (happiness.value > 50 && energy.value > 50) {
      emotion.value = 'satisfied'
    } 
    // Middle states
    else if (happiness.value < 40 || hunger.value < 40 || energy.value < 40) {
      emotion.value = 'upset'
    } else {
      emotion.value = 'happy'
    }
  }

  function feed() {
    if (hunger.value >= MAX_STAT) return
    hunger.value = Math.min(MAX_STAT, hunger.value + 30)
    energy.value = Math.max(MIN_STAT, energy.value - 5)
    
    // Add balanced experience when feeding
    evolutionStore.addExperience(5, 'balanced')
    
    updateStats()
    updateEmotion()
    save()
  }

  function play() {
    if (energy.value < 20) return
    happiness.value = Math.min(MAX_STAT, happiness.value + 20)
    energy.value = Math.max(MIN_STAT, energy.value - 20)
    hunger.value = Math.max(MIN_STAT, hunger.value - 10)
    
    // Add coins when playing
    itemsStore.addCoins(10)
    
    // Add athletic experience when playing
    evolutionStore.addExperience(10, 'athletic')
    
    // Check energy efficiency achievement when playing
    achievementsStore.checkEnergyEfficiency(energy.value)
    
    updateStats()
    updateEmotion()
    save()
  }

  function sleep() {
    energy.value = Math.min(MAX_STAT, energy.value + 50)
    hunger.value = Math.max(MIN_STAT, hunger.value - 20)
    
    // Add balanced experience when sleeping
    evolutionStore.addExperience(8, 'balanced')
    
    updateStats()
    updateEmotion()
    save()
  }

  function heal() {
    if (health.value >= MAX_STAT) return
    health.value = Math.min(MAX_STAT, health.value + 30)
    energy.value = Math.max(MIN_STAT, energy.value - 10)
    
    // Add intellectual experience when healing
    evolutionStore.addExperience(15, 'intellectual')
    
    updateStats()
    updateEmotion()
    save()
  }

  return {
    name,
    hunger,
    happiness,
    energy,
    health,
    lastInteraction,
    emotion,
    isInitialized,
    error,
    initialize,
    cleanup,
    feed,
    play,
    sleep,
    heal,
    save,
    startLifeCycle,  // Expose for testing
    equippedItems,
  }
})
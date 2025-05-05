import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Storage } from '@ionic/storage'

type Emotion = 'happy' | 'sad' | 'angry' | 'cry' | 'dissatisfied' | 'joyful' | 'love' | 'satisfied' | 'upset'

const HOUR_IN_MS = 3600000 // 1 hour in milliseconds

export const usePetStore = defineStore('pet', () => {
  const name = ref('My Pet')
  const hunger = ref(100)
  const happiness = ref(100)
  const energy = ref(100)
  const health = ref(100)
  const lastInteraction = ref(new Date().toISOString())
  const emotion = ref<Emotion>('happy')

  let cleanupLifeCycle: (() => void) | null = null

  async function initialize() {
    const storage = new Storage()
    await storage.create()
    
    const savedState = await storage.get('petState')
    if (savedState) {
      name.value = savedState.name
      hunger.value = savedState.hunger
      happiness.value = savedState.happiness
      energy.value = savedState.energy
      health.value = savedState.health
      lastInteraction.value = savedState.lastInteraction
      emotion.value = savedState.emotion
    }
    
    // Clean up any existing interval
    if (cleanupLifeCycle) {
      cleanupLifeCycle()
    }
    
    // Start new lifecycle and store cleanup function
    cleanupLifeCycle = startLifeCycle()
  }

  async function save() {
    const storage = new Storage()
    await storage.create()
    await storage.set('petState', {
      name: name.value,
      hunger: hunger.value,
      happiness: happiness.value,
      energy: energy.value,
      health: health.value,
      lastInteraction: lastInteraction.value,
      emotion: emotion.value
    })
  }

  function startLifeCycle(intervalMs: number = HOUR_IN_MS) {
    const interval = setInterval(() => {
      updateStats()
      updateEmotion()
      save()
    }, intervalMs)
    
    return () => clearInterval(interval)
  }

  function updateStats() {
    const now = new Date()
    const last = new Date(lastInteraction.value)
    const secondsPassed = (now.getTime() - last.getTime()) / 1000
    
    // Adjusted rates for more frequent updates (per second instead of per minute)
    hunger.value = Math.max(0, hunger.value - secondsPassed * 0.1)  // ~10% per minute
    happiness.value = Math.max(0, happiness.value - secondsPassed * 0.08) // ~8% per minute
    energy.value = Math.max(0, energy.value - secondsPassed * 0.05)  // ~5% per minute
    
    if (hunger.value < 30 || happiness.value < 30) {
      health.value = Math.max(0, health.value - secondsPassed * 0.1)  // ~10% per minute when in bad condition
    }
    
    lastInteraction.value = now.toISOString()
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
    if (hunger.value >= 100) return
    hunger.value = Math.min(100, hunger.value + 30)
    energy.value = Math.max(0, energy.value - 5)
    updateStats()
    updateEmotion()
    save()
  }

  function play() {
    if (energy.value < 20) return
    happiness.value = Math.min(100, happiness.value + 20)
    energy.value = Math.max(0, energy.value - 20)
    hunger.value = Math.max(0, hunger.value - 10)
    updateStats()
    updateEmotion()
    save()
  }

  function sleep() {
    energy.value = Math.min(100, energy.value + 50)
    hunger.value = Math.max(0, hunger.value - 20)
    updateStats()
    updateEmotion()
    save()
  }

  function heal() {
    if (health.value >= 100) return
    health.value = Math.min(100, health.value + 30)
    energy.value = Math.max(0, energy.value - 10)
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
    initialize,
    feed,
    play,
    sleep,
    heal,
    save,
    startLifeCycle  // Expose for testing
  }
})
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePetStore } from '../pet'

// Mock the Ionic Storage
vi.mock('@ionic/storage', () => ({
  Storage: vi.fn().mockImplementation(() => ({
    create: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
  }))
}))

describe('Pet Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Reset timers before each test
    vi.useFakeTimers()
  })

  test('stats decrease over time', async () => {
    const store = usePetStore()
    await store.initialize()

    // Initial values
    expect(store.hunger).toBe(100)
    expect(store.happiness).toBe(100)
    expect(store.energy).toBe(100)

    // Advance time by 1 hour
    vi.advanceTimersByTime(3600000)

    // Check that stats have decreased
    expect(store.hunger).toBeLessThan(100)
    expect(store.happiness).toBeLessThan(100)
    expect(store.energy).toBeLessThan(100)
  })

  test('pet becomes sad when stats are low', async () => {
    const store = usePetStore()
    await store.initialize()

    // Initial emotion
    expect(store.emotion).toBe('happy')

    // Advance time by 3 hours to let stats decrease significantly
    vi.advanceTimersByTime(3600000 * 3)

    // Check that emotion has changed due to low stats
    expect(store.emotion).not.toBe('happy')
  })

  test('cleanup stops the lifecycle updates', async () => {
    const store = usePetStore()
    await store.initialize()

    const initialHunger = store.hunger
    
    // Get the cleanup function
    const cleanup = store.startLifeCycle(3600000)
    
    // Run cleanup to stop updates
    cleanup()
    
    // Advance time
    vi.advanceTimersByTime(3600000)
    
    // Stats should not have changed since we cleaned up the interval
    expect(store.hunger).toBe(initialHunger)
  })
})
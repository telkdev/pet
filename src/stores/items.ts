import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Storage } from '@ionic/storage'

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'accessory' | 'outfit' | 'food' | 'decoration' | 'background';
  price: number;
  effects?: {
    hunger?: number;
    happiness?: number;
    energy?: number;
    health?: number;
  };
  icon: string;
  owned: boolean;
  equipped?: boolean;
}

export const useItemsStore = defineStore('items', () => {
  const items = ref<Item[]>([
    // Accessories
    {
      id: 'bow-tie',
      name: 'Bow Tie',
      description: 'A fancy bow tie for special occasions',
      type: 'accessory',
      price: 100,
      effects: { happiness: 5 },
      icon: 'ribbon',
      owned: false,
      equipped: false
    },
    {
      id: 'glasses',
      name: 'Smart Glasses',
      description: 'Makes your pet look intellectual',
      type: 'accessory',
      price: 150,
      effects: { happiness: 8 },
      icon: 'glasses',
      owned: false,
      equipped: false
    },
    // Outfits
    {
      id: 'summer-outfit',
      name: 'Summer Outfit',
      description: 'Perfect for sunny days',
      type: 'outfit',
      price: 200,
      effects: { happiness: 10, energy: 5 },
      icon: 'shirt',
      owned: false,
      equipped: false
    },
    // Foods
    {
      id: 'premium-food',
      name: 'Premium Pet Food',
      description: 'High-quality nutritious food',
      type: 'food',
      price: 50,
      effects: { hunger: 40, health: 5 },
      icon: 'fast-food',
      owned: false
    },
    {
      id: 'energy-drink',
      name: 'Pet Energy Drink',
      description: 'Boosts energy quickly',
      type: 'food',
      price: 75,
      effects: { energy: 30, hunger: -5 },
      icon: 'battery-full',
      owned: false
    },
    // Decorations
    {
      id: 'pet-bed',
      name: 'Luxury Pet Bed',
      description: 'A comfortable bed for better rest',
      type: 'decoration',
      price: 300,
      effects: { energy: 10, happiness: 5 },
      icon: 'bed',
      owned: false,
      equipped: false
    },
    {
      id: 'toy-box',
      name: 'Toy Box',
      description: 'A collection of fun toys',
      type: 'decoration',
      price: 250,
      effects: { happiness: 15 },
      icon: 'game-controller',
      owned: false,
      equipped: false
    },
    // Backgrounds
    {
      id: 'beach',
      name: 'Beach Paradise',
      description: 'A sunny beach environment',
      type: 'background',
      price: 500,
      effects: { happiness: 20 },
      icon: 'sunny',
      owned: false,
      equipped: false
    },
    {
      id: 'space',
      name: 'Space Adventure',
      description: 'An otherworldly space environment',
      type: 'background',
      price: 1000,
      effects: { happiness: 30 },
      icon: 'planet',
      owned: false,
      equipped: false
    }
  ])

  const coins = ref(0)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  // Computed properties for filtering items
  const accessories = computed(() => items.value.filter(item => item.type === 'accessory'))
  const outfits = computed(() => items.value.filter(item => item.type === 'outfit'))
  const foods = computed(() => items.value.filter(item => item.type === 'food'))
  const decorations = computed(() => items.value.filter(item => item.type === 'decoration'))
  const backgrounds = computed(() => items.value.filter(item => item.type === 'background'))
  const ownedItems = computed(() => items.value.filter(item => item.owned))
  const equippedItems = computed(() => items.value.filter(item => item.equipped))

  async function initialize() {
    try {
      const storage = new Storage()
      await storage.create()
      
      const savedState = await storage.get('itemsState')
      if (savedState) {
        // Ensure proper deserialization of saved items
        const deserializedItems = savedState.items.map((item: Item) => ({
          ...item,
          effects: item.effects ? { ...item.effects } : undefined,
          owned: Boolean(item.owned),
          equipped: Boolean(item.equipped)
        }))
        items.value = deserializedItems
        coins.value = Math.max(5, Number(savedState.coins))
      }
      
      isInitialized.value = true
      error.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to initialize items'
      throw e
    }
  }

  async function save() {
    try {
      const storage = new Storage()
      await storage.create()
      
      // Create a serializable state by converting to JSON and back
      const serializableState = {
        items: items.value.map(item => ({
          ...item,
          effects: item.effects ? { ...item.effects } : undefined,
        })),
        coins: Math.max(0, Number(coins.value))
      }
      
      await storage.set('itemsState', JSON.parse(JSON.stringify(serializableState)))
      error.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to save items'
      throw e
    }
  }

  function buyItem(itemId: string) {
    try {
      const item = items.value.find(i => i.id === itemId)
      if (!item) throw new Error('Item not found')
      if (item.owned) throw new Error('Item already owned')
      if (coins.value < item.price) throw new Error('Not enough coins')

      coins.value -= item.price
      item.owned = true
      save()
      error.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to buy item'
      throw e
    }
  }

  function useFood(itemId: string) {
    try {
      const item = items.value.find(i => i.id === itemId)
      if (!item) throw new Error('Item not found')
      if (!item.owned) throw new Error('Item not owned')
      if (item.type !== 'food') throw new Error('Item is not food')

      // Food items are consumed upon use
      item.owned = false
      save()
      error.value = null
      
      return item.effects
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to use food'
      throw e
    }
  }

  function toggleEquip(itemId: string) {
    try {
      const item = items.value.find(i => i.id === itemId)
      if (!item) throw new Error('Item not found')
      if (!item.owned) throw new Error('Item not owned')
      if (!['accessory', 'outfit', 'decoration', 'background'].includes(item.type)) {
        throw new Error('Item cannot be equipped')
      }

      // Unequip other items of the same type
      if (!item.equipped) {
        items.value
          .filter(i => i.type === item.type && i.id !== item.id)
          .forEach(i => i.equipped = false)
      }

      item.equipped = !item.equipped
      save()
      error.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to toggle equip'
      throw e
    }
  }

  function addCoins(amount: number) {
    try {
      if (amount <= 0) throw new Error('Amount must be positive')
      coins.value += amount
      save()
      error.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add coins'
      throw e
    }
  }

  return {
    items,
    coins,
    error,
    isInitialized,
    accessories,
    outfits,
    foods,
    decorations,
    backgrounds,
    ownedItems,
    equippedItems,
    initialize,
    save,
    buyItem,
    useFood,
    toggleEquip,
    addCoins
  }
})
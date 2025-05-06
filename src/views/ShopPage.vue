<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Shop</ion-title>
        <ion-buttons slot="end">
          <ion-chip>
            <ion-icon :icon="cash"></ion-icon>
            <ion-label>{{ itemsStore.coins }}</ion-label>
          </ion-chip>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-segment v-model="selectedCategory" class="ion-padding">
        <ion-segment-button value="foods">
          <ion-label>Foods</ion-label>
          <ion-icon :icon="restaurant"></ion-icon>
        </ion-segment-button>
        <ion-segment-button value="accessories">
          <ion-label>Accessories</ion-label>
          <ion-icon :icon="ribbon"></ion-icon>
        </ion-segment-button>
        <ion-segment-button value="outfits">
          <ion-label>Outfits</ion-label>
          <ion-icon :icon="shirt"></ion-icon>
        </ion-segment-button>
        <ion-segment-button value="decorations">
          <ion-label>Decor</ion-label>
          <ion-icon :icon="home"></ion-icon>
        </ion-segment-button>
      </ion-segment>

      <!-- Inventory View -->
      <ion-list v-if="showInventory">
        <ion-item-group>
          <ion-item-divider sticky>
            <ion-label>Equipped Items</ion-label>
          </ion-item-divider>
          <ion-item v-for="item in itemsStore.equippedItems" :key="item.id">
            <div class="item-icon" slot="start">
              <ion-icon :icon="item.icon" size="large"></ion-icon>
            </div>
            <ion-label>
              <h2>{{ item.name }}</h2>
              <p>{{ item.description }}</p>
              <p v-if="item.effects">
                <span v-for="(value, stat) in item.effects" :key="stat" class="effect-tag">
                  {{ stat }}: {{ value !== undefined && value > 0 ? '+' : ''}}{{ value }}
                </span>
              </p>
            </ion-label>
            <ion-button fill="clear" @click="handleEquip(item)">
              <ion-icon slot="icon-only" :icon="chevronDown"></ion-icon>
            </ion-button>
          </ion-item>
        </ion-item-group>

        <ion-item-group>
          <ion-item-divider sticky>
            <ion-label>Inventory</ion-label>
          </ion-item-divider>
          <ion-item v-for="item in filteredInventoryItems" :key="item.id">
            <div class="item-icon" slot="start">
              <ion-icon :icon="item.icon" size="large"></ion-icon>
            </div>
            <ion-label>
              <h2>{{ item.name }}</h2>
              <p>{{ item.description }}</p>
              <p v-if="item.effects">
                <span v-for="(value, stat) in item.effects" :key="stat" class="effect-tag">
                  {{ stat }}: {{ value !== undefined && value > 0 ? '+' : ''}}{{ value }}
                </span>
              </p>
            </ion-label>
            <ion-button v-if="item.type === 'food'" fill="solid" color="primary" @click="handleUseFood(item)">
              Use
            </ion-button>
            <ion-button v-else fill="clear" @click="handleEquip(item)">
              <ion-icon slot="icon-only" :icon="chevronUp"></ion-icon>
            </ion-button>
          </ion-item>
        </ion-item-group>
      </ion-list>

      <!-- Shop View -->
      <ion-list v-else>
        <ion-item v-for="item in filteredShopItems" :key="item.id">
          <div class="item-icon" slot="start">
            <ion-icon :icon="item.icon" size="large"></ion-icon>
          </div>
          <ion-label>
            <h2>{{ item.name }}</h2>
            <p>{{ item.description }}</p>
            <p v-if="item.effects">
              <span v-for="(value, stat) in item.effects" :key="stat" class="effect-tag">
                {{ stat }}: {{ value !== undefined && value > 0 ? '+' : ''}}{{ value }}
              </span>
            </p>
          </ion-label>
          <ion-button 
            :disabled="item.owned || itemsStore.coins < item.price" 
            @click="handleBuy(item)"
          >
            <ion-icon slot="start" :icon="cash"></ion-icon>
            {{ item.price }}
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>

    <!-- Toggle between shop and inventory -->
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="showInventory = !showInventory">
        <ion-icon :icon="showInventory ? 'cart' : 'bag'"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton, 
         IonLabel, IonIcon, IonList, IonItem, IonButton, IonChip,
         IonItemDivider, IonItemGroup, IonFab, IonFabButton, IonButtons, alertController } from '@ionic/vue';
import { restaurant, ribbon, shirt, home, cash, chevronUp, chevronDown } from 'ionicons/icons';
import { useItemsStore } from '@/stores/items';
import { usePetStore } from '@/stores/pet';

const itemsStore = useItemsStore();
const petStore = usePetStore();
const selectedCategory = ref('foods');
const showInventory = ref(false);

const filteredShopItems = computed(() => {
  switch (selectedCategory.value) {
    case 'foods': return itemsStore.foods;
    case 'accessories': return itemsStore.accessories;
    case 'outfits': return itemsStore.outfits;
    case 'decorations': return itemsStore.decorations;
    default: return [];
  }
});

const filteredInventoryItems = computed(() => {
  const items = itemsStore.ownedItems.filter(item => !item.equipped);
  return items.filter(item => {
    switch (selectedCategory.value) {
      case 'foods': return item.type === 'food';
      case 'accessories': return item.type === 'accessory';
      case 'outfits': return item.type === 'outfit';
      case 'decorations': return item.type === 'decoration';
      default: return false;
    }
  });
});

async function handleBuy(item: any) {
  try {
    itemsStore.buyItem(item.id);
    const alert = await alertController.create({
      header: 'Success!',
      message: `You bought ${item.name}!`,
      buttons: ['OK']
    });
    await alert.present();
  } catch (error) {
    const alert = await alertController.create({
      header: 'Error',
      message: error instanceof Error ? error.message : 'Failed to buy item',
      buttons: ['OK']
    });
    await alert.present();
  }
}

async function handleUseFood(item: any) {
  try {
    const effects = itemsStore.useFood(item.id);
    if (effects) {
      if (effects.hunger) petStore.hunger = Math.min(100, petStore.hunger + effects.hunger);
      if (effects.happiness) petStore.happiness = Math.min(100, petStore.happiness + effects.happiness);
      if (effects.energy) petStore.energy = Math.min(100, petStore.energy + effects.energy);
      if (effects.health) petStore.health = Math.min(100, petStore.health + effects.health);
      petStore.save();
    }
    
    const alert = await alertController.create({
      header: 'Success!',
      message: `Used ${item.name}!`,
      buttons: ['OK']
    });
    await alert.present();
  } catch (error) {
    const alert = await alertController.create({
      header: 'Error',
      message: error instanceof Error ? error.message : 'Failed to use item',
      buttons: ['OK']
    });
    await alert.present();
  }
}

async function handleEquip(item: any) {
  try {
    itemsStore.toggleEquip(item.id);
  } catch (error) {
    const alert = await alertController.create({
      header: 'Error',
      message: error instanceof Error ? error.message : 'Failed to equip item',
      buttons: ['OK']
    });
    await alert.present();
  }
}
</script>

<style scoped>
ion-segment {
  margin-bottom: 1rem;
  --background: var(--ion-color-light);
}

ion-segment-button {
  --color: var(--ion-color-medium);
  --color-checked: var(--ion-color-primary-contrast);
  --indicator-color: var(--ion-color-primary);
  /* Light theme adjustments for better contrast */
  --background: transparent;
  --background-checked: var(--ion-color-primary-shade);
  --background-hover: rgba(var(--ion-color-primary-rgb), 0.1);
  --color-hover: var(--ion-color-primary);
  --padding-top: 8px;
  --padding-bottom: 8px;
}

ion-segment-button::part(indicator) {
  background: var(--ion-color-primary-contrast);
  border-radius: 2px;
}

ion-segment-button ion-label {
  color: inherit;
}

ion-segment-button ion-icon {
  color: inherit;
}

ion-item {
  --color: var(--ion-text-color);
}

ion-item h2 {
  color: var(--ion-text-color);
  margin-bottom: 4px;
}

ion-item p {
  color: var(--ion-color-medium);
}

.effect-tag {
  display: inline-block;
  padding: 2px 6px;
  margin-right: 8px;
  border-radius: 4px;
  background: var(--ion-color-light);
  font-size: 0.8em;
  color: var(--ion-color-dark);
}

ion-thumbnail {
  --size: 60px;
  margin-right: 16px;
}

ion-thumbnail img {
  border-radius: 8px;
}

ion-item-divider {
  --background: var(--ion-color-light);
  --color: var(--ion-color-dark);
  font-weight: bold;
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--ion-color-light);
  margin-right: 16px;
}

item-icon ion-icon {
  font-size: 24px;
  color: var(--ion-color-primary);
}

ion-chip {
  --background: var(--ion-color-light);
  --color: var(--ion-color-dark);
}
</style>
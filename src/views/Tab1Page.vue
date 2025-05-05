<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>My Pet</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="pet-container">
        {{ petStore.emotion }}
        <img :src="`/resources/pet/${petStore.emotion}.jpg`" alt="Pet" class="pet-image" />
        
        <div class="stats-container">
          <ion-progress-bar color="warning" :value="petStore.hunger / 100">
            Hunger: {{ petStore.hunger }}%
          </ion-progress-bar>
          <ion-progress-bar color="success" :value="petStore.happiness / 100">
            Happiness: {{ petStore.happiness }}%
          </ion-progress-bar>
          <ion-progress-bar color="primary" :value="petStore.energy / 100">
            Energy: {{ petStore.energy }}%
          </ion-progress-bar>
          <ion-progress-bar color="danger" :value="petStore.health / 100">
            Health: {{ petStore.health }}%
          </ion-progress-bar>
        </div>

        <div class="actions-container">
          <ion-button @click="petStore.feed()" :disabled="petStore.hunger >= 100">
            <ion-icon :icon="restaurant" slot="start"></ion-icon>
            Feed
          </ion-button>
          
          <ion-button @click="petStore.play()" :disabled="petStore.energy < 20" color="success">
            <ion-icon :icon="playCircle" slot="start"></ion-icon>
            Play
          </ion-button>
          
          <ion-button @click="petStore.sleep()" color="primary">
            <ion-icon :icon="bed" slot="start"></ion-icon>
            Sleep
          </ion-button>
          
          <ion-button @click="petStore.heal()" :disabled="petStore.health >= 100" color="danger">
            <ion-icon :icon="medkit" slot="start"></ion-icon>
            Heal
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonProgressBar, IonIcon } from '@ionic/vue';
import { restaurant, playCircle, bed, medkit } from 'ionicons/icons';
import { usePetStore } from '@/stores/pet';
import { onMounted } from 'vue';

const petStore = usePetStore();

onMounted(() => {
  petStore.initialize();
});
</script>

<style scoped>
.pet-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 1rem;
}

.pet-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stats-container {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.actions-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

ion-progress-bar {
  height: 20px;
  border-radius: 10px;
  --buffer-background: rgba(0, 0, 0, 0.1);
}
</style>

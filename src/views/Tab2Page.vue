<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Pet Stats</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-label>
            <h2>Pet Name</h2>
            <p>{{ petStore.name }}</p>
          </ion-label>
          <ion-button slot="end" fill="clear" @click="showNamePrompt">
            <ion-icon :icon="pencil"></ion-icon>
          </ion-button>
        </ion-item>

        <ion-item>
          <ion-label>
            <h2>Current Mood</h2>
            <p>{{ petStore.emotion.charAt(0).toUpperCase() + petStore.emotion.slice(1) }}</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <h2>Hunger</h2>
            <ion-progress-bar color="warning" :value="petStore.hunger / 100"></ion-progress-bar>
            <p>{{ Math.round(petStore.hunger) }}%</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <h2>Happiness</h2>
            <ion-progress-bar color="success" :value="petStore.happiness / 100"></ion-progress-bar>
            <p>{{ Math.round(petStore.happiness) }}%</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <h2>Energy</h2>
            <ion-progress-bar color="primary" :value="petStore.energy / 100"></ion-progress-bar>
            <p>{{ Math.round(petStore.energy) }}%</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <h2>Health</h2>
            <ion-progress-bar color="danger" :value="petStore.health / 100"></ion-progress-bar>
            <p>{{ Math.round(petStore.health) }}%</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <h2>Last Interaction</h2>
            <p>{{ new Date(petStore.lastInteraction).toLocaleString() }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, 
         IonLabel, IonButton, IonIcon, IonProgressBar, alertController } from '@ionic/vue';
import { pencil } from 'ionicons/icons';
import { usePetStore } from '@/stores/pet';

const petStore = usePetStore();

async function showNamePrompt() {
  const alert = await alertController.create({
    header: 'Rename Pet',
    inputs: [
      {
        name: 'name',
        type: 'text',
        placeholder: 'Enter new name',
        value: petStore.name
      }
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Save',
        handler: (data) => {
          if (data.name.trim()) {
            petStore.name = data.name.trim();
            petStore.save();
          }
        }
      }
    ]
  });

  await alert.present();
}
</script>

<style scoped>
ion-progress-bar {
  margin: 8px 0;
}
</style>

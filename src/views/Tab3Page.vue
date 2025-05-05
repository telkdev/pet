<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-label>Reset Pet</ion-label>
          <ion-button slot="end" color="danger" @click="confirmReset">
            Reset All Stats
          </ion-button>
        </ion-item>

        <ion-item>
          <ion-label>
            <h2>Game Information</h2>
            <p>Your pet needs regular care to stay healthy and happy:</p>
            <ul>
              <li>Feed your pet when hungry</li>
              <li>Play to increase happiness</li>
              <li>Let it sleep to restore energy</li>
              <li>Heal when health is low</li>
            </ul>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label>
            <h2>About Emotions</h2>
            <p>Your pet's emotion changes based on its stats:</p>
            <ul>
              <li>Love: Very happy and well-fed</li>
              <li>Joyful: Very happy</li>
              <li>Happy: Content</li>
              <li>Satisfied: Doing okay</li>
              <li>Dissatisfied: Low energy</li>
              <li>Upset: Not very happy</li>
              <li>Sad: Unhappy</li>
              <li>Angry: Very hungry</li>
              <li>Cry: Low health</li>
            </ul>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, 
         IonItem, IonLabel, IonButton, alertController } from '@ionic/vue';
import { usePetStore } from '@/stores/pet';

const petStore = usePetStore();

async function confirmReset() {
  const alert = await alertController.create({
    header: 'Reset Pet',
    message: 'Are you sure you want to reset all pet stats? This cannot be undone.',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Reset',
        role: 'destructive',
        handler: () => {
          petStore.$reset();
          petStore.save();
        }
      }
    ]
  });

  await alert.present();
}
</script>

<style scoped>
ul {
  padding-left: 20px;
  margin: 8px 0;
}

li {
  margin: 4px 0;
}
</style>

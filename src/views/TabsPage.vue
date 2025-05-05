<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom" class="custom-tabs">
        <ion-tab-button tab="tab1" href="/tabs/tab1" class="tab-button">
          <div class="tab-icon-container">
            <ion-icon aria-hidden="true" :icon="heart" />
          </div>
          <ion-label>Pet</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/tabs/tab2" class="tab-button">
          <div class="tab-icon-container">
            <ion-icon aria-hidden="true" :icon="statsChart" />
          </div>
          <ion-label>Stats</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" href="/tabs/tab3" class="tab-button">
          <div class="tab-icon-container">
            <ion-icon aria-hidden="true" :icon="settings" />
          </div>
          <ion-label>Settings</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { heart, statsChart, settings } from 'ionicons/icons';
</script>

<style scoped>
.custom-tabs {
  --background: var(--color-background-light);
  padding: 8px;
  border-radius: 20px 20px 0 0;
}

.tab-button {
  --color: var(--color-text-dark);
  --color-selected: var(--color-accent-purple);
  position: relative;
}

.tab-icon-container {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 4px;
  background: transparent;
  transition: all 0.3s ease;
}

.tab-button.tab-selected .tab-icon-container {
  background: var(--color-primary-gradient);
  box-shadow: var(--box-shadow-button);
}

.tab-button.tab-selected ion-icon {
  color: white;
}

@media (prefers-color-scheme: dark) {
  .tab-button {
    --color: var(--ion-text-color);
  }
}
</style>

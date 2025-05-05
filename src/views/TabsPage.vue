<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom" class="custom-tabs">
        <ion-tab-button tab="tab1" href="/tabs/tab1" class="tab-button"
          v-motion
          :initial="{ scale: 0.8, opacity: 0 }"
          :enter="{ scale: 1, opacity: 1 }">
          <div class="tab-icon-container">
            <ion-icon aria-hidden="true" :icon="heart" />
          </div>
          <ion-label>Pet</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/tabs/tab2" class="tab-button"
          v-motion
          :initial="{ scale: 0.8, opacity: 0 }"
          :enter="{ scale: 1, opacity: 1, transition: { delay: 100 } }">
          <div class="tab-icon-container">
            <ion-icon aria-hidden="true" :icon="statsChart" />
          </div>
          <ion-label>Stats</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" href="/tabs/tab3" class="tab-button"
          v-motion
          :initial="{ scale: 0.8, opacity: 0 }"
          :enter="{ scale: 1, opacity: 1, transition: { delay: 200 } }">
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
  --background: var(--ion-color-light);
  padding: 8px;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.custom-tabs::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(10px);
  z-index: -1;
}

.tab-button {
  --color: var(--ion-color-medium);
  --color-selected: var(--ion-color-primary);
  position: relative;
  overflow: visible;
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tab-button:active {
  transform: scale(0.95);
}

.tab-icon-container {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  background: transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.tab-button.tab-selected .tab-icon-container {
  background: var(--ion-color-primary);
  box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.3);
}

.tab-button.tab-selected ion-icon {
  color: white;
  transform: scale(1.1);
}

.tab-button ion-icon {
  font-size: 24px;
  transition: all 0.3s ease;
  margin: 0;
}

.tab-button ion-label {
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  margin: 4px 0 0 0;
}

.tab-button.tab-selected ion-label {
  font-weight: 600;
  transform: translateY(-2px);
}

@media (prefers-color-scheme: dark) {
  .custom-tabs {
    --background: rgba(var(--ion-color-light-rgb), 0.1);
  }
}

/* Safe area padding for iOS devices */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .custom-tabs {
    padding-bottom: calc(8px + env(safe-area-inset-bottom));
  }
}
</style>

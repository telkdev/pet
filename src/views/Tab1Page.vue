<template>
  <ion-page>
    <ion-content :fullscreen="true" class="game-content">
      <div class="status-bar">
        <div class="stat-chip" :class="{ warning: petStore.hunger < 30 }">
          <ion-icon :icon="restaurant" />
          <ion-progress-bar color="warning" :value="petStore.hunger / 100" />
        </div>
        <div class="stat-chip" :class="{ warning: petStore.happiness < 30 }">
          <ion-icon :icon="happy" />
          <ion-progress-bar color="success" :value="petStore.happiness / 100" />
        </div>
        <div class="stat-chip" :class="{ warning: petStore.energy < 30 }">
          <ion-icon :icon="battery" />
          <ion-progress-bar color="primary" :value="petStore.energy / 100" />
        </div>
        <div class="stat-chip" :class="{ warning: petStore.health < 30 }">
          <ion-icon :icon="heart" />
          <ion-progress-bar color="danger" :value="petStore.health / 100" />
        </div>
      </div>

      <div class="pet-space">
        <div class="message-bubble" v-motion-pop>
          <div class="pet-name">{{ petStore.name }}</div>
          <div class="pet-message">{{ getPetMessage() }}</div>
        </div>

        <div class="pet-image-container" v-motion :initial="{ scale: 0.8, opacity: 0 }"
          :enter="{ scale: 1, opacity: 1 }"
          @click="handlePet"
          @touchend.prevent="handlePet">
          <img :src="getPetImage()" alt="Pet" class="pet-image" ref="petImage" />

          <!-- Equipped Items -->
          <div class="equipped-items">
            <div v-for="item in equippedItems" :key="item.id" class="equipped-item" :class="[item.type]">
              <ion-icon :icon="item.icon" />
            </div>
          </div>
        </div>

        <div class="action-buttons" v-motion :initial="{ y: 50, opacity: 0 }"
          :enter="{ y: 0, opacity: 1, transition: { delay: 300 } }">
          <ion-fab-button color="warning" @click="handleFeed" :disabled="petStore.hunger >= 100" class="action-button">
            <ion-icon :icon="restaurant"></ion-icon>
          </ion-fab-button>

          <ion-fab-button color="success" @click="handlePlay" :disabled="petStore.energy < 20" class="action-button">
            <ion-icon :icon="playCircle"></ion-icon>
          </ion-fab-button>

          <ion-fab-button color="primary" @click="handleSleep" class="action-button">
            <ion-icon :icon="bed"></ion-icon>
          </ion-fab-button>

          <ion-fab-button color="danger" @click="handleHeal" :disabled="petStore.health >= 100" class="action-button">
            <ion-icon :icon="medkit"></ion-icon>
          </ion-fab-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonIcon, IonProgressBar, IonFabButton, alertController } from '@ionic/vue';
import { restaurant, playCircle, bed, medkit, happy, batteryFull as battery, heart } from 'ionicons/icons';
import { usePetStore } from '@/stores/pet';
import { onMounted, ref, computed } from 'vue';
import gsap from 'gsap';
import { useDebounceFn } from '@vueuse/core';

const petStore = usePetStore();
const petImage = ref(null);

const equippedItems = computed(() => petStore.equippedItems);

async function checkBirthday() {
  const today = new Date();
  const isBirthday = today.getMonth() === 4 && today.getDate() === 7; // May 7th
  if (isBirthday) {
    const alert = await alertController.create({
      header: 'С днем рождения, киса!',
      cssClass: 'birthday-alert',
      buttons: ['❤️']
    });
    await alert.present();
  }
}

function getPetMessage() {
  switch (petStore.emotion) {
    case 'love': return '❤️ I love you!';
    case 'joyful': return '🎉 So happy to see you!';
    case 'happy': return '😊 Life is good!';
    case 'satisfied': return '😌 Feeling good!';
    case 'dissatisfied': return '😴 Getting tired...';
    case 'upset': return '😕 Not feeling great...';
    case 'sad': return '😢 Please play with me...';
    case 'angry': return '😠 I\'m so hungry!';
    case 'cry': return '🤒 I don\'t feel well...';
    default: return '😊 Hi there!';
  }
}

function getPetImage() {
  const imagePath = new URL(`../assets/pet/${petStore.emotion}.jpg`, import.meta.url).href;
  return imagePath;
}

// Animation handlers
function handleFeed() {
  gsap.to(petImage.value, {
    scale: 1.2,
    duration: 0.3,
    yoyo: true,
    repeat: 1,
    onComplete: () => petStore.feed()
  });
}

function handlePlay() {
  gsap.to(petImage.value, {
    rotation: 360,
    duration: 0.5,
    onComplete: () => {
      gsap.set(petImage.value, { rotation: 0 });
      petStore.play();
    }
  });
}

function handleSleep() {
  gsap.to(petImage.value, {
    scale: 0.8,
    opacity: 0.7,
    duration: 1,
    yoyo: true,
    repeat: 1,
    onComplete: () => petStore.sleep()
  });
}

function handleHeal() {
  gsap.to(petImage.value, {
    y: -20,
    duration: 0.3,
    yoyo: true,
    repeat: 1,
    ease: "power2.out",
    onComplete: () => petStore.heal()
  });
}

const handlePet = useDebounceFn(() => {
  // Create a heart bounce animation
  gsap.to(petImage.value, {
    scale: 1.2,
    duration: 0.2,
    yoyo: true,
    repeat: 1,
    ease: "power2.inOut",
    onComplete: () => {
      // Once animation completes, increase happiness
      petStore.pet()
    }
  });
}, 500); // 500ms debounce delay

onMounted(async () => {
  await petStore.initialize();
  await checkBirthday();
});
</script>

<style scoped>
.game-content {
  --background: var(--ion-background-color);
  background: linear-gradient(145deg,
      var(--ion-color-primary-tint) 0%,
      var(--ion-color-primary) 35%,
      var(--ion-background-color) 100%);
}

.status-bar {
  position: fixed;
  top: env(safe-area-inset-top, 0);
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 0.5rem;
  background: rgba(var(--ion-background-color-rgb), 0.8);
  backdrop-filter: blur(10px);
  z-index: 100;
}

.stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  width: 20%;
  transition: transform 0.3s ease;
}

.stat-chip.warning {
  animation: pulse 2s infinite;
}

.stat-chip ion-icon {
  font-size: 1.2rem;
  margin-bottom: 0.2rem;
}

.stat-chip ion-progress-bar {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  --buffer-background: rgba(0, 0, 0, 0.1);
}

.pet-space {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: 100%;
  padding: calc(4rem + env(safe-area-inset-top)) 1rem calc(1rem + env(safe-area-inset-bottom));
}

.message-bubble {
  background: rgba(var(--ion-color-light-rgb), 0.9);
  padding: 1rem;
  border-radius: 20px;
  text-align: center;
  max-width: 80%;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: float 3s ease-in-out infinite;
}

.pet-name {
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--ion-color-dark);
}

.pet-message {
  font-size: 1.1rem;
}

.pet-image-container {
  width: min(220px, 60vw);
  height: min(220px, 60vw);
  margin: 2rem auto;
  position: relative;
}

.pet-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 4px solid var(--ion-color-light);
  background: rgba(var(--ion-background-color-rgb), 0.8);
  backdrop-filter: blur(8px);
}

.equipped-items {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.equipped-item {
  position: absolute;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--ion-color-light-rgb), 0.9);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.equipped-item ion-icon {
  font-size: 28px;
  color: var(--ion-color-primary);
}

.equipped-item.accessory {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.equipped-item.outfit {
  top: 50%;
  right: 100%;
  transform: translateY(-50%);
}

.equipped-item.decoration {
  bottom: -12px;
  right: -12px;
}

.equipped-item.background {
  bottom: 100%;
  left: 100%;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 1rem;
  padding: 1rem;
  justify-content: center;
  max-width: 400px;
  width: 100%;
}

.action-button {
  margin: 0 auto;
}

ion-fab-button {
  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

ion-fab-button:active {
  --box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

/* Responsive design for smaller screens */
@media (max-width: 360px) {
  .pet-image-container {
    width: min(180px, 50vw);
    height: min(180px, 50vw);
  }

  .action-buttons {
    gap: 0.75rem;
    grid-template-columns: repeat(2, 1fr);
  }

  ion-fab-button {
    --size: 40px;
  }
}

/* Birthday alert custom styles */
::v-deep .birthday-alert {
  --background: var(--ion-color-light);
  --backdrop-opacity: 0.8;
}

::v-deep .birthday-alert .alert-title {
  color: var(--ion-color-primary);
  font-size: 1.5em;
  text-align: center;
}
</style>

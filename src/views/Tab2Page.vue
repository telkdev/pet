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
            <h2>Evolution Status</h2>
            <div class="evolution-info">
              <p>Stage: {{ formatEvolutionStage(evolutionStore.stage) }}</p>
              <p>Path: {{ formatEvolutionPath(evolutionStore.path) }}</p>
            </div>
            <div class="level-info">
              <p>Level {{ evolutionStore.level }}</p>
              <ion-progress-bar 
                :value="evolutionStore.experience / evolutionStore.experienceForNextLevel" 
                color="tertiary"
              ></ion-progress-bar>
              <p class="xp-text">XP: {{ evolutionStore.experience }}/{{ evolutionStore.experienceForNextLevel }}</p>
            </div>
          </ion-label>
          <ion-icon 
            :icon="getEvolutionIcon(evolutionStore.path)" 
            slot="end" 
            size="large"
            :class="['evolution-icon', evolutionStore.path]"
          ></ion-icon>
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

      <ion-list>
        <ion-list-header>
          <ion-label>
            <h1>Achievements</h1>
          </ion-label>
        </ion-list-header>

        <ion-item v-for="achievement in achievementsStore.achievements" :key="achievement.id">
          <ion-icon
            :icon="achievement.icon"
            slot="start"
            :class="['achievement-icon', achievement.level, { unlocked: achievement.unlocked }]"
          ></ion-icon>
          <ion-label>
            <h2>{{ achievement.name }}</h2>
            <p>{{ achievement.description }}</p>
            <ion-progress-bar
              :value="achievement.progress / achievement.maxProgress"
              :color="achievement.unlocked ? 'success' : 'primary'"
            ></ion-progress-bar>
            <p class="progress-text">{{ achievement.progress }}/{{ achievement.maxProgress }}</p>
          </ion-label>
          <ion-badge
            slot="end"
            :color="getBadgeColor(achievement.level)"
            class="achievement-badge"
          >
            {{ achievement.level.charAt(0).toUpperCase() + achievement.level.slice(1) }}
          </ion-badge>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, 
         IonLabel, IonButton, IonIcon, IonProgressBar, alertController, IonListHeader,
         IonBadge } from '@ionic/vue';
import { onMounted } from 'vue';
import { pencil, barbellOutline, bookOutline, peopleOutline, diamondOutline } from 'ionicons/icons';
import { usePetStore } from '@/stores/pet';
import { useAchievementsStore } from '@/stores/achievements';
import { useEvolutionStore } from '@/stores/evolution';
import type { EvolutionPath, EvolutionStage } from '@/stores/evolution';

const petStore = usePetStore();
const achievementsStore = useAchievementsStore();
const evolutionStore = useEvolutionStore();

onMounted(async () => {
  await Promise.all([
    petStore.initialize(),
    achievementsStore.initialize(),
    evolutionStore.initialize()
  ]);
});

function getBadgeColor(level: string): string {
  switch (level) {
    case 'bronze': return 'warning';
    case 'silver': return 'medium';
    case 'gold': return 'warning';
    default: return 'primary';
  }
}

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

function formatEvolutionStage(stage: EvolutionStage): string {
  const stages = {
    baby: 'Baby',
    child: 'Child',
    teen: 'Teen',
    adult: 'Adult'
  };
  return stages[stage];
}

function formatEvolutionPath(path: EvolutionPath): string {
  const paths = {
    athletic: 'Athletic',
    intellectual: 'Intellectual',
    social: 'Social',
    balanced: 'Balanced'
  };
  return paths[path];
}

function getEvolutionIcon(path: EvolutionPath): string {
  const icons = {
    athletic: barbellOutline,
    intellectual: bookOutline,
    social: peopleOutline,
    balanced: diamondOutline
  };
  return icons[path];
}
</script>

<style scoped>
ion-progress-bar {
  margin: 8px 0;
}

.achievement-icon {
  font-size: 24px;
  opacity: 0.5;
}

.achievement-icon.unlocked {
  opacity: 1;
}

.achievement-icon.bronze {
  color: #cd7f32;
}

.achievement-icon.silver {
  color: #c0c0c0;
}

.achievement-icon.gold {
  color: #ffd700;
}

.progress-text {
  font-size: 12px;
  margin-top: 4px;
}

.achievement-badge {
  text-transform: capitalize;
}

ion-list-header h1 {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.evolution-info {
  margin: 8px 0;
}

.evolution-info p {
  margin: 4px 0;
}

.level-info {
  margin: 8px 0;
}

.xp-text {
  font-size: 12px;
  margin-top: 4px;
}

.evolution-icon {
  font-size: 32px;
}

.evolution-icon.athletic {
  color: #ff4961;
}

.evolution-icon.intellectual {
  color: #3880ff;
}

.evolution-icon.social {
  color: #2dd36f;
}

.evolution-icon.balanced {
  color: #92949c;
}
</style>

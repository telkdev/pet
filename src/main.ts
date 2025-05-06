import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'
import App from './App.vue'
import router from './router';
import { useItemsStore } from './stores/items';
import { useEvolutionStore } from './stores/evolution';
import { useAchievementsStore } from './stores/achievements';

import { IonicVue } from '@ionic/vue';
import { addIcons } from 'ionicons';
import { 
  trophy, 
  ribbon, 
  star, 
  heart, 
  diamond, 
  medal, 
  flash,
  barbellOutline,
  bookOutline,
  peopleOutline,
  diamondOutline,
  cart,
  bag,
  cash,
  shirt,
  home,
  restaurant,
  gameController,
  planet,
  glasses,
  chevronUp,
  chevronDown,
  batteryFull,
  fastFood,
  bed,
  sunny
} from 'ionicons/icons';

// Register Ionicons
addIcons({
  'trophy': trophy,
  'ribbon': ribbon,  // Single ribbon entry for both bow-tie and ribbon
  'star': star,
  'heart': heart,
  'diamond': diamond,
  'medal': medal,
  'flash': flash,
  'barbell-outline': barbellOutline,
  'book-outline': bookOutline,
  'people-outline': peopleOutline,
  'diamond-outline': diamondOutline,
  'cart': cart,
  'bag': bag,
  'cash': cash,
  'shirt': shirt,
  'home': home,
  'restaurant': restaurant,
  'game-controller': gameController,
  'planet': planet,
  'glasses': glasses,
  'chevron-up': chevronUp,
  'chevron-down': chevronDown,
  'battery': batteryFull,
  'fast-food': fastFood,
  'battery-full': batteryFull,
  'bed': bed,
  'sunny': sunny
});

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';

const pinia = createPinia()
const app = createApp(App)
  .use(IonicVue)
  .use(pinia)
  .use(router)
  .use(MotionPlugin);

// Initialize stores
const itemsStore = useItemsStore(pinia)
const evolutionStore = useEvolutionStore(pinia)
const achievementsStore = useAchievementsStore(pinia)

Promise.all([
  itemsStore.initialize(),
  evolutionStore.initialize(),
  achievementsStore.initialize()
]).then(() => {
  router.isReady().then(() => {
    app.mount('#app');
  });
});

import { createApp } from 'vue';
import App from './App.vue';
import * as moment from 'moment';
import { store } from './store';


moment.relativeTimeThreshold('s', 60);
moment.relativeTimeThreshold('ss', 5);
moment.locale('ru');

async function main() {
  const app = createApp(App);
  app.use(store);
  app.mount('#app');

  if (store.getters.authorized) {
    await store.dispatch('initialize');
  }
}

main();

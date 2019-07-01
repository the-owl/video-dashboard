import Vue from 'vue';
import App from './App';
import moment from 'moment';
import { createStore } from './store';


moment.relativeTimeThreshold('s', 60);
moment.relativeTimeThreshold('ss', 5);
moment.locale('ru');

async function main () {
  const store = createStore();
  new Vue({
    el: '#app',
    components: { App },
    render (h) {
      return h('App');
    },
    store
  });

  try {
    await store.dispatch('initialize');
    store.dispatch('setupTimeUpdater');
  } catch (error) {
    alert('Не удалось инициализировать приложение. См. консоль браузера.');
    console.error(error);
  }
}

main();

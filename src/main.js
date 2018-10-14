import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false;


async function main () {
  const app = new Vue({
    el: '#app',
    components: { App },
    data: {
      cameras: null,
      messages: [],
      showLogs: false
    },
    methods: {
      updateCamera (uuid) {
        for (const camera of this.cameras) {
          if (camera.uuid === uuid) {
            camera.imageVersion++;
            return;
          }
        }
      }
    },
    template: `<App :cameras='cameras' :messages='messages' />`
  });

  try {
    const response = await fetch('/cameras');
    const cameras = await response.json();
    app.cameras = cameras.map(camera => ({
      ...camera,
      imageVersion: 1
    }));
  } catch (error) {
    alert('Не удалось инициализировать приложение. См. консоль браузера.');
    console.error(error);
  }

  setInterval(async () => {
    const response = await fetch('/events');
    const events = await response.json();

    for (const event of events) {
      if (event.type === 'update') {
        app.updateCamera(event.uuid);
      } else {
        app.messages.push({
          ...event,
          unread: true
        });
        if (app.messages.length > 500) {
          app.messages = app.messages.slice(-500);
        }
      }
    }
  }, 1000);
}

main();

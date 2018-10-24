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
      processMessage (message) {
        if (message.type === 'update') {
          this.modifyCamera(message.uuid, camera => {
            camera.error = false;
            camera.imageVersion++;
          });
        } else if (message.type === 'loading') {
          this.modifyCamera(message.uuid, camera => camera.loading = message.value);
        } else {
          this.messages.push({
            ...message,
            camera: this.cameras.filter(cam => cam.uuid === message.uuid)[0],
            unread: true
          });
          this.modifyCamera(message.uuid, camera => camera.error = message.message);
          this.setCameraError(message.uuid, message.message);
          if (this.messages.length > 50) {
            this.messages = this.messages.slice(-50);
          }
        }
      },
      modifyCamera (uuid, fn) {
        for (const camera of this.cameras) {
          if (camera.uuid === uuid) {
            fn(camera);
            break;
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
      imageVersion: 1,
      loading: false
    }));
    const socket = new WebSocket(`ws://${location.host}/events`);
    socket.onmessage = message => {
      app.processMessage(JSON.parse(message.data));
    };
  } catch (error) {
    alert('Не удалось инициализировать приложение. См. консоль браузера.');
    console.error(error);
  }
}

main();

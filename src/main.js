import Vue from 'vue';
import App from './App';
import ReconnectingWebSocket from 'reconnecting-websocket';

Vue.config.productionTip = false;


async function main () {
  const app = new Vue({
    el: '#app',
    components: { App },
    data: {
      cameras: null,
      connectionLost: false,
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
          const camera = this.modifyCamera(
            message.uuid, camera => camera.error = message.message
          );
          if (!camera) {
            return;
          }
          this.messages.push({
            ...message, camera,
            unread: true
          });
          if (this.messages.length > 50) {
            this.messages = this.messages.slice(-50);
          }
        }
      },
      modifyCamera (uuid, fn) {
        if (!this.cameras) {
          return;
        }
        for (const camera of this.cameras) {
          if (camera.uuid === uuid) {
            fn(camera);
            return camera;
          }
        }
      }
    },
    template: `
      <App
        :cameras='cameras' :messages='messages'
        :connectionLost='connectionLost'
      />
    `
  });

  try {
    const socket = new ReconnectingWebSocket(`ws://${location.host}/events`);
    socket.onopen = async () => {
      const response = await fetch('/cameras');
      const cameras = await response.json();
      app.cameras = cameras.map(camera => ({
        ...camera,
        imageVersion: 1
      }));
      app.connectionLost = false;
    };
    socket.onclose = () => {
      app.connectionLost = true;
    };
    socket.onmessage = message => {
      app.processMessage(JSON.parse(message.data));
    };
  } catch (error) {
    alert('Не удалось инициализировать приложение. См. консоль браузера.');
    console.error(error);
  }
}

main();

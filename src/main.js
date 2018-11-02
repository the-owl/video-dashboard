import Vue from 'vue';
import App from './App';
import ReconnectingWebSocket from 'reconnecting-websocket';
import throttle from 'lodash/throttle';
import moment from 'moment';
// use sockjs as websocket "polyfill"
import SockJS from 'sockjs-client';

moment.relativeTimeThreshold('s', 60);
moment.relativeTimeThreshold('ss', 5);
moment.locale('ru');

Vue.config.productionTip = false;

const DEFAULT_SETTINGS = {
  fontSize: 18
};
const SETTINGS_MIN_WRITE_INTERVAL = 1000;
const SETTINGS_STORAGE_KEY = 'videoDashboardSettings';

function readSettings () {
  const storageString = localStorage.getItem(SETTINGS_STORAGE_KEY);
  return storageString ? JSON.parse(storageString) : null;
}

function writeSettings (value) {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(value));
}

async function main () {
  const app = new Vue({
    el: '#app',
    components: { App },
    data: {
      cameras: null,
      connectionLost: false,
      currentTime: moment(),
      maxImageVersion: 0,
      messages: [],
      settings: readSettings() || DEFAULT_SETTINGS,
      showLogs: false
    },
    methods: {
      processMessage (message) {
        if (message.type === 'update') {
          this.modifyCamera(message.uuid, camera => {
            camera.error = false;
            camera.imageVersion++;
            camera.lastUpdated = moment.unix(message.time / 1000);
            this.maxImageVersion = Math.max(this.maxImageVersion, camera.imageVersion);
          });
        } else if (message.type === 'loading') {
          this.modifyCamera(message.uuid, camera => camera.loading = message.value);
        } else if (message.type === 'time') {
          const offset = message.value - Date.now();
          moment.now = () => {
            return Date.now() + offset;
          };
          this.updateCurrentTime();
        } else {
          const camera = this.modifyCamera(
            message.uuid, camera => {
              camera.error = message.message;
              camera.lastUpdated = moment.unix(message.time / 1000);
            }
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
      },
      updateCurrentTime () {
        this.currentTime = moment();
      }
    },
    created () {
      this.$watch('settings', throttle(() => {
        writeSettings(this.settings);
      }, SETTINGS_MIN_WRITE_INTERVAL), { deep: true });
    },
    template: `
      <App
        :cameras='cameras' :messages='messages' :currentTime='currentTime'
        :connectionLost='connectionLost' :settings='settings'
      />
    `
  });

  function connect () {
    const socket = new SockJS(`/events`);
    socket.onopen = async () => {
      const response = await fetch('/cameras', {
        credentials: 'include',
        mode: 'cors'
      });
      const cameras = await response.json();
      app.cameras = cameras.map(camera => ({
        ...camera,
        imageVersion: app.maxImageVersion + 1,
        lastUpdated: camera.lastUpdated && moment.unix(camera.lastUpdated / 1000)
      }));
      app.connectionLost = false;
    };
    socket.onclose = () => {
      app.connectionLost = true;
      setTimeout(connect, 2000);
    };
    socket.onmessage = message => {
      app.processMessage(JSON.parse(message.data));
    };
  }

  try {
    connect();
    setInterval(() => app.updateCurrentTime(), 10000);
  } catch (error) {
    alert('Не удалось инициализировать приложение. См. консоль браузера.');
    console.error(error);
  }
}

main();

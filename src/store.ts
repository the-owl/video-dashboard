import { createStore } from 'vuex';
import moment from 'moment';
// use sockjs as websocket "polyfill" for shared hosting
import SockJS from 'sockjs-client';
import createPersistedState from 'vuex-persistedstate';
import { Camera } from '@/types';


const CURRENT_TIME_UPDATE_INTERVAL = 10000; // ms
const DEFAULT_SETTINGS = {
  fontSize: 18
};
const MAX_MESSAGE_COUNT = 50;
const SETTINGS_STORAGE_KEY = 'videoDashboardSettings';

function modifyCamera(cameras: any[], id: string, fn: (camera: any) => void) {
  if (!cameras) {
    return;
  }
  for (const camera of cameras) {
    if (camera.id === id) {
      fn(camera);
      return camera;
    }
  }
}

function readSettings() {
  const storageString = localStorage.getItem(SETTINGS_STORAGE_KEY);
  return storageString ? JSON.parse(storageString) : null;
}

function setMomentTimeCorrection(correctTimestamp: number) {
  const offset = correctTimestamp - Date.now();
  moment.now = () => Date.now() + offset;
}

export const store = createStore({
  actions: {
    initialize ({ commit, dispatch, state }) {
      if (!state.authToken) {
        throw new Error('Attempt to initialize in non-authorized state');
      }

      return new Promise<void>((resolve, reject) => {
        const socket = new SockJS(`/events`);
        socket.onopen = async () => {
          try {
            socket.send(state.authToken!);
            await dispatch('loadCameras');
            await dispatch('setupTimeUpdater');
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        socket.onerror = reject;
        socket.onclose = () => {
          commit('setConnectionStatus', false);
          setTimeout(() => dispatch('initialize'), 2000);
        };
        socket.onmessage = (message: any) => {
          dispatch('processSocketMessage', JSON.parse(message.data));
        };
      });
    },

    async loadCameras ({ commit, state }) {
      const response = await fetch('/cameras', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${state.authToken}`,
        },
        mode: 'cors'
      });
      const cameras = await response.json();
      commit('setCameras', cameras.map((camera: any) => ({
        ...camera,
        lastUpdated: camera.lastUpdated && moment.unix(camera.lastUpdated / 1000)
      })));
      commit('forceUpdateAllCameras');
      commit('setConnectionStatus', true);
    },

    async login({ commit }, password: string) {
      const response = await fetch('/login', {
        body: JSON.stringify({ password }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        mode: 'cors',
      });
      if (response.status !== 200) {
        return false;
      }
      const { token } = await response.json();
      commit('setAuthToken', token);
      return true;
    },

    processSocketMessage ({ commit }, message) {
      switch (message.type) {
        case 'update':
          commit('updateCamera', {
            failureCounter: message.failureCounter,
            time: moment.unix(message.time / 1000),
            id: message.id
          });
          commit('setPoweredOff', {
            id: message.id,
            value: false
          });
          break;
        case 'loading':
          commit('setLoadingStatus', {
            id: message.id,
            value: message.value
          });
          break;
        case 'time':
          setMomentTimeCorrection(message.value);
          commit('setCurrentTime', moment());
          break;
        case 'error':
          commit('setCameraError', {
            error: message.message,
            failureCounter: message.failureCounter,
            time: moment.unix(message.time / 1000),
            id: message.id
          });
          break;
        case 'poweredOff':
          commit('setPoweredOff', {
            id: message.id,
            value: message.poweredOff
          });
          break;
      }
    },

    setupTimeUpdater ({ commit }) {
      setInterval(() => {
        commit('setCurrentTime', moment());
      }, CURRENT_TIME_UPDATE_INTERVAL);
    },

    async toggleCameraPoweredOff ({ commit, state }, camera) {
      commit('toggleCameraPoweredOff', camera.id);
      await fetch('/cameras/' + camera.id, {
        body: JSON.stringify({ poweredOff: camera.isPoweredOff }),
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${state.authToken}`,
          'Content-Type': 'application/json'
        },
        method: 'PATCH',
        mode: 'cors'
      });
    }
  },
  getters: {
    authorized(state) {
      return Boolean(state.authToken);
    },
    unreadMessagesCount (state) {
      return state.messages.filter(m => m.unread).length;
    }
  },
  mutations: {
    forceUpdateAllCameras (state) {
      state.maxImageVersion++;
      for (const camera of state.cameras!) {
        camera.imageVersion = state.maxImageVersion;
      }
    },
    setAuthToken(state, token: string) {
      state.authToken = token;
    },
    setCameraError (state, { error, failureCounter, time, id }) {
      const camera = modifyCamera(state.cameras!, id, camera => {
        camera.error = error;
        camera.failureCounter = failureCounter;
        camera.lastUpdated = time;
      });
      if (camera && !camera.isPoweredOff) {
        state.messages.push({
          camera,
          message: error,
          time,
          unread: true
        });
        if (state.messages.length > MAX_MESSAGE_COUNT) {
          state.messages = state.messages.slice(-MAX_MESSAGE_COUNT);
        }
      }
    },
    setCameras (state, cameras) {
      state.cameras = cameras;
    },
    setConnectionStatus (state, status) {
      state.connectionLost = !status;
    },
    setCurrentTime (state, time) {
      state.currentTime = time;
    },
    setFontSize (state, fontSize) {
      state.settings.fontSize = fontSize;
    },
    setLoadingStatus (state, { id, value }) {
      modifyCamera(state.cameras!, id, camera => camera.loading = value);
    },
    setPoweredOff(state, { id, value }) {
      modifyCamera(state.cameras!, id, camera => {
        camera.isPoweredOff = value;
      });
    },
    toggleCameraPoweredOff (state, id) {
      modifyCamera(state.cameras!, id,
        camera => camera.isPoweredOff = !camera.isPoweredOff
      );
    },
    updateCamera (state, { failureCounter, time, id }) {
      const camera = modifyCamera(state.cameras!, id, camera => {
        camera.error = false;
        camera.failureCounter = failureCounter;
        camera.imageVersion++;
        camera.lastUpdated = time;
      });
      if (camera) {
        state.maxImageVersion = Math.max(state.maxImageVersion, camera.imageVersion);
      }
    }
  },
  plugins: [createPersistedState({
    key: 'settings',
    paths: ['settings', 'authToken'],
  })],
  state: {
    authToken: null as string | null,
    cameras: null as Camera[] | null,
    connectionLost: false,
    currentTime: moment(),
    maxImageVersion: 0,
    messages: [] as any[],
    settings: {
      ...DEFAULT_SETTINGS,
      ...(readSettings() || {}),
    },
    showLogs: false
  }
});

export function useStore() {
  return store;
}

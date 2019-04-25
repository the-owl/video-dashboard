<template>
  <div class='root' v-if='cameras'>
    <transition name='slide-out'>
      <menu-panel v-if='menuVisible' :ok='!connectionLost' :messages='messages' @close='hideMenu'
                  :settings='settings' :cameras='cameras' />
    </transition>

    <transition name='fade'>
      <div class='backdrop' v-if='menuVisible' @click='hideMenu'></div>
    </transition>

    <top-bar :ok='!connectionLost' :unreadCount='unreadCount' @toggleMenu='showMenu'>
      Все камеры
    </top-bar>
    <camera-grid :cameras='cameras' :settings='settings' :currentTime='currentTime' />
  </div>
  <div class='loading' v-else>
    Загружаем камеры...
  </div>
</template>

<script>
import MenuPanel from './MenuPanel';
import CameraGrid from './CameraGrid';
import TopBar from './TopBar';
import moment from 'moment';

export default {
  components: {
    CameraGrid, MenuPanel, TopBar
  },
  computed: {
    unreadCount () {
      return this.messages.filter(m => m.unread).length;
    }
  },
  data () {
    return {
      menuVisible: false
    };
  },
  methods: {
    hideMenu () {
      this.menuVisible = false;
    },
    showMenu () {
      this.menuVisible = true;
      for (const message of this.messages) {
        message.unread = false;
      }
    }
  },
  name: 'App',
  props: ['cameras', 'messages', 'connectionLost', 'currentTime', 'settings']
}
</script>

<style scoped>
  .root, .loading {
    display: flex;
    height: 100%;
    width: 100%;
  }

  .root {
    flex-direction: column;
  }

  .loading {
    align-items: center;
    color: #ccc;
    font-size: 2em;
    justify-content: center;
  }

  .root .camera-grid {
    flex: 1;
  }

  .backdrop {
    background-color: rgba(87, 87, 87, 0.75);
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 1;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.35s linear;
  }

  .fade-enter-active, .fade-leave {
    opacity: 1;
  }

  .fade-enter, .fade-leave-active {
    opacity: 0;
  }
</style>

<style>
  html, body {
    font-family: sans-serif;
    height: 100%;
    margin: 0;
    overflow: hidden;
    padding: 0;
    width: 100%;
  }

  .slide-out-enter-active, .slide-out-leave-active {
    transition: transform 0.35s ease-in-out !important;
  }

  .slide-out-enter-active, .slide-out-leave {
    transform: translateX(0);
  }

  .slide-out-enter, .slide-out-leave-active {
    transform: translateX(-100%);
  }
</style>

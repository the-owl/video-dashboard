<template>
  <div class='root' v-if='cameras'>
    <transition name='slide-out'>
      <log-panel v-if='showLogs' :messages='messages' @close='toggleLogs' />
      <button v-else @click='toggleLogs' class='messages-button'>
        Сообщения
        <span v-if='unreadCount' class='badge'>{{ unreadCount }}</span>
      </button>
    </transition>

    <camera-grid :cameras='cameras' />
  </div>
  <div class='loading' v-else>
    Загружаем камеры...
  </div>
</template>

<script>
import LogPanel from './LogPanel';
import CameraGrid from './CameraGrid';

export default {
  components: {
    CameraGrid, LogPanel
  },
  computed: {
    unreadCount () {
      return this.messages.filter(m => m.unread).length;
    }
  },
  data () {
    return {
      showLogs: false
    };
  },
  methods: {
    toggleLogs () {
      this.showLogs = !this.showLogs;
      for (const message of this.messages) {
        message.unread = false;
      }
    }
  },
  name: 'App',
  props: ['cameras', 'messages']
}
</script>

<style scoped>
  .root, .loading {
    display: flex;
    height: 100%;
    width: 100%;
  }

  .loading {
    align-items: center;
    color: #ccc;
    font-size: 2em;
    justify-content: center;
  }

  .messages-button {
    background: white;
    border: 1px solid #ddd;
    border-radius: 20px;
    box-shadow: rgba(127, 127, 127, 0.5) 0 2px 5px;
    bottom: 30px;
    color: #666;
    font-size: 14px;
    left: 30px;
    margin-bottom: 0;
    outline: none !important;
    padding: 10px 30px;
    position: absolute;
    transition: background-color .5s, transform .3s ease-out, box-shadow .3s ease-out;
    user-select: none;
    z-index: 10;
  }

  .messages-button:hover {
    background-color: #f6f6f6;
  }

  .messages-button:active {
    background-color: #f1f1f1;
    box-shadow: rgba(127, 127, 127, 0.5) 0 1px 3px;
    transform: perspective(100px) translateZ(-2px);
  }

  .messages-button .badge {
    align-items: center;
    background: red;
    border-radius: 20px;
    bottom: 0;
    color: white;
    display: flex;
    font-size: 15px;
    font-weight: bold;
    height: 25px;
    justify-content: center;
    margin: 0 -7px -7px 0;
    min-width: 25px;
    padding: 0 1px;
    position: absolute;
    right: 0;
  }

  .root .camera-grid {
    flex: 1;
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
    transform: translateX(-200%);
  }
</style>

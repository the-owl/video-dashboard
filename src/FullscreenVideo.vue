<template>
  <div class='fullscreen-video'>
    <h2 class='header'>
      {{ camera.name }}
      <button class='close-button' @click='$emit("close")'>✕</button>
    </h2>
    <div class='image-container'>
      <component v-if="open" :is="videoComponent" :camera="camera" @load="loaded = true" />
      <transition name='iframe'>
        <img v-if='!open || !loaded' :src='imgSrc' />
      </transition>
      <transition name='iframe'>
        <div v-if='open && !loaded' class='loading-tint'>
          Загрузка видео...
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import IpeyeVideo from './providers/IpeyeVideo';
import RtspMeVideo from './providers/RtspMeVideo';

export default {
  computed: {
    videoComponent() {
      return {
        ipeye: IpeyeVideo,
        'rtsp.me': RtspMeVideo,
      }[this.camera.backend];
    },
  },
  data () {
    return {
      loaded: false
    };
  },
  props: ['camera', 'imgSrc', 'open']
}
</script>

<style scoped>
  .fullscreen-video {
    background-color: white;
    display: flex;
    flex-direction: column;
  }

  .header {
    align-items: center;
    box-shadow: #8888 0 1px 4px;
    display: flex;
    font-size: 24px;
    justify-content: space-between;
    margin: 0;
    padding: 15px;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 16px;
  }

  .fullscreen-video .image-container {
    flex: 1;
    position: relative;
  }

  .image-container > * {
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }

  .loading-tint {
    align-items: center;
    color: white;
    display: flex;
    justify-content: center;
    font-size: 32px;
    font-weight: bold;
    text-shadow: #000 0 0 5px;
    z-index: 6;
  }

  .image-container > img {
    height: 100%;
    max-height: 100%;
    object-fit: contain;
    width: 100%;
    z-index: 5;
  }

  .iframe-enter-active {
    transition: opacity 0.4s ease;
  }

  .iframe-leave-active {
    transition: opacity 0.65s ease;
  }

  .iframe-enter-active {
    opacity: 1;
  }

  .iframe-leave-active, .iframe-enter {
    opacity: 0;
  }
</style>


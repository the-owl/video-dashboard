<template>
  <div class='fullscreen-video'>
    <h2 class='header'>
      {{ camera.name }}
      <button class='close-button' @click='$emit("close")'>✕</button>
    </h2>
    <div class='image-container'>
      <iframe v-if='open' :src='src' marginwidth="0" marginheight="0" @load='loaded = true'></iframe>
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
export default {
  computed: {
    src () {
      return `https://ipeye.ru/ipeye_service/api/api.php?dev=${this.camera.uuid}&tupe=rtmp&autoplay=1&logo=1`;
    }
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
    justify-content: space-between;
    margin: 0;
    padding: 15px;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 16px;
  }

  .fullscreen-video iframe {
    border: none;
    box-sizing: border-box;
    height: 100%;
    margin: 0;
    padding: 0;
    width: 100%;
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
    max-height: 100%;
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


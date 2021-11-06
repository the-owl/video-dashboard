<template>
  <div class="fullscreen-video">
    <h2 class="fullscreen-video__header">
      {{ camera.name }}
      <button class="fullscreen-video__close-button" @click="$emit('close')">
        ✕
      </button>
    </h2>
    <div class="image-container">
      <iframe
        v-if="open"
        class="image-container__frame image-container__item"
        :src="frameSrc"
        marginwidth="0"
        marginheight="0"
        allowfullscreen
        seamless="seamless"
        @load="onFrameLoad"
      />
      <Transition name="iframe">
        <img v-if="!open || !loaded" class="image-container__image image-container__item" :src="imgSrc">
      </Transition>
      <Transition name="iframe">
        <div v-if="open && !loaded" class="image-container__loading-tint image-container__item">
          Загрузка видео...
        </div>
      </Transition>
    </div>
  </div>
</template>

<script lang="ts">
import VueTypes from 'vue-types';
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
  props: {
    camera: VueTypes.object.isRequired,
    imgSrc: VueTypes.string.isRequired,
    open: VueTypes.bool.def(false),
  },
  setup(props) {
    const loaded = ref(false);
    const frameSrc = computed(() => (props.camera.backend === 'ipeye' ?
      `https://ipeye.ru/ipeye_service/api/iframe.php?iframe_player=1&dev=${props.camera.id}&tupe=rtmp&autoplay=1&logo=1` :
      `https://rtsp.me/embed/${props.camera.id}`));

    function onFrameLoad() {
      loaded.value = true;
    }

    return {
      frameSrc,
      loaded,
      onFrameLoad,
    };
  },
});
</script>

<style lang="scss" scoped>
.fullscreen-video {
  background-color: #4b4b4b;
  display: flex;
  flex-direction: column;

  &__header {
    align-items: center;
    background-color: white;
    box-shadow: #8888 0 1px 4px;
    display: flex;
    font-size: 24px;
    justify-content: space-between;
    margin: 0;
    padding: 15px;
  }

  &__close-button {
    background: none;
    border: none;
    font-size: 16px;
  }
}

.image-container {
  flex: 1;
  position: relative;

  &__frame {
    border: none;
    box-sizing: border-box;
    height: 100%;
    margin: 0;
    padding: 0;
    width: 100%;
  }

  &__item {
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }

  &__image {
    height: 100%;
    max-height: 100%;
    object-fit: contain;
    width: 100%;
    z-index: 5;
  }

  &__loading-tint {
    align-items: center;
    color: white;
    display: flex;
    justify-content: center;
    font-size: 32px;
    font-weight: bold;
    text-shadow: #000 0 0 5px;
    z-index: 6;
  }
}

.iframe {
  &-enter-active {
    opacity: 1;
    transition: opacity 0.4s ease;
  }

  &-leave-active {
    transition: opacity 0.65s ease;
  }

  &-leave-to, &-enter-from {
    opacity: 0;
  }
}
</style>


<template>
  <div :class="['camera', { 'camera_powered-off': isPoweredOff }]">
    <img :src="preview" class="camera__image" @load="onLoaded">
    <div :class="['camera__info', 'camera-info', { 'camera-info_reloaded': reloaded }]">
      <div class="camera-info__text camera-text">
        <span class="camera-text__name">{{ camera.name }}</span>
        <span
          v-if="!isPoweredOff && hasSingleError"
          class="camera-text__error camera-text__error_doubt"
        >?</span>
        <span
          v-if="!isPoweredOff && hasErrors"
          class="camera-text__error"
        >✗</span>
      </div>
      <div class="camera-info__time">
        {{ lastUpdated }}
      </div>
      <div class="camera-info__toggler camera-toggler">
        <input
          class="camera-toggler__input"
          type="checkbox"
          :checked="!isPoweredOff"
          @click.stop
          @change="togglePoweredOff"
        >
      </div>
      <div v-if="camera.loading" class="camera-info__loading">
        <HollowDotsSpinner
          :animation-duration="1500"
          :dot-size="dotSize"
          :dots-num="3"
          color="#ffffff"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref, toRef } from 'vue';
import VueTypes from 'vue-types';
import moment from 'moment';
import { Camera } from '@/types';
import { useStore } from 'vuex';
import { useCameraPreview } from '@/helpers';
import { HollowDotsSpinner } from 'epic-spinners';

export default defineComponent({
  name: 'CameraGridCell',
  components: {
    HollowDotsSpinner,
  },
  props: {
    camera: VueTypes.object.isRequired,
    dotSize: VueTypes.number.isRequired,
  },
  setup(props) {
    const camera = toRef(props, 'camera') as Ref<Camera>;

    const store = useStore();
    const currentTime = computed(() => store.state.currentTime);
    const loadedVersion = ref(null as null | number);

    const hasErrors = computed(() => camera.value.failureCounter > 1);
    const hasSingleError = computed(() => camera.value.failureCounter === 1);
    const isPoweredOff = computed(() => camera.value.isPoweredOff);
    const lastUpdated = computed(() => {
      if (!camera.value.lastUpdated) {
        return 'не обновлялась';
      }
      return moment.min(camera.value.lastUpdated, currentTime.value).from(currentTime.value);
    });
    const preview = useCameraPreview(camera);
    const reloaded = computed(() => loadedVersion.value === camera.value.imageVersion && camera.value.imageVersion > 1);

    function onLoaded() {
      loadedVersion.value = camera.value.imageVersion;
    }

    async function togglePoweredOff() {
      await store.dispatch('toggleCameraPoweredOff', camera.value);
    }

    return {
      camera,
      hasErrors,
      hasSingleError,
      isPoweredOff,
      lastUpdated,
      onLoaded,
      preview,
      reloaded,
      togglePoweredOff,
    };
  },
});
</script>

<style lang="scss" scoped>
@keyframes flash {
  0% {
    background-color: rgba(255, 255, 255, 0);
  }

  1% {
    background-color: rgba(255, 255, 255, 1);
  }

  5% {
    background-color: rgba(255, 255, 255, 0.3);
  }

  10% {
    background-color: rgba(255, 255, 255, 1);
  }

  15% {
    background-color: rgba(255, 255, 255, 0.3);
  }

  20% {
    background-color: rgba(255, 255, 255, 1);
  }

  100% {
    background-color: rgba(255, 255, 255, 0);
  }
}

.camera {
  align-items: center;
  display: flex;
  overflow: hidden;
  position: relative;

  &_powered-off {
    .camera__info {
      background-image: url('./off.svg');
      background-position: center center;
      background-repeat: no-repeat;
      background-size: 50% 70%;
      opacity: 0.5;
    }
  }

  &__info {
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }

  &__image {
    bottom: 0;
    height: 100%;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: 100%;
  }
}

.camera-info {
  &_reloaded {
    animation: flash 1s linear;
  }

  &__loading {
    align-items: center;
    background: rgba(0, 153, 255, 0.658);
    display: flex;
    height: 100%;
    justify-content: center;
    width: 100%;
  }

  &__text {
    bottom: 0;
    left: 5px;
    position: absolute;
  }

  &__time {
    color: white;
    font-size: 0.4em;
    left: 5px;
    opacity: 0;
    position: absolute;
    text-shadow: #000 0 0 2px;
    top: 5px;
    transition: opacity 0.2s linear;
  }

  &:hover &__time {
    opacity: 1;
  }

  &__toggler {
    bottom: 5px;
    height: auto;
    position: absolute;
    right: 5px;
  }
}

.camera-text {
  color: white;
  text-shadow: #000 0 0 5px;

  &__error {
    color: red;
    pointer-events: none;
    user-select: none;

    &_doubt {
      color: yellow;
      font-size: 1.2em;
    }
  }
}

.camera-toggler {
  &__input {
    display: block;
  }
}
</style>

<template>
  <div class="camera-grid" :style="{ fontSize }">
    <div v-for="(row, rowIndex) in cells" :key="rowIndex" class="camera-grid__row">
      <template v-for="(camera, cameraIndex) in row">
        <CameraGridCell
          v-if="camera"
          :key="camera.id"
          class="camera-grid__camera"
          :camera="camera"
          :dot-size="dotSize"
          @click="openFullscreen($event, camera)"
        />
        <div v-else :key="cameraIndex" class="camera-grid__placeholder" />
      </template>
    </div>
    <Transition
      name="fullscreen-transition"
      @enter="onTransitionEnter"
      @after-enter="afterTransitionEnter"
      @leave="onTransitionLeave"
    >
      <FullscreenVideo
        v-if="selectedCamera"
        class="camera-grid__fullscreen-video"
        :camera="selectedCamera"
        :open="animationComplete"
        :img-src="fullscreenPreview"
        @close="closeFullscreen"
      />
    </Transition>
  </div>
</template>

<script lang="ts">
import FullscreenVideo from './FullscreenVideo.vue';
import { computed, defineComponent, nextTick, onUnmounted, Ref, ref } from 'vue';
import { useStore } from 'vuex';
import CameraGridCell from '@/CameraGridCell.vue';
import { useCameraPreview } from '@/helpers';
import { Camera } from '@/types';

const IMAGE_ASPECT_RATIO = 16/9;

type Dimensions = [Ref<number>, Ref<number>];

function useScreenDimensions() {
  const width = ref(window.innerWidth);
  const height = ref(window.innerHeight);

  function updateDimensions() {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  }

  window.addEventListener('resize', updateDimensions);

  onUnmounted(() => {
    window.removeEventListener('resize', updateDimensions);
  });

  return [width, height] as Dimensions;
}

function useGrid(dimensions: Dimensions, count: Ref<number>, cellAspectRatio: Ref<number>) {
  const [width, height] = dimensions;

  return computed(() => {
    const variants = [];
    for (let rowCount = 1; rowCount < count.value; rowCount++) {
      const columnCount = Math.ceil(count.value / rowCount);
      const hasEmptyRows = rowCount * columnCount - count.value >= columnCount;
      if (!hasEmptyRows) {
        variants.push([columnCount, rowCount] as [number, number]);
      }
    }
    const targetAR = width.value / height.value;
    let best = null;
    let bestValue = null;
    for (const variant of variants) {
      const ar = variant[0] / variant[1] * cellAspectRatio.value;
      const dist = Math.abs(ar - targetAR);

      if (!best || (bestValue !== null && dist < bestValue)) {
        best = variant;
        bestValue = dist;
      }
    }
    return best!;
  });
}

function useCellSize(dimensions: Dimensions, grid: Ref<[number, number]>) {
  const cellWidth = computed(() => dimensions[0].value / grid.value[0]);
  const cellHeight = computed(() => dimensions[1].value / grid.value[1]);
  return computed(() => Math.sqrt(cellWidth.value ** 2 + cellHeight.value ** 2));
}

function useDotSize(cellSize: Ref<number>) {
  return computed(() => cellSize.value / 15);
}

function useFontSize(cellSize: Ref<number>, fontSize: Ref<number>) {
  return computed(() => String(cellSize.value * fontSize.value / 100) + 'px');
}

function useFullscreen(dimensions: Dimensions) {
  const animationComplete = ref(false);
  const cellRect = ref(null as DOMRect | null)
  const selectedCamera = ref(null as Camera | null);

  async function closeFullscreen() {
    animationComplete.value = false;
    // wait for next tick so that iframe could be closed before animation starts
    // TODO: check whether this is still relevant with vue 3
    await nextTick();
    selectedCamera.value = null;
  }

  function getStartingPositionStyle() {
    const rect = cellRect.value!;
    return {
      bottom: `${dimensions[1].value - rect.top - rect.height}px`,
      left: `${rect.left}px`,
      right: `${dimensions[0].value - rect.left - rect.width}px`,
      top: `${rect.top}px`
    };
  }

  function openFullscreen(event: MouseEvent, camera: Camera) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    selectedCamera.value = camera;
    cellRect.value = rect;
  }

  function afterTransitionEnter() {
    animationComplete.value = true;
  }

  function onceTransitionStarts(element: HTMLElement, callback: () => void) {
    const onTransitionStart = () => {
      callback();
      element.removeEventListener('transitionstart', onTransitionStart);
    }

    element.addEventListener('transitionstart', onTransitionStart);
  }

  function onTransitionLeave(element: HTMLElement) {
    onceTransitionStarts(element, () => {
      Object.assign(element.style, getStartingPositionStyle());
    });
  }

  function onTransitionEnter(element: HTMLElement) {
    Object.assign(element.style, getStartingPositionStyle());
    onceTransitionStarts(element, () => {
      Object.assign(element.style, {
        bottom: null,
        left: null,
        right: null,
        top: null,
      });
    });
  }

  const fullscreenPreview = useCameraPreview(selectedCamera);

  return {
    afterTransitionEnter,
    animationComplete,
    closeFullscreen,
    fullscreenPreview,
    onTransitionEnter,
    onTransitionLeave,
    openFullscreen,
    selectedCamera,
  };
}

export default defineComponent({
  components: {
    CameraGridCell,
    FullscreenVideo,
  },
  setup() {
    const store = useStore();

    const cameras = computed(() => store.state.cameras);
    const settings = computed(() => store.state.settings);

    const dimensions = useScreenDimensions();
    const grid = useGrid(dimensions, computed(() => cameras.value.length), ref(IMAGE_ASPECT_RATIO));
    const cellSize = useCellSize(dimensions, grid);
    const dotSize = useDotSize(cellSize);
    const fontSize = useFontSize(cellSize, computed(() => settings.value.fontSize));

    const fullscreen = useFullscreen(dimensions);

    const cells = computed(() => {
      const rows = [];
      const maxIndex = cameras.value?.length;

      for (let r = 0; r < grid.value[1]; r++) {
        const row = [];
        for (let c = 0; c < grid.value[0]; c++) {
          const index = grid.value[0] * r + c;
          if (index >= maxIndex) {
            row.push(null);
          } else {
            row.push(cameras.value[index]);
          }
        }
        rows.push(row);
      }

      return rows;
    });

    return {
      cameras,
      cells,
      dotSize,
      fontSize,
      grid,
      ...fullscreen,
    };
  },
});
</script>

<style lang="scss" scoped>
.camera-grid {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  &__row {
    display: flex;
    flex: 1;
    flex-direction: row;
  }

  &__camera, &__placeholder {
    flex: 1;
  }

  &__fullscreen-video {
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    transition: bottom 0.5s ease, left 0.5s ease, right 0.5s ease, top 0.5s ease, opacity 0.5s ease;
  }
}

.fullscreen-transition {
  &-enter-to, &-leave-from {
    opacity: 1;
  }

  &-enter-from, &-leave-to {
    opacity: 0;
  }
}
</style>



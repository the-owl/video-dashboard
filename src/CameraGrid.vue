<template>
  <div class='camera-grid' :style='{ fontSize }'>
    <div v-for='y in grid.rows' class='row' :key='y'>
      <div v-for='x in grid.columns' :class='["column", { "powered-off": isPoweredOff(x, y) }]' :key='x'>
        <img v-if='cameraExists(x, y)'
             :src='source(x, y)' @load='onLoaded(x, y)' />
        <div v-if='cameraExists(x, y)' @click='openFullscreen($event, x, y)'
             :class='{ reloaded: isReloaded(x, y), info: true }'>
          <div class='text'>
            <span class='name'>{{ camera(x, y).name }}</span>
            <span v-if='!isPoweredOff(x, y) && hasSingleError(x, y)' class='error doubt'>?</span>
            <span v-if='!isPoweredOff(x, y) && hasErrors(x, y)' class='error'>✗</span>
          </div>
          <div class='time'>{{ lastUpdated(x, y) }}</div>
          <div v-if='camera(x, y).loading' class='loading'>
            <hollow-dots-spinner
              :animation-duration="1500"
              :dot-size="dotSize"
              :dots-num="3"
              color="#ffffff"
            />
          </div>
        </div>
      </div>
    </div>
    <transition name='fullscreen' @after-enter='fullscreen.open = true'>
      <fullscreen-video v-if='fullscreen' :camera='fullscreen.camera' :style='fullscreen.style'
                        @close='closeFullscreen' :open='fullscreen && fullscreen.open'
                        :imgSrc='fullscreen.imgSrc' />
    </transition>
  </div>
</template>

<script>
import FullscreenVideo from './FullscreenVideo';
import { HollowDotsSpinner } from 'epic-spinners';
import moment from 'moment';

export default {
  components: {
    FullscreenVideo, HollowDotsSpinner
  },
  computed: {
    cellSize () {
      const cellWidth = this.width / this.grid.columns;
      const cellHeight = this.height / this.grid.rows;
      return Math.sqrt(cellWidth * cellWidth + cellHeight * cellHeight);
    },
    dotSize () {
      return this.cellSize / 15;
    },
    fontSize () {
      return String(this.cellSize * this.settings.fontSize / 100) + 'px';
    },
    grid () {
      const variants = [];
      for (let rowCount = 1; rowCount < this.cameras.length; rowCount++) {
        const columnCount = Math.ceil(this.cameras.length / rowCount);
        const hasEmptyRows = rowCount * columnCount - this.cameras.length >= columnCount;
        if (!hasEmptyRows) {
          variants.push([columnCount, rowCount]);
        }
      }
      const targetAR = this.width / this.height;
      let best = null;
      let bestValue = null;
      for (const variant of variants) {
        const ar = variant[0] / variant[1] * (16/9);
        const dist = Math.abs(ar - targetAR);

        if (!best || dist < bestValue) {
          best = variant;
          bestValue = dist;
        }
      }
      return {
        columns: best[0],
        rows: best[1]
      };
    }
  },
  data: function () {
    return {
      fullscreen: null,
      height: window.innerHeight,
      loadedVersions: {},
      width: window.innerWidth
    };
  },
  destroyed () {
    window.removeEventListener('resize', this.updateDimensions);
  },
  methods: {
    camera (x, y) {
      return this.cameras[this.cameraIndex(x, y)];
    },
    cameraExists (x, y) {
      return this.cameraIndex(x, y) < this.cameras.length;
    },
    cameraIndex (x, y) {
      return this.grid.columns * (y - 1) + x - 1;
    },
    closeFullscreen () {
      this.fullscreen.open = false;
      this.$nextTick(() => {
        this.fullscreen = null;
      });
    },
    hasErrors (x, y) {
      return this.camera(x, y).failureCounter > 1;
    },
    hasSingleError (x, y) {
      return this.camera(x, y).failureCounter === 1;
    },
    isPoweredOff (x, y) {
      const camera = this.camera(x, y);
      return camera && camera.isPoweredOff;
    },
    isReloaded (x, y) {
      const index = this.cameraIndex(x, y);
      const camera = this.cameras[index];
      if (!(index in this.loadedVersions)) {
        this.$set(this.loadedVersions, index, null);
      }
      return this.loadedVersions[index] === camera.imageVersion && camera.imageVersion > 1;
    },
    lastUpdated (x, y) {
      const camera = this.camera(x, y);
      if (!camera.lastUpdated) {
        return 'не обновлялась';
      }
      return moment.min(camera.lastUpdated, this.currentTime).from(this.currentTime);
    },
    onLoaded (x, y) {
      const index = this.cameraIndex(x, y);
      this.loadedVersions[index] = this.cameras[index].imageVersion;
    },
    openFullscreen (event, x, y) {
      const camera = this.camera(x, y);
      const rect = event.currentTarget.getBoundingClientRect();
      const style = {
        bottom: `${this.height - rect.top - rect.height}px`,
        left: `${rect.left}px`,
        right: `${this.width - rect.left - rect.width}px`,
        top: `${rect.top}px`
      };
      this.fullscreen = { camera, imgSrc: this.source(x, y), open: false, style };
    },
    source (x, y) {
      const { imageVersion, uuid } = this.cameras[this.cameraIndex(x, y)];
      return `/snapshots/${uuid}/output.jpg?v=` + imageVersion;
    },
    updateDimensions () {
      this.height = window.innerHeight;
      this.width = window.innerWidth;
    }
  },
  mounted () {
    this.$nextTick(() => {
      window.addEventListener('resize', this.updateDimensions);
    })
  },
  props: ['cameras', 'currentTime', 'settings']
}
</script>

<style scoped>
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

  .camera-grid {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  .row {
    display: flex;
    flex: 1;
    flex-direction: row;
  }

  .column {
    align-items: center;
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  .column.powered-off img {
    filter: contrast(25%);
    transform: scale(1.1);
  }

  .column.powered-off .text {
    opacity: 0.5;
  }

  img {
    bottom: 0;
    height: 100%;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: 100%;
  }

  .info.reloaded {
    animation: flash 1s linear;
  }

  .text {
    color: white;
    text-shadow: #000 0 0 5px;
  }

  .error {
    color: red;
  }

  .error.doubt {
    color: yellow;
    font-size: 1.2em;
  }

  .ok {
    color: rgb(0, 219, 0);
  }

  .error, .ok {
    pointer-events: none;
    user-select: none;
  }

  .info {
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }

  .info .loading {
    align-items: center;
    background: rgba(0, 153, 255, 0.658);
    display: flex;
    height: 100%;
    justify-content: center;
    width: 100%;
  }

  .info .text {
    bottom: 0;
    left: 5px;
    position: absolute;
  }

  .info .time {
    color: white;
    font-size: 0.4em;
    left: 5px;
    opacity: 0;
    position: absolute;
    text-shadow: #000 0 0 2px;
    top: 5px;
    transition: opacity 0.2s linear;
  }

  .info:hover .time {
    opacity: 1;
  }

  .fullscreen-video {
    position: absolute;
    transition: bottom 0.5s ease, left 0.5s ease, right 0.5s ease, top 0.5s ease, opacity 0.5s ease;
  }

  .fullscreen-enter-active, .fullscreen-leave {
    opacity: 1;
  }

  .fullscreen-enter, .fullscreen-leave-active {
    opacity: 0;
  }

  .fullscreen-video:not(.fullscreen-enter):not(.fullscreen-leave-active) {
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    top: 0 !important;
  }
</style>



<template>
  <div class='camera-grid' :style='{ fontSize }'>
    <div v-for='y in grid.rows' class='row' :key='y'>
      <div v-for='x in grid.columns' class='column' :key='x'>
        <img v-if='cameraExists(x, y)' :src='source(x, y)' />
        <div v-if='cameraExists(x, y)' class='info' @click='openFullscreen($event, x, y)'>
          <div class='text'>
            <span class='name'>{{ camera(x, y).name }}</span>
            <span v-if='camera(x, y).error' class='error'>✗</span>
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

export default {
  components: {
    FullscreenVideo
  },
  computed: {
    fontSize () {
      const cellWidth = this.width / this.grid.columns;
      const cellHeight = this.height / this.grid.rows;
      const diagonal = Math.sqrt(cellWidth * cellWidth + cellHeight * cellHeight);
      return String(diagonal / 8) + 'px';
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
  props: ['cameras']
}
</script>

<style scoped>
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
    position: relative;
  }

  img {
    height: 100%;
    width: 100%;
  }

  .text {
    color: white;
    text-shadow: #000 0 0 5px;
  }

  .error {
    color: red;
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

  .info .text {
    bottom: 0;
    left: 5px;
    position: absolute;
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



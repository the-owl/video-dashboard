<template>
  <div class='camera-grid'>
    <div v-for='y in grid.rows' class='row' :key='y'>
      <div v-for='x in grid.columns' class='column' :key='x'>
        <img v-if='cameraExists(x, y)' :src='source(x, y)' />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    grid () {
      const variants = [];
      for (let rowCount = 1; rowCount < this.cameras.length; rowCount++) {
        const columnCount = Math.ceil(this.cameras.length / rowCount);
        variants.push([columnCount, rowCount]);
      }
      const targetAR = window.innerWidth / window.innerHeight;
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
  methods: {
    cameraExists (x, y) {
      return this.cameraIndex(x, y) < this.cameras.length;
    },
    cameraIndex (x, y) {
      return this.grid.columns * (y - 1) + x - 1;
    },
    source (x, y) {
      const { imageVersion, uuid } = this.cameras[this.cameraIndex(x, y)];
      return `/snapshots/${uuid}/output.jpg?v=` + imageVersion;
    }
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
  }

  img {
    height: 100%;
    width: 100%;
  }
</style>



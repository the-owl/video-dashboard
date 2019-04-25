<template>
  <div class='settings'>
    <div class='group with-slider'>
      <h5>Размер шрифта подписей камер</h5>
      <slider :min='5' :max='30' :real-time='true' :tooltip-dir='"bottom"'
              v-model='settings.fontSize' />
    </div>
    <div class='group top-align'>
      <h5>Неактивные камеры</h5>
      <div class='camera-list'>
        <label v-for='camera in cameras' :key='camera.uuid' :class="{ inactive: isInactive(camera) }">
          <input type='checkbox' :checked='isInactive(camera)' @change="toggle(camera)" />
          {{ camera.name }}
        </label>
      </div>
    </div>
    <div class='spacer'></div>
    <p class='comment'>
      Настройки из этого раздела хранятся локально на устройстве.
      Если открыть эту страницу в другом браузере или на другом устройстве, то значения будут
      отличаться.
    </p>
  </div>
</template>

<script>
  import Slider from 'vue-slider-component';

  export default {
    components: {
      Slider
    },
    methods: {
      isInactive (camera) {
        return this.settings.inactiveCameras.indexOf(camera.uuid) !== -1;
      },
      toggle (camera) {
        if (this.isInactive(camera)) {
          this.settings.inactiveCameras = this.settings.inactiveCameras.filter(
            id => id !== camera.uuid
          );
        } else {
          this.settings.inactiveCameras.push(camera.uuid);
        }
      }
    },
    props: ['cameras', 'settings']
  };
</script>

<style scoped>
  .comment {
    color: #aaa;
    font-size: 14px;
    font-style: italic;
    margin: 0;
  }

  .spacer {
    flex: 1;
  }

  .settings {
    display: flex;
    flex-direction: column;
    padding: 0 10px 10px 10px;
  }

  .group {
    align-items: center;
    border-bottom: 1px dotted #ccc;
    display: flex;
    flex-wrap: wrap;
    padding: 5px 0;
  }

  .group > h5 {
    font-weight: 500;
    font-size: 14px;
    margin: 0 5px;
    min-width: 250px;
  }

  .group.top-align {
    align-items: flex-start;
  }

  .group.with-slider {
    padding-bottom: 32px;
  }

  .camera-list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .camera-list > label {
    min-width: 100px;
  }

  .group > :not(h5) {
    flex: 1;
    min-width: 200px;
  }
</style>

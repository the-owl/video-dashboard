<template>
  <div class='settings'>
    <div class='group'>
      <h5>Размер шрифта подписей камер</h5>
      <slider :min='5' :max='30' :real-time='true' :tooltip-dir='"top"'
              v-model='settings.fontSize' />
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
    props: ['settings']
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
    padding: 32px 10px 10px 10px;
  }

  .group {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
  }

  .group > h5 {
    font-weight: 500;
    font-size: 14px;
    margin: 5px;
  }

  .group > :not(h5) {
    flex: 1;
    min-width: 200px;
  }
</style>

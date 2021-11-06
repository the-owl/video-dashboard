<template>
  <div class="settings">
    <div class="settings-group settings-group_with-slider">
      <div class="settings-group__content">
        <h5 class="settings-group__header">
          Размер шрифта подписей камер
        </h5>
        <Slider
          v-model="fontSize"
          class="settings-group__slider"
          :min="5"
          :max="30"
          tooltip-placement="bottom"
        />
      </div>
      <p class="settings-group__comment">
        Эта настройка хранится локально на устройстве.
        Если открыть эту страницу в другом браузере или на другом устройстве, то значение будет
        отличаться.
      </p>
    </div>
    <div class="settings__spacer" />
  </div>
</template>

<script lang="ts">
import Slider from 'vue-slider-component';
import 'vue-slider-component/theme/antd.css'
import { useStore } from 'vuex';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  components: {
    Slider
  },
  setup() {
    const store = useStore();

    const fontSize = computed({
      get() {
        return store.state.settings.fontSize;
      },
      set(value: number) {
        store.commit('setFontSize', value);
      },
    });

    return {
      fontSize,
    };
  },
});
</script>

<style lang="scss" scoped>
.settings {
  padding: 0 10px 10px 10px;

  &__spacer {
    flex: 1;
  }
}

.settings-group {
  display: flex;
  flex-direction: column;
  padding: 6px;

  &__comment {
    color: #aaa;
    font-size: 13px;
    font-style: italic;
    margin: 0;
  }

  &__content {
    align-items: center;
    display: flex;
    flex: 1;
    flex-direction: row;
    padding: 5px 0;

    @media (max-width: 768px) {
      align-items: flex-start;
      flex-direction: column;

      @at-root .settings-group__slider {
        flex: 0 0 auto !important;
        margin-top: 10px;
        width: 100% !important;
      }
    }
  }

  &__header {
    font-weight: 500;
    font-size: 14px;
    margin: 0;
    min-width: 250px;
  }

  &__slider {
    flex: 1;
    min-width: 200px;
  }

  &_with-slider > &__content {
    padding-bottom: 10px;
  }
}
</style>

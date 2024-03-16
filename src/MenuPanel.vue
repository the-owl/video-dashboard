<template>
  <div class="menu-panel">
    <TopBar menu-mode closable :ok="ok" @close="$emit('close')">
      Меню
    </TopBar>
    <section class="menu-section">
      <h2 class="menu-section__header">
        Настройки
      </h2>
      <Settings class="menu-section__content" />
    </section>
    <section class="menu-section menu-section_full-height">
      <h2 class="menu-section__header">
        Логи просмотров камер клиентами
      </h2>
      <CameraViewHistory />
    </section>
  </div>
</template>

<script lang="ts">
import Settings from './Settings.vue';
import TopBar from './TopBar.vue';
import { defineComponent } from 'vue';
import VueTypes from 'vue-types';
import CameraViewHistory from '@/WatcherLogLinks.vue';

export default defineComponent({
  components: {
    CameraViewHistory,
    Settings, TopBar
  },
  props: {
    ok: VueTypes.bool.def(true),
  },
});
</script>

<style lang="scss" scoped>
.menu-panel {
  background: white;
  border-right: 1px solid #bbb;
  box-shadow: rgba(127, 127, 127, 0.5) 0 0 5px;
  display: flex;
  flex-direction: column;
  height: 100%;
  left: -50px;
  padding-left: 50px;
  position: absolute;
  top: 0;
  width: 65vw;
  z-index: 15;
}

.menu-section {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  min-height: 35px;
  transition: flex-grow 0.35s ease;

  & + .menu-section .menu-section__header {
    border-top: 1px solid #666;
  }

  &_full-height {
    flex: 1;
  }

  &__header {
    align-items: center;
    border-bottom: 1px solid #ccc;
    cursor: pointer;
    display: flex;
    flex: 0 0 35px;
    font-size: 20px;
    height: 35px;
    justify-content: flex-start;
    margin: 0;
    padding: 0 15px;
  }

  &__content {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }
}

@media (max-width: 350px) {
  .menu-panel {
    width: 100vw;
  }
}
</style>

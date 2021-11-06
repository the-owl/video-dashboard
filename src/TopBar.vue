<template>
  <div :class="['top-bar', { 'top-bar_error': !ok, 'top-bar_stretch': closable }]">
    <button v-if="!menuMode" class="top-bar__menu-button menu-button" @click="$emit('toggleMenu')">
      <div class="menu-button__stripe" />
      <div class="menu-button__stripe" />
      <div class="menu-button__stripe" />
    </button>
    <span v-if="!ok" class="top-bar__status">
      Соединение разорвано! Ожидаем соединения...
    </span>
    <span v-else class="top-bar__status">
      <slot />
    </span>
    <button v-if="closable" class="top-bar__close-button" @click="$emit('close')">
      ✕
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import VueTypes from 'vue-types';

export default defineComponent({
  name: 'TopBar',
  props: {
    closable: VueTypes.bool.def(false),
    menuMode: VueTypes.bool.def(false),
    ok: VueTypes.bool.def(true),
  },
});
</script>

<style lang="scss" scoped>
.top-bar {
  align-items: center;
  background: rgb(43, 219, 20);
  display: flex;
  height: 30px;
  justify-content: flex-start;
  padding: 0 15px;

  &_stretch {
    justify-content: space-between;
  }

  &_error {
    background: rgb(255, 23, 23);
  }

  &__status {
    color: white;
    font-size: 18px;
    font-weight: 600;
  }

  &__close-button {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    outline: none !important;
  }

  &__menu-button + &__status {
    padding-left: 25px;
  }
}

.menu-button {
  align-items: stretch;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 12px;
  justify-content: space-between;
  outline: none !important;
  padding: 0;
  transition: transform 0.3s ease;
  width: 25px;

  &:active {
    transform: scale(1.1);
  }

  &__stripe {
    background: white;
    height: 2px;
  }
}
</style>

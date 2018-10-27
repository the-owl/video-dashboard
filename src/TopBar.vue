<template>
  <div :class='[{ error: !ok, stretch: closable }, "top-bar"]'>
    <button v-if='!menuMode' class='menu-button' @click='$emit("toggleMenu")'>
      <div class='stripe'></div>
      <div class='stripe'></div>
      <div class='stripe'></div>
    </button>
    <span v-if='!ok' class='status'>
      Соединение разорвано! Ожидаем соединения...
    </span>
    <span v-else class='status'>
      <slot></slot>
    </span>
    <button v-if='closable' class='close-button' @click='$emit("close")'>✕</button>
  </div>
</template>

<script>
export default {
  name: 'top-bar',
  props: ['closable', 'menuMode', 'ok']
};
</script>

<style scoped>
  .top-bar {
    align-items: center;
    background: rgb(43, 219, 20);
    display: flex;
    height: 50px;
    justify-content: flex-start;
    padding: 0 15px;
  }

  .top-bar.stretch {
    justify-content: space-between;
  }

  .top-bar.error {
    background: rgb(255, 23, 23);
  }

  .status {
    color: white;
    font-size: 18px;
    font-weight: 600;
  }

  .menu-button + .status {
    padding-left: 25px;
  }

  .menu-button {
    align-items: stretch;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    height: 16px;
    justify-content: space-between;
    outline: none !important;
    padding: 0;
    transition: transform 0.3s ease;
    width: 25px;
  }

  .menu-button:active {
    transform: scale(1.1);
  }

  .menu-button .stripe {
    background: white;
    height: 2px;
  }

  .badge {
    align-items: center;
    background: red;
    border-radius: 20px;
    bottom: 0;
    color: white;
    display: flex;
    font-size: 15px;
    font-weight: bold;
    height: 25px;
    justify-content: center;
    margin: 0 -7px -7px 0;
    min-width: 25px;
    padding: 0 1px;
    position: absolute;
    right: 0;
  }

  .close-button {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    outline: none !important;
  }
</style>

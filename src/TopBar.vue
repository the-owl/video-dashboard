<template>
  <div class='top-bar'>
    <span class='status'>
      Соединение разорвано! Ожидаем соединения...
    </span>
  </div>
</template>

<script>
export default {
  name: 'top-bar'
};
</script>

<style scoped>
  .top-bar {
    align-items: center;
    background: rgb(255, 23, 23);
    display: flex;
    height: 40px;
    justify-content: flex-start;
    padding: 0 15px;
  }

  .status {
    color: white;
    font-size: 18px;
    font-weight: 600;
  }
</style>

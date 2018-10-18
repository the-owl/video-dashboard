<template>
  <div class='log-panel'>
    <h2 class='header'>
      Лог ошибок
      <button class='close-button' @click='$emit("close")'>✕</button>
    </h2>
    <ul v-if='messages.length'>
      <li v-for='message in messages' :key='message.id' :class='"msg-" + message.type'>
        <h3 class='title'>{{ message.type === 'error' ? 'Ошибка' : 'Предупреждение' }}</h3>
        <div class='text'>{{ message.message }}</div>
        <div class='camera'>Камера: {{ message.camera.name }}</div>
        <div class='time'>Время: {{ new Date(message.time).toLocaleString() }}</div>
      </li>
    </ul>
    <div v-else class='placeholder'>
      Сообщений нет.
    </div>
  </div>
</template>

<script>
  export default {
    name: 'log-panel',
    props: ['messages']
  };
</script>

<style scoped>
  .header {
    align-items: center;
    box-shadow: rgba(136, 136, 136, 0.533) 0 1px 4px;
    display: flex;
    justify-content: space-between;
    margin: 0;
    padding: 15px;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 16px;
  }

  .log-panel {
    background: white;
    border-right: 1px solid #bbb;
    box-shadow: rgba(127, 127, 127, 0.5) 0 0 5px;
    display: flex;
    flex-direction: column;
    height: 100%;
    left: -50px;
    max-width: 100vw;
    min-width: 300px;
    padding-left: 50px;
    position: absolute;
    top: 0;
    width: 50vw;
    z-index: 15;
  }

  .log-panel .placeholder {
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;
    width: 100%;
  }

  .log-panel ul {
    flex: 1;
    list-style-type: none;
    margin: 0;
    overflow-y: auto;
    padding-left: 0;
  }

  .log-panel ul > li {
    border-bottom: 1px solid #ddd;
    padding: 10px;
  }

  .log-panel ul > li .title {
    margin: 0 0 8px 0;
  }

  .log-panel ul > li .text {
    background-color: rgba(202, 213, 230, 0.514);
    border: 1px solid rgba(165, 0, 0, 0.502);
    border-radius: 3px;
    font-family: monospace;
    font-size: 12px;
    margin-bottom: 5px;
    padding: 7px;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .log-panel ul > li.msg-warning .title {
    color: rgb(255, 208, 0);
  }

  .log-panel ul > li.msg-error .title {
    color: red;
  }
</style>

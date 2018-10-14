<template>
  <div class='log-panel'>
    <button class='close-button' @click='$emit("close")'>✕</button>
    <ul v-if='messages.length'>
      <li v-for='message in messages' :key='message.id' :class='"msg-" + message.type'>
        <h3 class='title'>{{ message.type === 'error' ? 'Ошибка' : 'Предупреждение' }}</h3>
        <div class='text'>{{ message.message }}</div>
        <div class='time'>{{ new Date(message.time).toLocaleString() }}</div>
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

<style>
  .close-button {
    background: none;
    border: none;
    font-size: 16px;
    position: absolute;
    right: 15px;
    top: 15px;
  }

  .log-panel {
    background: white;
    border-right: 1px solid #bbb;
    box-shadow: rgba(127, 127, 127, 0.5) 0 0 5px;
    height: 100%;
    left: -50px;
    overflow-y: auto;
    padding-left: 50px;
    position: absolute;
    top: 0;
    width: 300px;
  }

  .log-panel .placeholder {
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;
    width: 100%;
  }

  .log-panel ul {
    list-style-type: none;
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
    background-color: #cad5e683;
    border: 1px solid #a5000080;
    border-radius: 3px;
    font-family: monospace;
    font-size: 12px;
    margin-bottom: 5px;
    padding: 7px;
    word-wrap: break-word;
  }

  .log-panel ul > li.msg-warning .title {
    color: rgb(255, 208, 0);
  }

  .log-panel ul > li.msg-error .title {
    color: red;
  }
</style>

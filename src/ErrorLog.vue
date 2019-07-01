<template>
  <ul v-if='messages.length' ref='list'>
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
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['messages'])
  },
  mounted () {
    if (this.$refs.list) {
      this.$refs.list.scrollTop = this.$refs.list.scrollHeight;
    }
  }
};
</script>

<style scoped>
.placeholder {
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
}

ul {
  list-style-type: none;
  margin: 0;
  overflow-y: auto;
  padding-left: 0;
}

ul > li {
  border-bottom: 1px solid #ddd;
  padding: 10px;
}

ul > li .title {
  margin: 0 0 8px 0;
}

ul > li .text {
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

ul > li.msg-warning .title {
  color: rgb(255, 208, 0);
}

ul > li.msg-error .title {
  color: red;
}
</style>

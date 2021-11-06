<template>
  <ul v-if="messages.length" ref="listRef" class="error-log">
    <li
      v-for="message in messages"
      :key="message.id"
      :class="['message', 'message_' + message.type]"
    >
      <h3 class="message__title">
        {{ message.type === 'error' ? 'Ошибка' : 'Предупреждение' }}
      </h3>
      <div class="message__text">
        {{ message.message }}
      </div>
      <div class="message__camera">
        Камера: {{ message.camera.name }}
      </div>
      <div class="message__time">
        Время: {{ new Date(message.time).toLocaleString() }}
      </div>
    </li>
  </ul>
  <div v-else class="placeholder">
    Сообщений нет.
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  setup() {
    const listRef = ref(null as HTMLElement | null);
    const store = useStore();
    const messages = computed(() => store.state.messages);

    onMounted(() => {
      if (listRef.value) {
        listRef.value.scrollTop = listRef.value.scrollHeight;
      }
    });

    return {
      listRef,
      messages,
    };
  },
});
</script>

<style lang="scss" scoped>
.placeholder {
  align-items: center;
  display: flex;
  justify-content: center;
}

.error-log {
  list-style-type: none;
  margin: 0;
  overflow-y: auto;
  padding-left: 0;
}

.message {
  border-bottom: 1px solid #ddd;
  padding: 10px;

  &_warning .message__title {
    color: rgb(255, 208, 0);
  }

  &_error .message__title {
    color: red;
  }

  &__title {
    margin: 0 0 8px 0;
  }

  &__text {
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
}
</style>

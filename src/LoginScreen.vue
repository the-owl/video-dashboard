<template>
  <div class="login-screen">
    <div class="login-screen__window">
      <h1 class="login-screen__header">
        Введите пароль
      </h1>
      <form :class="['input-group', { 'input-group_shake': invalid }]" @submit="onSubmit">
        <input v-model="password" type="password" class="input-group__input">
        <button type="submit" class="input-group__button">
          ▶
        </button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'LoginScreen',
  setup() {
    const invalid = ref(false);
    const password = ref('');
    const store = useStore();

    async function onSubmit(event: Event) {
      event.preventDefault();
      invalid.value = false;
      const success = await store.dispatch('login', password.value);
      if (!success) {
        invalid.value = true;
        password.value = '';
      } else {
        await store.dispatch('initialize');
      }
    }

    return {
      invalid,
      onSubmit,
      password,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "sass:math";

.login-screen {
  align-items: center;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  padding: 20px;

  &__window {
    border: 1px solid #aaa;
    border-radius: 6px;
    flex: 1;
    max-width: 400px;
    padding: 20px;
  }

  &__header {
    color: #333;
    font-size: 20px;
    font-weight: 400;
    margin: 0;
  }
}

.input-group {
  align-items: center;
  display: flex;
  height: 30px;
  margin-top: 15px;

  &_shake {
    animation: shake 0.65s cubic-bezier(.36,.07,.19,.97) both;
  }

  &__input {
    border: 1px solid #ccc;
    border-radius: 4px 0 0 4px;
    box-sizing: border-box;
    flex: 1;
    height: 100%;
    outline: none !important;
    padding: 0 10px;
  }

  &__button {
    background: rgb(43, 219, 20);
    border: none;
    border-radius: 0 4px 4px 0;
    color: white;
    height: 100%;
    padding: 0 10px;
    transition: background 0.2s ease;
    width: 40px;

    &:hover {
      background: rgb(111, 229, 96);
    }

    &:active {
      background: rgb(89, 187, 76);
    }
  }
}

$shake-amplitude: 18px;

@keyframes shake {
  10%, 90% {
    transform: translate3d(math.div(-$shake-amplitude, 4), 0, 0);
  }

  20%, 80% {
    transform: translate3d(math.div($shake-amplitude, 2), 0, 0);
  }

  30%, 70% {
    transform: translate3d(math.div(-$shake-amplitude, 1.5), 0, 0);
  }

  40%, 60% {
    transform: translate3d($shake-amplitude, 0, 0);
  }

  50% {
    transform: translate3d(-$shake-amplitude, 0, 0);
  }
}
</style>

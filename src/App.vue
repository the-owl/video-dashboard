<template>
  <Transition name="switch">
    <LoginScreen v-if="!authorized" class="root login" />
    <div v-else-if="cameras" class="root app">
      <Transition name="slide-out">
        <MenuPanel v-if="menuVisible" :ok="!connectionLost" @close="hideMenu" />
      </Transition>

      <Transition name="fade">
        <div v-if="menuVisible" class="backdrop" @click="hideMenu" />
      </Transition>

      <TopBar :ok="!connectionLost" :unread-count="unreadCount" @toggleMenu="showMenu">
        Все камеры
      </TopBar>
      <CameraGrid />
    </div>
    <div v-else class="root loading">
      Загружаем камеры...
    </div>
  </Transition>
</template>

<script lang="ts">
import MenuPanel from './MenuPanel.vue';
import CameraGrid from './CameraGrid.vue';
import TopBar from './TopBar.vue';
import LoginScreen from './LoginScreen.vue';
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import when from 'vue-when';

export default defineComponent({
  name: 'App',
  components: {
    LoginScreen, CameraGrid, MenuPanel, TopBar,
  },
  setup() {
    const store = useStore();

    const authorized = ref(store.getters.authorized);
    const cameras = computed(() => store.state.cameras);
    const connectionLost = computed(() => store.state.connectionLost);
    const unreadCount = computed(() => store.getters.unreadMessagesCount);

    const menuVisible = ref(false);

    function hideMenu() {
      menuVisible.value = false;
    }

    function showMenu() {
      menuVisible.value = true;
    }

    onMounted(async () => {
      // this is done to skip "loading cameras" screen after logging in
      if (!authorized.value) {
        await when(() => store.getters.authorized && cameras.value);
        authorized.value = true;
      }
    });

    return {
      authorized,
      cameras,
      connectionLost,
      hideMenu,
      menuVisible,
      showMenu,
      unreadCount,
    };
  },
});
</script>

<style lang="scss" scoped>
.root {
  bottom: 0;
  height: 100%;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
}

.loading {
  align-items: center;
  color: #ccc;
  font-size: 2em;
  justify-content: center;
}


.app, .loading {
  display: flex;
}

.app {
  flex-direction: column;
}

.app .camera-grid {
  flex: 1;
}

.backdrop {
  background-color: rgba(87, 87, 87, 0.75);
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 1;
}

.fade {
  &-enter-active, &-leave-active {
    transition: opacity 0.35s linear;
  }

  &-enter-to, &-leave-from {
    opacity: 1;
  }

  &-enter-from, &-leave-to {
    opacity: 0;
  }
}

.switch {
  $duration: 1s;

  &-enter-active, &-leave-active {
    transition: filter $duration ease, opacity $duration ease, transform $duration ease;
  }

  &-enter-from, &-leave-to {
    opacity: 0;
  }

  &-enter-from {
    filter: blur(20px);
    transform: scale(0.7);
  }

  &-leave-to {
    transform: scale(1.3);
  }

  &-leave-from, &-enter-to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

<style lang="scss">
html, body, #app {
  font-family: sans-serif;
  height: 100%;
  margin: 0;
  overflow: hidden;
  padding: 0;
  width: 100%;
}

.slide-out {
  &-enter-active, &-leave-active {
    transition: transform 0.35s ease-in-out !important;
  }

  &-enter-to, &-leave-from {
    transform: translateX(0);
  }

  &-enter-from, &-leave-to {
    transform: translateX(-100%);
  }
}
</style>

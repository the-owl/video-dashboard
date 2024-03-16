<template>
  <div class="camera-view-history">
    <a :href="allLink" target="_blank" class="camera-link camera-link_full-width">
      Все камеры
    </a>
    <a
      v-for="camera in cameras"
      :key="camera.id"
      :href="camera.link"
      target="_blank"
      class="camera-link"
    >
      {{ camera.name }}
    </a>
  </div>
</template>

<script lang="ts">
import { useStore } from 'vuex';
import { computed, defineComponent } from 'vue';
import { Camera } from '@/types';

const BASE_REPORT_URL = '/watchers-log';

export default defineComponent({
  name: 'CameraViewHistory',
  setup() {
    const store = useStore();
    const cameras = computed(() => store.state.cameras?.map((c: Camera) => ({
      link: `${BASE_REPORT_URL}?cameraName=${c.name}`,
      name: c.name,
    })));

    return {
      allLink: BASE_REPORT_URL,
      cameras,
    };
  },
});
</script>

<style lang="scss" scoped>
.camera-view-history {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 5px;
}

.camera-link {
  border: 1px solid #999;
  border-radius: 3px;
  color: inherit;
  margin: 5px;
  min-width: 50px;
  padding: 10px;
  text-align: center;
  text-decoration: none;

  &:hover {
    background-color: #eee;
  }

  &_full-width {
    width: 100%;
  }
}
</style>

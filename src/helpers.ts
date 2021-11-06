import { Camera } from '@/types';
import { computed, Ref } from 'vue';

export function useCameraPreview(camera: Ref<Camera | null>) {
  return computed(() => {
    if (!camera.value) return null;

    const { imageVersion, id } = camera.value;
    return `/snapshots/${id}/output.jpg?v=` + imageVersion;
  });
}

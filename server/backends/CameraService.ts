import { CameraId } from '../Camera';

export interface CameraService {
  readonly supportsActiveCameraIds: boolean;
  getActiveCameraIds(): Promise<string[]>;
  getIframeUrl(cameraId: CameraId): string;
  getStreamUrl(cameraId: CameraId): Promise<string>;
}

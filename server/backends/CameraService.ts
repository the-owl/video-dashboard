import { CameraId } from '../Camera';

export interface CameraService {
  getStreamUrl (cameraId: CameraId): Promise<string>;
}
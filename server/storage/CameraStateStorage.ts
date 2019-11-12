import { CameraId } from '../Camera';

export interface CameraStateStorage {
  isPoweredOff (cameraId: CameraId): Promise<boolean>;
  setPoweredOff (cameraId: CameraId, value: boolean): Promise<void>;
}

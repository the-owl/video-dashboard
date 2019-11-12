import { CameraId } from '../Camera';

export interface CameraStateStorage {
  isPoweredOff (cameraIds: CameraId[]): Promise<{ [id: number]: boolean }>;
  setPoweredOff (cameraId: CameraId, value: boolean): Promise<void>;
}

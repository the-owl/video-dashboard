import { CameraService } from './CameraService';

export abstract class BaseCameraService implements CameraService {
  private cachedStreamUrl?: string;

  async getStreamUrl (cameraId: string) {
    if (this.cachedStreamUrl) {
      return this.cachedStreamUrl;
    }

    const streamUrl = await this.fetchStreamUrl(cameraId);
    this.cachedStreamUrl = streamUrl;

    return streamUrl;
  }

  protected abstract fetchStreamUrl(cameraId: string): Promise<string> | string;
}

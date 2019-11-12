import { CameraService } from './CameraService';

export abstract class BaseCameraService implements CameraService {
  private cachedStreamUrls: { [id: string]: string } = {};

  async getStreamUrl (cameraId: string) {
    if (this.cachedStreamUrls[cameraId]) {
      return this.cachedStreamUrls[cameraId];
    }

    const streamUrl = await this.fetchStreamUrl(cameraId);
    this.cachedStreamUrls[cameraId] = streamUrl;

    return streamUrl;
  }

  protected abstract fetchStreamUrl(cameraId: string): Promise<string> | string;
}

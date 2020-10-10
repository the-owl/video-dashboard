import { CameraService } from './CameraService';

interface CachedStreamUrl {
  obtained: Date;
  url: string;
}

export abstract class BaseCameraService implements CameraService {
  private cachedStreamUrls: { [id: string]: CachedStreamUrl } = {};

  async getStreamUrl (cameraId: string) {
    const cachedStream = this.cachedStreamUrls[cameraId];

    if (cachedStream && !this.isStreamStale(cachedStream.obtained)) {
      return this.cachedStreamUrls[cameraId].url;
    }

    const streamUrl = await this.fetchStreamUrl(cameraId);
    this.cachedStreamUrls[cameraId] = {
      obtained: new Date(),
      url: streamUrl,
    };

    return streamUrl;
  }

  private isStreamStale(obtained: Date) {
    return (Date.now() - obtained.getTime()) > this.getStreamLifetime();
  }

  protected abstract fetchStreamUrl(cameraId: string): Promise<string> | string;
  protected abstract getStreamLifetime(): number;
}

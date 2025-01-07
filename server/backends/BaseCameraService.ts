import { CameraService } from './CameraService';
import { CameraId } from '../Camera';

interface CachedStreamUrl {
  obtained: Date;
  url: string;
}

export abstract class BaseCameraService implements CameraService {
  private cachedStreamUrls: { [id: string]: CachedStreamUrl } = {};
  public readonly supportsActiveCameraIds: boolean = false;

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

  getActiveCameraIds(): Promise<string[]> {
    throw new Error('Not supported');
  }

  protected getStreamLifetime(): number {
    return Infinity;
  }

  private isStreamStale(obtained: Date) {
    return (Date.now() - obtained.getTime()) > this.getStreamLifetime();
  }

  public abstract getIframeUrl(cameraId: CameraId): string;
  protected abstract fetchStreamUrl(cameraId: CameraId): Promise<string> | string;
}

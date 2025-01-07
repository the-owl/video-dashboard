import { BaseCameraService } from './BaseCameraService';
import fetch from 'node-fetch';
import { CameraId } from '../Camera';

const VIDEO_URL_REGEX = /var hd_url = ['"]([^']+)['"];/i;

export class RtspMeBackend extends BaseCameraService {
  async fetchStreamUrl(cameraId: string) {
    const pageResponse = await fetch(`https://rtsp.me/embed/${cameraId}/`);
    const pageText = (await pageResponse.text()) as string;
    const match = pageText.match(VIDEO_URL_REGEX);

    if (!match) {
      throw new Error('Failed to parse stream URL from page');
    }

    return match[1];
  }

  getIframeUrl(cameraId: CameraId): string {
    return `https://rtsp.me/embed/${cameraId}`;
  }

  protected getStreamLifetime(): number {
    return 60 * 60 * 1000; // 1 hour
  }
}

import { BaseCameraService } from './BaseCameraService';
import * as fetch from 'node-fetch';

const VIDEO_URL_REGEX = /var n_url = "([^']+)";/i;

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
}

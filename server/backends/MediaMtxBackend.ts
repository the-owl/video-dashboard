import { BaseCameraService } from './BaseCameraService';
import fetch from 'node-fetch';
import { CameraId } from '../Camera';

export interface MediaMtxBackendConfig {
  baseApiUrl: string;
  baseHlsUrl: string;
  baseRtspUrl: string;
}

export class MediaMtxBackend extends BaseCameraService {
  public readonly supportsActiveCameraIds: boolean = true;
  public readonly baseApiUrl: string;
  public readonly baseHlsUrl: string;
  public readonly baseRtspUrl: string;

  constructor(
    config: MediaMtxBackendConfig,
  ) {
    super();
    this.baseApiUrl = config.baseApiUrl;
    this.baseHlsUrl = config.baseHlsUrl;
    this.baseRtspUrl = config.baseRtspUrl;
  }

  async fetchStreamUrl(cameraId: CameraId) {
    return this.baseRtspUrl + '/' + cameraId;
  }

  async getActiveCameraIds(): Promise<string[]> {
    const response = await fetch(this.baseApiUrl + '/v3/paths/list?itemsPerPage=1000');
    const json = await response.json();
    return json
      ?.items
      ?.filter((item: any) => (
        typeof item?.name === 'string' &&
        item.ready &&
        item?.readers?.some((reader: any) => (
          reader?.type === 'hlsMuxer'
        ))
      ))
      ?.map((item: any) => item?.name)
      ?? [];
  }

  getIframeUrl(cameraId: CameraId): string {
    return this.baseHlsUrl + '/' + cameraId;
  }
}

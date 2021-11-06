import { BaseCameraService } from './BaseCameraService';
import fetch from 'node-fetch';

export interface IpeyeBackendConfig {
  streamType: string;
}

export class IpeyeBackend extends BaseCameraService {
  private streamType: string;

  constructor (config: IpeyeBackendConfig) {
    super();
    this.streamType = config.streamType;
  }

  async fetchStreamUrl(cameraId: string) {
    const response = await fetch('http://api.ipeye.ru/device/url/' + this.streamType + '/' + cameraId);
    const { message, status } = await response.json() as any;
    if (!status) {
      throw new Error('IpEye API error: ' + message);
    }
    return message;
  }

  protected getStreamLifetime(): number {
    return 60 * 60 * 1000; // 1 hour
  }
}

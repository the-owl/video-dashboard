import { BaseCameraService } from './BaseCameraService';
import * as fetch from 'node-fetch';

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
    const { message, status } = await response.json();
    if (!status) {
      throw new Error('IpEye API error: ' + message);
    }
    return message;
  }
}
import { Moment } from 'moment';

export interface Camera {
  failureCounter: number;
  id: string;
  imageVersion: number;
  isPoweredOff: boolean;
  lastUpdated: Moment;
  loading: boolean;
  name: string;
}

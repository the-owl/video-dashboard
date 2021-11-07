import { Moment } from 'moment';

export interface Camera {
  error: string | false | null;
  failureCounter: number;
  id: string;
  imageVersion: number;
  isPoweredOff: boolean;
  lastUpdated: Moment;
  loading: boolean;
  name: string;
  watching: number;
}

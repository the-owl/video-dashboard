import AwaitLock from 'await-lock';
import { runWithLock } from './utils';
import * as fs from 'fs-extra';

export enum WatcherEventType {
  start = 'start',
  end = 'end',
  serverRestart = 'serverStart',
}

export interface WatcherEvent {
  cameraName?: string;
  date: Date;
  type: WatcherEventType;
}

export interface WatcherLog {
  addEvent (event: WatcherEvent): Promise<void>;
  getEvents (after: Date): Promise<WatcherEvent[]>;
}

export class ParseError extends Error {}

export class TextFileWatcherLog implements WatcherLog {
  protected readonly lock: AwaitLock = new AwaitLock();

  constructor (public readonly filename: string) {}

  async addEvent (event: WatcherEvent) {
    await this.runWithLock(async () => {
      const row = this.serializeEvent(event);
      await fs.appendFile(this.filename, row + '\n', { encoding: 'utf8' });
    });
  }

  async getEvents (after: Date): Promise<WatcherEvent[]> {
    let data: string = '';
    await this.runWithLock(async () => {
      data = await fs.readFile(this.filename, { encoding: 'utf8' });
    });
    const rows = data.split('\n').filter(r => r.trim().length);
    return rows.map(row => this.parseEvent(row)).filter(event => event.date >= after);
  }

  protected parseEvent(row: string): WatcherEvent {
    let data: { [key: string]: string };

    try {
      data = JSON.parse(row);
    } catch (error) {
      throw new ParseError('Failed to parse row: ' + row);
    }

    if (typeof data.cam !== 'string' && data.cam !== undefined) {
      throw new ParseError('Failed to parse cam field: ' + row);
    }
    if (!Object.values(WatcherEventType).find(e => e === data.type)) {
      throw new ParseError('Failed to parse type field: ' + row);
    }

    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      throw new ParseError('Failed to parse date field: ' + row);
    }

    return {
      cameraName: data.cam,
      date,
      type: data.type as WatcherEventType,
    };
  }

  protected serializeEvent (event: WatcherEvent): string {
    const data = {
      cam: event.cameraName,
      date: event.date.toISOString(),
      type: event.type,
    };
    return JSON.stringify(data);
  }

  private async runWithLock (fn: () => Promise<any>) {
    await runWithLock(this.lock, fn);
  }
}

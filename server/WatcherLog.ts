import AwaitLock from "await-lock";
import { runWithLock } from "./utils";
import * as fs from "fs-extra";
import { AsyncLocalStorage } from "async_hooks";

export enum WatcherEventType {
  start = "start",
  end = "end",
}

export interface WatcherEvent {
  cameraName: string;
  date: Date;
  type: WatcherEventType;
}

export interface WatcherLog {
  addEvents(events: ReadonlyArray<WatcherEvent>): Promise<void>;
  atomic<T>(fn: () => Promise<T>): Promise<T>;
  getEvents(minDate?: Date, afterLastReset?: boolean): Promise<WatcherEvent[]>;
  rewrite(events: ReadonlyArray<WatcherEvent>): Promise<void>;
}

export class ParseError extends Error {}

export class TextFileWatcherLog implements WatcherLog {
  protected readonly lock: AwaitLock = new AwaitLock();
  private readonly asyncContext: AsyncLocalStorage<boolean> =
    new AsyncLocalStorage();

  constructor(public readonly filename: string) {}

  async addEvents(events: ReadonlyArray<WatcherEvent>): Promise<void> {
    await this.atomic(async () => {
      await this.appendEvents(events);
    });
  }

  async getEvents(minDate?: Date): Promise<WatcherEvent[]> {
    return this.atomic(async () => {
      const rows = await this.readRowsFromFile();
      let events = this.parseRowsToEvents(rows);
      if (minDate !== undefined) {
        events = events.filter((event) => event.date >= minDate);
      }

      return events;
    });
  }

  async rewrite(events: ReadonlyArray<WatcherEvent>) {
    await this.atomic(async () => {
      await this.truncateFile();
      await this.appendEvents(events);
    });
  }

  protected async appendEvents(
    events: ReadonlyArray<WatcherEvent>
  ): Promise<void> {
    const rows = events.map((e) => this.serializeEvent(e));
    await fs.appendFile(this.filename, rows.join("\n") + "\n", {
      encoding: "utf8",
    });
  }

  protected parseRowsToEvents(rows: ReadonlyArray<string>): WatcherEvent[] {
    return rows.map((row) => this.parseEvent(row)).filter((e) => e !== null);
  }

  protected async readRowsFromFile(): Promise<string[]> {
    const data = await fs.readFile(this.filename, { encoding: "utf8" });
    return data.split("\n").filter((r) => r.trim().length);
  }

  protected async truncateFile(): Promise<void> {
    await fs.truncate(this.filename);
  }

  protected parseEvent(row: string): WatcherEvent | null {
    let data: { [key: string]: string };

    try {
      data = JSON.parse(row);
    } catch (error) {
      throw new ParseError("Failed to parse row: " + row);
    }

    if (!Object.values(WatcherEventType).find((e) => e === data.type)) {
      return null;
    }
    if (typeof data.cam !== "string") {
      throw new ParseError("Failed to parse cam field: " + row);
    }

    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      throw new ParseError("Failed to parse date field: " + row);
    }

    return {
      cameraName: data.cam,
      date,
      type: data.type as WatcherEventType,
    };
  }

  protected serializeEvent(event: WatcherEvent): string {
    const data = {
      cam: event.cameraName,
      date: event.date.toISOString(),
      type: event.type,
    };
    return JSON.stringify(data);
  }

  async atomic<T>(fn: () => Promise<T>): Promise<T> {
    if (this.inAtomicBlock) {
      return await fn();
    }
    return await this.asyncContext.run(true, () => runWithLock(this.lock, fn));
  }

  get inAtomicBlock(): boolean {
    return Boolean(this.asyncContext.getStore());
  }
}

import express from 'express';
import { WatcherEventType, WatcherLog } from '../WatcherLog';

interface WatchSession {
  cameraName: string;
  end: Date | null;
  start: Date;
}

export function watchersLogView(watcherLog: WatcherLog, showDays: number) {
  return async (req: express.Request, res: express.Response) => {
    const afterDate = new Date(Date.now() - 24 * 60 * 60 * 1000 * showDays);
    let allEvents = await watcherLog.getEvents(afterDate);

    if (req.query.cameraName) {
      allEvents = allEvents.filter(e => e.cameraName === req.query.cameraName);
    }

    const watcherCounts = new Map<string, number>();
    const activeSessions = new Map<string, WatchSession>();
    const sessions: WatchSession[] = [];

    for (const event of allEvents) {
      if (typeof event.cameraName !== 'string') {
        if (event.type === WatcherEventType.serverRestart) {
          for (const session of activeSessions.values()) {
            session.end = event.date;
          }
          activeSessions.clear();
          watcherCounts.clear();
        }

        continue;
      }

      const currentValue = watcherCounts.get(event.cameraName) ?? 0;

      if (event.type === WatcherEventType.start) {
        watcherCounts.set(event.cameraName, currentValue + 1);
        if (!currentValue) {
          const session: WatchSession = {
            cameraName: event.cameraName,
            start: event.date,
            end: null,
          };
          sessions.push(session);
          activeSessions.set(event.cameraName, session);
        }
      } else if (event.type === WatcherEventType.end) {
        if (currentValue <= 0) {
          console.warn('Warning: inconsistent event at date: ', event.date);
          continue;
        }

        watcherCounts.set(event.cameraName, currentValue - 1);
        if (currentValue === 1) {
          const currentSession = activeSessions.get(event.cameraName);
          if (!currentSession) {
            console.warn('Warning: missing start event at date: ', event.date);
            continue;
          }
          currentSession.end = event.date;
          activeSessions.delete(event.cameraName);
        }
      }
    }

    res.status(200).send(renderSessions(sessions));
  };
}

const TEMPLATE = `
<!doctype html>
<html>
    <head>
        <style>
            body {
                font-family: monospace;
                font-size: 14px;
            }

            table {
                border-collapse: collapse;
            }

            td, th {
                border: 1px solid grey;
                padding: 5px;
            }
        </style>
    </head>
    <body>
        <h1>Лог просмотров камер</h1>
        <table>
            <tr>
                <th>Камера</th>
                <th>Дата начала просмотра (время Мск)</th>
                <th>Дата окончания просмотра (время Мск)</th>
            </tr>
            %rows%
        </table>
    </body>
</html>
`;

function renderSessions(sessions: WatchSession[]): string {
  let rows = '';

  for (const session of sessions) {
    const start = session.start.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
    const end = session.end?.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
    rows += `<tr><td>${session.cameraName}</td><td>${start}</td><td>${end ?? 'не завершена'}</td></tr>\n`;
  }

  return TEMPLATE.replace('%rows%', rows);
}

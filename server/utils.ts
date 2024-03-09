import AwaitLock from 'await-lock';

export async function runWithLock (lock: AwaitLock, fn: () => Promise<any>) {
  try {
    await lock.acquireAsync();
    await fn();
  } finally {
    lock.release();
  }
}

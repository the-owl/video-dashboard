import AwaitLock from 'await-lock';

export async function runWithLock<T> (lock: AwaitLock, fn: () => Promise<T>): Promise<T> {
  try {
    await lock.acquireAsync();
    return await fn();
  } finally {
    lock.release();
  }
}

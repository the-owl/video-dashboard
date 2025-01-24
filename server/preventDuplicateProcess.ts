import * as lockfile from 'proper-lockfile';

export async function preventDuplicateProcess() {
  await lockfile.lock('watchers.log', {
    retries: 2,
    stale: 5000,
    update: 2000,
  });
}

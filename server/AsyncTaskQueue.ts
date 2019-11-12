export class AsyncTaskQueue<Task> implements AsyncIterable<Task> {
  private awaiterQueue: Array<(task: Task) => void> = [];
  private taskQueue: Task[] = [];

  getTask (): Promise<Task> {
    if (this.taskQueue.length) {
      return Promise.resolve(this.taskQueue.shift());
    }

    return new Promise(resolve => {
      this.awaiterQueue.push(resolve);
    });
  }

  get length () {
    return this.taskQueue.length;
  }

  pushTask (task: Task) {
    if (this.awaiterQueue.length) {
      const awaiter = this.awaiterQueue.shift();
      awaiter(task);
    } else {
      this.taskQueue.push(task);
    }
  }

  async *[Symbol.asyncIterator] () {
    while (true) {
      yield await this.getTask();
    }
  }
}

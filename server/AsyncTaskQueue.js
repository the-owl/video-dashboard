class AsyncTaskQueue {
  constructor () {
    this._taskLists = [];
    this._taskAwaiters = [];
  }

  async getTask (minPriority = null) {
    while (true) {
      if (!this.length) {
        await new Promise(resolve => this._taskAwaiters.push(resolve));
      }

      const list = this._taskLists[this._taskLists.length - 1];
      if (minPriority && minPriority > list.priority) {
        continue;
      }
      const task = list.tasks.shift();
      if (!list.tasks.length) {
        this._taskLists.splice(this._taskLists.length - 1, 1);
      }
      return task;
    }
  }

  get length () {
    return this._taskLists.reduce((count, list) =>
      count + list.tasks.length
    );
  }

  pushTask (fn, priority = 0) {
    const list = this._listByPriority(priority);
    list.push(fn);
    const awaiter = this._taskAwaiters.shift();
    if (awaiter) {
      awaiter();
    }
  }

  _listByPriority (priority) {
    let list = this._taskLists.filter(list => list.priority === priority)[0];
    if (list) {
      return list.tasks;
    }
    list = { priority, tasks: [] };
    let insertAfterIndex = this._taskLists.length - 1;
    for (let i = 0; i < this._taskLists.length; i++) {
      if (this._taskLists[i].priority > priority) {
        insertAfterIndex = i - 1;
        break;
      }
    }
    this._taskLists.splice(insertAfterIndex, 0, list);
    return list.tasks;
  }
}

module.exports = AsyncTaskQueue;

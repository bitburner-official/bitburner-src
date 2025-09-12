/** Generic Event Emitter class following a subscribe/publish paradigm. */
export class EventEmitter<T extends any[]> {
  private subscribers: Set<(...args: [...T]) => void> = new Set();

  subscribe(s: (...args: [...T]) => void): () => void {
    this.subscribers.add(s);

    return () => {
      this.subscribers.delete(s);
    };
  }

  emit(...args: [...T]): void {
    // It is necessary to make a copy of the subscribers list, because since
    // the subscribers call arbitrary code, it can eventually call back in and
    // subscribe or unsubscribe new listeners. We must only dispatch to the
    // ones that were active at the time the event came in.
    for (const sub of [...this.subscribers]) {
      sub(...args);
    }
  }

  hasSubscribers(): boolean {
    return this.subscribers.size > 0;
  }
}

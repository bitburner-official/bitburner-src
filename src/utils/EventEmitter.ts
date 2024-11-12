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
    for (const sub of this.subscribers) {
      sub(...args);
    }
  }

  hasSubscribers(): boolean {
    return this.subscribers.size > 0;
  }
}

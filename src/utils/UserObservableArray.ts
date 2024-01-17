/*
  * Class UserObservableArray
  * The same as Array<T>
  * But we can observe.
*/
export class UserObservableArray<T> extends Array<T> {
  // Event emitter function type
  private events: Record<string, ((...args: any[]) => any)[]> = {};

  /* constructor(...args: any[]) {
    super(...args);
  } */

  // Set the user kick event listener
  on(event: string, callback: (...args: any[]) => any): void {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback.apply(this, this));
  }

  emit(event: string, ...data: any[]) {
    const eventListeners = this.events[event];
    if (!eventListeners) return;

    eventListeners.forEach(listener => listener(...data));
  }


  splice(...args: any[]): T[] {
    const userId = super.splice(args as any);

    if (typeof userId === 'number') {
      // If we are here, it means a user got kicked
      this.emit('userKick', userId);
    }

    return userId;
  }
}

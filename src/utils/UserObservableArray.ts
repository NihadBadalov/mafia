interface UserObservableArrayInterface<T> extends Array<T> {
  /**
   * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
   * @param start The zero-based location in the array from which to start removing elements.
   * @param deleteCount The number of elements to remove.
   * @returns An array containing the elements that were deleted.
   */
  splice(start: number, deleteCount?: number): T[];
  /**
   * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
   * @param start The zero-based location in the array from which to start removing elements.
   * @param deleteCount The number of elements to remove.
   * @param items Elements to insert into the array in place of the deleted elements.
   * @returns An array containing the elements that were deleted.
   */
  splice(start: number, deleteCount: number, ...items: T[]): T[];
  /**
   * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
   * @param inLoop When this string is specified, it means that UserObservableArray is calling `splice` of Array
  * and, thus, it exists in order to not cause an infinite recursion. This gets called inside UserObservableArray.splice by
  * this.splice('passed', ...). And then the check for the argument is done in Array
   * @param start The zero-based location in the array from which to start removing elements.
   * @param deleteCount The number of elements to remove.
   * @returns An array containing the elements that were deleted.
   */
  splice(inLoop: 'passed', start: number, deleteCount?: number): T[];
  /**
    * Returns an array of the UserObservableArray
   * @returns Array<T> Array from UserObservableArray
   */
  toArray(): T[];
}

/*
  * Class UserObservableArray
  * The same as Array<T>
  * But we can observe.
*/
export class UserObservableArray<T> extends Array<T> implements UserObservableArrayInterface<T> {
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
    // We need real splice functionality (without logging)
    if (args[0] === 'passed') {
      args.shift();
      if (!this[args[0]]) return [];

      const newArray = this.slice(0, args[0]).concat(this.slice(args[0] + args[1]));
      const iterationTimes = this.length;
      for (let i = 0; i < iterationTimes; i++) {
        this.shift();
      }

      for (let i = 0; i < newArray.length; i++) {
        this.push(newArray[i]);
      }

      return [this[args[0]]];
    }

    // Observe splice functionality
    const userId = this.splice('passed', ...args as any);

    if (typeof userId === 'number') {
      // If we are here, it means a user got kicked
      this.emit('userKick', userId);
    }

    return userId;
  }

  /**
    * Returns an array of the UserObservableArray
   * @returns {Array<T>} Array from UserObservableArray
   */
  toArray(): T[] {
    return [...this.values()];
  }
}

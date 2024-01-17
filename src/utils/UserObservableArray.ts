/*
  * Class UserObservableArray
  * The same as Array<T>
  * But we can observe.
*/
export class UserObservableArray<T> extends Array<T> {
  // Event emitter function type
  private onUserKick?: (userId: number) => void;

  /* constructor(...args: any[]) {
    super(...args);
  } */

  /**
   * Event emitter callback function
   * @param callback - Callback funciton to execute when user is kicked
   */
  onUserKickEvent(
    callback: (userId: number) => void,
  ): void {
    this.onUserKick = callback;
  }

  splice(...args: any[]): T[] {
    const userId = super.splice(args as any);

    if (typeof userId === 'number' && this.onUserKick) {
      // If we are here, it means a user got kicked
      this.onUserKick(userId);
    }

    return userId;
  }
}

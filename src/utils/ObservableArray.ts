/*
  * Class ObservableArray
  * The same as Array<T>
  * But we console.log('hello world') when splice is called on its prototype
*/
export class ObservableArray<T> extends Array<T> {
  constructor(...args: any[]) {
    console.log('called');
    super(...args);
  }

  splice(...args: any[]): T[] {
    console.log('hello world');
    return super.splice(args as any);
  }
}

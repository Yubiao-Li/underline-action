import { Options } from '../type';

export class BasePlugin {
  static exportFuncs: string[] = [];
  static state: any;
  static init(state: any) {
    this.state = state;
  }

  static process(currentNode: HTMLElement, opt?: Options): Boolean {
    return true;
  }

  static afterResolveNode(curProcessTextNode: Text, start: number, end: number) {}
}

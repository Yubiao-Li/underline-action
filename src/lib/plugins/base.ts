import { Options } from '../type';

export class BasePlugin {
  static exportFuncs: string[] = [];
  static state: any;
  static init(state: any) {
    this.state = state;
  }

  static process(currentNode: HTMLElement, opt?: Options, lastTextNode?: Text): Boolean {
    return true;
  }

  static afterResolveNode(curProcessTextNode: Text, start: number, end: number, { resolveTextNode }) {}

  static appendText(currentNode: Text, start: number, end: number) {
    return '';
  }
}

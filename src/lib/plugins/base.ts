import { Options } from '../type';

export class BasePlugin {
  static exportFuncs: string[];
  static state: any;
  static init(state: any) {
    this.state = state;
  }

  static process(currentNode: HTMLElement, opt?: Options, lastTextNode?: Text) {
    throw new Error('no implement process function');
  }

  static afterResolveNode(curProcessTextNode: Text, start: number, end: number, { resolveTextNode }) {}
}

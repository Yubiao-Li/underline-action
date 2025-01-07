import { Options } from '../type';

export class BasePlugin {
  exportFuncs: string[] = [];
  state: any;
  instance: any;
  constructor(state: any) {
    this.state = state;
  }

  process(currentNode: HTMLElement, opt?: Options): Boolean {
    return true;
  }

  afterResolveNode(curProcessTextNode: Text, start: number, end: number) {}

  getAttachNode(currentNode: HTMLElement) {
    return [];
  }
}

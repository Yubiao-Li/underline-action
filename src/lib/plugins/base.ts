import { Options } from '../type';

export class BasePlugin {
  exportFuncs: string[] = [];
  state: any;
  instance: any;
  constructor(state: any) {
    this.state = state;
  }

  // 返回 true 表示节点为正文，可以计数
  process(currentNode: HTMLElement, opt?: Options): Boolean {
    return true;
  }

  resolveNode(currNode: Text, startOffset: number, endOffset: number, props: any, opt: Options) {
    return null;
  }

  afterResolveNode(curProcessTextNode: Text, start: number, end: number) {}

  getAttachNode(currentNode: HTMLElement) {
    return [];
  }
}

import { Attach, Options } from '../type';
import { isTextNode } from '../utils';
import { BasePlugin } from './base';

export class AttachPlugin extends BasePlugin {
  exportFuncs: string[] = [];
  attachMap: Record<number, Attach[]> = {};

  constructor(state: any) {
    super(state);
    state.attachMap = {};
  }

  getAttachs(node: Text) {
    const attachPosition = node._wordoffset + node.textContent.length;
    return this.state.attachMap[attachPosition] || [];
  }

  process(currentNode: HTMLElement | Text, opt: Options) {
    let { getAttachNode } = opt;
    // 找一下有没有文字节点要带上它一起划线
    !getAttachNode && (getAttachNode = () => false);
    if (this.state.lastTextNode && getAttachNode(currentNode, this.state.lastTextNode)) {
      const attachPosition = this.state.lastTextNode._wordoffset + this.state.lastTextNode.textContent.length;
      this.state.attachMap[attachPosition]
        ? this.state.attachMap[attachPosition].push({ node: currentNode as Text, mockNode: null, quote: 0 })
        : (this.state.attachMap[attachPosition] = [{ node: currentNode as Text, quote: 0, mockNode: null }]);
      return false;
    }
    return true;
  }

  afterResolveNode(curProcessTextNode: Text, start: number, end: number): void {
    const pos = curProcessTextNode._wordoffset + curProcessTextNode.textContent.length;
    const attachs = this.state.attachMap[pos];
    if (pos < end && attachs) {
      attachs.forEach((attach: Attach) => {
        const { node } = attach;
        curProcessTextNode.parentElement.appendChild(node);
        // resolveTextNode(node, 0, node.textContent.length, true);
      });
    }
  }
}

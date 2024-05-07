import { Attach, Options } from '../type';
import { isTextNode } from '../utils';
import { BasePlugin } from './base';

export class AttachPlugin extends BasePlugin {
  static exportFuncs: string[] = [];
  static attachMap: Record<number, Attach[]> = {};

  static init(state: any) {
    BasePlugin.init(state);
    this.attachMap = {};
  }

  static getAttachs(node: Text) {
    const attachPosition = node._wordoffset + node.textContent.length;
    return this.attachMap[attachPosition] || [];
  }

  static process(currentNode: HTMLElement | Text, opt: Options, lastTextNode: Text) {
    let { getAttachNode } = opt;
    // 找一下有没有文字节点要带上它一起划线
    !getAttachNode && (getAttachNode = () => false);
    if (getAttachNode(currentNode, lastTextNode)) {
      const attachPosition = lastTextNode._wordoffset + lastTextNode.textContent.length;
      this.attachMap[attachPosition]
        ? this.attachMap[attachPosition].push({ node: currentNode as Text, mockNode: null, quote: 0 })
        : (this.attachMap[attachPosition] = [{ node: currentNode as Text, quote: 0, mockNode: null }]);
      return false;
    }
    return true;
  }

  static afterResolveNode(curProcessTextNode: Text, start: number, end: number): void {
    const pos = curProcessTextNode._wordoffset + curProcessTextNode.textContent.length;
    const attachs = this.attachMap[pos];
    if (pos < end && attachs) {
      attachs.forEach((attach: Attach) => {
        const { node } = attach;
        curProcessTextNode.parentElement.appendChild(node);
        // resolveTextNode(node, 0, node.textContent.length, true);
      });
    }
  }
}

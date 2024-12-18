import { Options } from '../type';
import { isTextNode } from '../utils';
import { BasePlugin } from './base';

export class SpecialNodePlugin extends BasePlugin {
  static curSpecialNode: HTMLElement;
  static process(currentNode: HTMLElement, opt?: Options) {
    !opt.isSpecialNode && (opt.isSpecialNode = (node: HTMLElement) => node.tagName === 'SUP' || node.tagName === 'SUB');
    if (opt.isSpecialNode(currentNode)) {
      this.curSpecialNode = currentNode;
    }

    if (isTextNode(currentNode) && this.curSpecialNode && this.curSpecialNode.contains(currentNode)) {
      currentNode._special = this.curSpecialNode;
    }

    return true
  }
}

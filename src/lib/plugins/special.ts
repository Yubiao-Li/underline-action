import { Options } from '../type';
import { createHighlightSpan, isTextNode } from '../utils';
import { BasePlugin } from './base';

function resolveSpecialNode(textnode: Text, startOffset: number, endOffset: number, props: any, opt: Options) {
  const highlightSpan = createHighlightSpan(opt.tag, props);
  textnode._special.parentElement!.insertBefore(highlightSpan, textnode._special);
  highlightSpan.appendChild(textnode._special);
  return highlightSpan;
}
export class SpecialNodePlugin extends BasePlugin {
  curSpecialNode: HTMLElement;
  process(currentNode: HTMLElement, opt?: Options) {
    !opt.isSpecialNode && (opt.isSpecialNode = (node: HTMLElement) => node.tagName === 'SUP' || node.tagName === 'SUB');
    if (opt.isSpecialNode(currentNode)) {
      this.curSpecialNode = currentNode;
    }

    if (isTextNode(currentNode) && this.curSpecialNode && this.curSpecialNode.contains(currentNode)) {
      currentNode._special = this.curSpecialNode;
    }

    return true;
  }

  resolveNode(currNode: Text, startOffset: number, endOffset: number, props: any, opt: Options) {
    if (currNode._special) {
      // 连续的只要resolve一次就好
      while (currNode._next && currNode._next._special === currNode._special) {
        currNode = currNode._next;
      }
      return resolveSpecialNode(currNode, startOffset, endOffset, props, opt);
    }
  }
}

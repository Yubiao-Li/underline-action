import { Options } from '../type';
import { createHighlightSpan, isLeafNode } from '../utils';
import { BasePlugin } from './base';

export class ContentNodePlugin extends BasePlugin {
  process(currNode: HTMLElement, opt: Options) {
    if (isLeafNode(currNode) && opt.getContentNodeInfo && opt.getContentNodeInfo(currNode)) {
      const { text, len } = opt.getContentNodeInfo(currNode);
      currNode._text = text;
      if (this.state.lastContentNode) {
        this.state.lastContentNode._next = currNode;
        currNode._prev = this.state.lastContentNode;
      }
      const newOffset = currNode._wordoffset + len;
      this.state.textNodeArr.length = newOffset;
      this.state.textNodeArr.fill(currNode, currNode._wordoffset, newOffset);
      this.state.lastContentNode = currNode;
    }

    return true;
  }

  resolveNode(currNode: HTMLElement, startOffset: number, endOffset: number, props: any, opt: Options) {
    if (opt.getContentNodeInfo && opt.getContentNodeInfo(currNode)) {
      const highlightSpan = createHighlightSpan(opt.tag, props);
      currNode.parentElement!.insertBefore(highlightSpan, currNode);
      highlightSpan.appendChild(currNode);
      return highlightSpan;
    }
  }
}

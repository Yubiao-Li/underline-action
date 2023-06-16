import { needWrap } from '../needWrap.js';
import '../type.js';

export class RenderInfo {
  static tableCol: number;
  static tableRow: number;
  static tableEle: Element;
  static exportFuncs: string[] = ['getRenderInfoByStartEnd'];
  static state: any;
  static init(currentNode: HTMLElement) {
    if (currentNode.tagName === 'TABLE') {
      this.tableCol = this.tableRow = -1;
      this.tableEle = currentNode;
    } else if (currentNode.tagName === 'TR') {
      this.tableRow++;
      this.tableCol = -1;
    } else if (currentNode.tagName === 'TD') {
      this.tableCol++;
    }

    currentNode._renderInfo = {
      tagName: currentNode.tagName,
      nodeName: currentNode.nodeName,
    };

    if (this.tableEle?.contains(currentNode)) {
      currentNode._renderInfo.tableRow = this.tableRow;
      currentNode._renderInfo.tableCol = this.tableCol;
    }
  }

  static getRenderInfoByStartEnd(start: number, end: number) {
    if (end <= start) return [];
    const startNode = RenderInfo.state.textNodeArr[start];
    const endNode = RenderInfo.state.textNodeArr[end - 1];
    if (!startNode || !endNode) return [];
    const result = [];
    // 说明不止由startNode组成text
    let curNode;
    while (curNode !== endNode) {
      if (!curNode) {
        curNode = startNode;
      } else {
        curNode = curNode._next;
      }
      let text = curNode.textContent.slice(start - startNode._wordoffset, end - startNode._wordoffset);
      if (needWrap(curNode, curNode._prev) || curNode === startNode) {
        result.push([]);
      }
      result[result.length - 1].push({ ...curNode._renderInfo, textContent: text });
      // text += curNode.textContent.slice(0, end - curNode._wordoffset);
    }
    return result;
  }
}

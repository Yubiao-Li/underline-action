import { needWrap } from '../needWrap.js';
import '../type.js';

export class RenderInfo {
  static tableCol: number;
  static tableRow: number;
  static tableEle: Element;
  static totalRow: number;
  static totalCol: number;
  static exportFuncs: string[] = ['getRenderInfoByStartEnd'];
  static state: any;
  static init(currentNode: HTMLElement) {
    if (currentNode.tagName === 'TABLE') {
      this.tableCol = this.tableRow = -1;
      this.tableEle = currentNode;
      this.totalRow = this.tableEle.getElementsByTagName('tr').length;
      this.totalCol =
        (this.tableEle.getElementsByTagName('td').length + this.tableEle.getElementsByTagName('th').length) /
        this.totalRow;
    } else if (currentNode.tagName === 'TR') {
      this.tableRow++;
      this.tableCol = -1;
    } else if (currentNode.tagName === 'TD') {
      this.tableCol++;
    }

    currentNode._renderInfo = {
      type: 'text',
    };

    if (this.tableEle?.contains(currentNode)) {
      currentNode._renderInfo.tableRow = this.tableRow;
      currentNode._renderInfo.totalRow = this.totalRow;
      currentNode._renderInfo.tableCol = this.tableCol;
      currentNode._renderInfo.totalCol = this.totalCol;
      currentNode._renderInfo.type = 'td';
    }
  }

  static getRenderInfoByStartEnd(start: number, end: number): RenderInfo[] {
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
      if (curNode._renderInfo.type === 'td' && curNode._prev._renderInfo.type === 'td') {
        // 表格元素，如果换行，在同一个格子里面的行为和不同格子的含义不同
        if (needWrap(curNode, curNode._prev)) {
          if (
            curNode._renderInfo.tableCol === curNode._prev._renderInfo.tableCol &&
            curNode._renderInfo.tableRow === curNode._prev._renderInfo.tableRow
          ) {
            result[result.length - 1].textContent += `\n${text}`;
            continue;
          } else {
            result.push({
              type: 'table-newline',
            });
          }
        } else {
          if (
            curNode._renderInfo.tableCol === curNode._prev._renderInfo.tableCol &&
            curNode._renderInfo.tableRow === curNode._prev._renderInfo.tableRow
          ) {
            result[result.length - 1].textContent += text;
            continue;
          }
        }
      } else {
        if (needWrap(curNode, curNode._prev)) {
          result.push({
            type: 'newline',
          });
        }
      }
      result.push({ ...curNode._renderInfo, textContent: text });
    }
    return result;
  }
}

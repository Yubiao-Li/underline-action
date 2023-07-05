import { needWrap } from '../needWrap';
import '../type';
import { RenderInfo } from '../type';
// import { RendererOptions} from '../reconciler/index.js';
export class RenderInfoPlugin {
  static tableCol: number;
  static tableRow: number;
  static tableEle: Element;
  static colspan: string;
  static exportFuncs: string[] = ['getRenderInfoByStartEnd', 'render'];
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
      this.colspan = currentNode.getAttribute('colspan');
    }

    currentNode._renderInfo = {
      type: 'text',
    };

    if (this.tableEle?.contains(currentNode)) {
      currentNode._renderInfo.tableRow = this.tableRow;
      currentNode._renderInfo.tableCol = this.tableCol;
      currentNode._renderInfo.type = 'td';
      if (this.colspan) {
        currentNode._renderInfo.colspan = this.colspan;
      }
    }
  }

  static getRenderInfoByStartEnd(start: number, end: number): RenderInfo[] {
    if (end <= start) return [];
    const startNode = RenderInfoPlugin.state.textNodeArr[start];
    const endNode = RenderInfoPlugin.state.textNodeArr[end - 1];
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
      let text = curNode.textContent.slice(
        Math.max(0, start - curNode._wordoffset),
        Math.min(end - curNode._wordoffset, curNode.textContent.length),
      );
      if (curNode._renderInfo.type === 'td' && curNode._prev._renderInfo.type === 'td') {
        // 表格元素，如果换行，在同一个格子里面的行为和不同格子的含义不同
        if (needWrap(curNode, curNode._prev)) {
          if (
            result.length &&
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
            result.length &&
            curNode._renderInfo.tableCol === curNode._prev._renderInfo.tableCol &&
            curNode._renderInfo.tableRow === curNode._prev._renderInfo.tableRow
          ) {
            result[result.length - 1].textContent += text;
            continue;
          }
        }
      } else {
        if (
          needWrap(curNode, curNode._prev) &&
          curNode._renderInfo.type !== 'td' &&
          curNode._prev._renderInfo.type !== 'td'
        ) {
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

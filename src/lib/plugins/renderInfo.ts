import { needWrap } from '../needWrap';
import { Options, RenderInfo } from '../type';
import { AttachPlugin } from './attach';
import { BasePlugin } from './base';
// import { RendererOptions} from '../reconciler/index.js';
export class RenderInfoPlugin extends BasePlugin {
  static tableCol: number;
  static tableRow: number;
  static tableEle: Element;
  static colspan: string;
  static exportFuncs: string[] = ['getRenderInfoByStartEnd', 'render'];
  static state: any;
  static init(state: any): void {
    BasePlugin.init(state);
  }
  static process(currentNode: HTMLElement, opt?: Options, lastTextNode?: Text) {
    currentNode._renderInfo = {
      type: currentNode.tagName || 'text',
      ...(opt.getRenderInfo ? opt.getRenderInfo(currentNode) : {}),
    };
    if (currentNode.tagName === 'TABLE') {
      this.tableCol = this.tableRow = -1;
      this.tableEle = currentNode;
    } else if (currentNode.tagName === 'TR') {
      this.tableRow++;
      this.tableCol = -1;
    } else if (currentNode.tagName === 'TD') {
      this.tableCol++;
      this.colspan = currentNode.getAttribute('colspan');
    } else if (this.tableEle?.contains(currentNode)) {
      currentNode._renderInfo.tableRow = this.tableRow;
      currentNode._renderInfo.tableCol = this.tableCol;
      currentNode._renderInfo.type = 'td';
      if (this.colspan) {
        currentNode._renderInfo.colspan = this.colspan;
      }
    }
    return true;
  }

  static getRenderInfoByStartEnd(start: number, end: number): RenderInfo[] {
    if (end <= start) return [];
    const startNode = RenderInfoPlugin.state.textNodeArr[start];
    const endNode = RenderInfoPlugin.state.textNodeArr[end - 1];
    if (!startNode || !endNode) return [];
    const result = [];
    // 说明不止由startNode组成text
    let curNode;

    function getRenderInfo(curNode, text) {
      if (curNode._renderInfo.type === 'td' && curNode._prev._renderInfo.type === 'td') {
        // 表格元素，如果换行，在同一个格子里面的行为和不同格子的含义不同
        if (needWrap(curNode, curNode._prev)) {
          if (
            result.length &&
            curNode._renderInfo.tableCol === curNode._prev._renderInfo.tableCol &&
            curNode._renderInfo.tableRow === curNode._prev._renderInfo.tableRow
          ) {
            result[result.length - 1].textContent += `\n${text}`;
            return;
          // } else {
          //   result.push({
          //     type: 'table-newline',
          //   });
          }
        } else {
          if (
            result.length &&
            curNode._renderInfo.tableCol === curNode._prev._renderInfo.tableCol &&
            curNode._renderInfo.tableRow === curNode._prev._renderInfo.tableRow
          ) {
            result[result.length - 1].textContent += text;
            return;
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
      getRenderInfo(curNode, text);
      const pos = curNode._wordoffset + curNode.textContent.length;
      const attachs = AttachPlugin.attachMap[pos];
      if (pos < end && attachs) {
        attachs.forEach(attach => {
          const { node } = attach;

          getRenderInfo(node, node.textContent);
        });
      }
    }
    return result;
  }
}

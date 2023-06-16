import { getScaleByDom } from './getScaleByDom.js';
import { inSameLine, needWrap } from './needWrap.js';
import { findFirstParent } from './findParent.js';
import { splitRange } from './splitRange.js';
// import { createAttachMockNode, isAttachMockNode, removeAttachMockNode } from './core/attachMockNode.js';
import { Attach, SplitResult } from './type.js';
<<<<<<< Updated upstream
import { createHighlightSpan, findParentHighlightSpan, isHighlightSpan } from './core/highlightSpan.js';
=======
import { RenderInfo } from './plugins/renderInfo.js';
>>>>>>> Stashed changes

const SPECIAL_NODE = ['SUB', 'SUP'];

function defaultGetKeyByRange({ start, end }) {
  return `${start}-${end}`;
}

export function UnderlineAction({ getKeyByRange, tag, selector, needFilterNode, getAttachNode }) {
  !getKeyByRange && (getKeyByRange = defaultGetKeyByRange);
  // 用来按顺序保存text节点方便后面遍历
  let plugins = [RenderInfo];
  const state = {
    textNodeArr: []
  }
  plugins.forEach(p => (p.state = state));
  // 保存key对应的span列表，方便删除
  const spanNodeMap = {};
  const spanMockUnderlineMap = {};

  let attachMap: Record<number, Attach[]> = {};
  function isTextNode(node: Text) {
    // 只有文字节点才需要计算偏移量
    return node.nodeName === '#text' && node.textContent.length;
  }

  function insertSpanInRange(start: number, end: number, props: any = {}, temp = false) {
<<<<<<< HEAD
    let spans = [];
    function createHighlightSpan(isAttach?: boolean) {
      const span = document.createElement(tag || 'span');
      span.className = 'underline';
      span._isAttach = isAttach;
      spans.push(span);
      Object.keys(props).forEach(key => (span[key] = props[key]));
      return span;
    }

    function splitTextNode(textnode: Text, offset: number) {
      if (offset === 0) {
        return textnode;
      }
      if (textnode.textContent.length === offset) {
        return textnode._next;
      }
      const behindTextNode = textnode.splitText(offset);
      behindTextNode._prev = textnode;
      behindTextNode._next = textnode._next;
      behindTextNode._wordoffset = textnode._wordoffset + offset;
      behindTextNode._renderInfo = textnode._renderInfo;

      textnode._next = behindTextNode;

      state.textNodeArr.fill(
        behindTextNode,
        behindTextNode._wordoffset,
        behindTextNode.textContent.length + behindTextNode._wordoffset,
      );

      return behindTextNode;
    }

    function resolveSpecialNode(textnode: Text, startOffset: number, endOffset: number, isAttach: boolean) {
      const len = textnode.textContent.length;
      const parentNode = textnode.parentElement;
      const firstNode = parentNode.cloneNode();
      const secondNode = parentNode.cloneNode();
      const lastNode = parentNode.cloneNode();
      let lastTextNode;
      let secondTextNode = textnode;
      if (startOffset !== 0) {
        secondTextNode = splitTextNode(textnode, startOffset);
        firstNode.appendChild(textnode);
        parentNode.parentElement.insertBefore(firstNode, parentNode);
      }
      if (endOffset !== len) {
        lastTextNode = splitTextNode(secondTextNode, endOffset - startOffset);
        lastNode.appendChild(lastTextNode);
      }
      const highlightSpan = createHighlightSpan(isAttach);
      secondNode.appendChild(secondTextNode);
      highlightSpan.appendChild(secondNode);
      parentNode.parentElement.insertBefore(highlightSpan, parentNode);
      if (lastTextNode) {
        parentNode.parentElement.insertBefore(lastNode, parentNode);
      }
      parentNode.remove();
      return secondTextNode;
    }

    // 分割textnode，把中间的取出来用span包住，并更新数组和链表
    function resolveTextNode(textnode: Text, startOffset: number, endOffset: number, isAttach?: boolean) {
      if (SPECIAL_NODE.indexOf(textnode.parentElement.tagName) !== -1) {
        return resolveSpecialNode(textnode, startOffset, endOffset, isAttach);
      }
      const len = textnode.textContent.length;
      let secondNode = textnode,
        lastTextNode;
      if (startOffset !== 0) {
        secondNode = splitTextNode(textnode, startOffset);
      }
      if (endOffset !== len) {
        lastTextNode = splitTextNode(secondNode, endOffset - startOffset);
=======
    function resolveTextNode(start: number, end: number) {
      const range = document.createRange();

      const startTextNode = textNodeArr[start];
      // 起点尽量在文前，不要跨段
      let startBookmark: HTMLElement | Text = splitTextNode(startTextNode, start - startTextNode._wordoffset);
      while (
        isHighlightSpan(startBookmark.parentElement) &&
        startBookmark.parentElement.childNodes[0] === startBookmark
      ) {
        startBookmark = startBookmark.parentElement;
      }
      range.setStartBefore(startBookmark);
      // if(range.startContainer)
      const endTextNode = textNodeArr[end - 1];
      // 终点尽量在文后，不要跨段
      range.setEndAfter(splitTextNode(endTextNode, end - endTextNode._wordoffset, true));

      const span = createHighlightSpan(props);
      span._wordoffset = start;
      span.appendChild(range.extractContents());
      if (range.endContainer.childNodes[range.endOffset]) {
        range.commonAncestorContainer.insertBefore(span, range.endContainer.childNodes[range.endOffset]);
      } else {
        range.commonAncestorContainer.appendChild(span);
      }
    }

    function splitTextNode(textnode: Text, offset: number, preferBefore?: boolean) {
      if (offset === 0) {
        if (preferBefore) {
          return textnode._prev;
        } else {
          return textnode;
        }
>>>>>>> wrapunderline
      }
      if (textnode.textContent.length === offset) {
        if (preferBefore) {
          return textnode;
        } else {
          return textnode._next;
        }
      }
      const behindTextNode = textnode.splitText(offset);
      behindTextNode._prev = textnode;
      behindTextNode._next = textnode._next;
      behindTextNode._wordoffset = textnode._wordoffset + offset;
      textnode._next = behindTextNode;

<<<<<<< HEAD
      const span = createHighlightSpan(isAttach);
      secondNode.parentElement.insertBefore(span, secondNode);
      span.appendChild(secondNode);

      return secondNode;
=======
      textNodeArr.fill(
        behindTextNode,
        behindTextNode._wordoffset,
        behindTextNode.textContent.length + behindTextNode._wordoffset,
      );

      if (preferBefore) {
        return textnode;
      } else {
        return behindTextNode;
      }
>>>>>>> wrapunderline
    }

    try {
      if (end <= start || start < 0 || end >= textNodeArr.length) return;
      const underlineKey = getKeyByRange({ start, end, props });
      props.underlineKey = underlineKey;
<<<<<<< Updated upstream
      const startTextNode = textNodeArr[start];
      const endTextNode = textNodeArr[end];

      if (!needWrap(startTextNode, endTextNode)) {
=======
      const startTextNode = state.textNodeArr[start];
      const endTextNode = state.textNodeArr[end - 1];
      if (!startTextNode || !endTextNode) return;
      let curProcessTextNode = startTextNode;
      if (startTextNode === endTextNode) {
>>>>>>> Stashed changes
        // 如果是同一段，只需要分解一个节点就好了
        resolveTextNode(start, end);
      } else {
        let curProcessTextNode = startTextNode;
        let fragStart = start; // 找每一段的开头
        // 如果是不同段，需要一直遍历到最后一个节点，全部分割一遍
        while (curProcessTextNode._wordoffset < end) {
          if (end < curProcessTextNode._wordoffset + curProcessTextNode.textContent.length) {
            resolveTextNode(fragStart, end);
          } else if (needWrap(curProcessTextNode, curProcessTextNode._next)) {
            const fragEnd = curProcessTextNode._wordoffset + curProcessTextNode.textContent.length;
            resolveTextNode(fragStart, fragEnd);
            fragStart = fragEnd;
          }
          // 分解之后要记得更新一下当前处理的节点指针为插入span的部分dom
          // if (curProcessTextNode === startTextNode) {
          //   curProcessTextNode = resolveTextNode(
          //     curProcessTextNode,
          //     start - curProcessTextNode._wordoffset,
          //     curProcessTextNode.textContent.length,
          //   );
          // } else if (curProcessTextNode === endTextNode) {
          //   curProcessTextNode = resolveTextNode(curProcessTextNode, 0, end - curProcessTextNode._wordoffset);
          //   break;
          // } else {
          //   curProcessTextNode = resolveTextNode(curProcessTextNode, 0, curProcessTextNode.textContent.length);
          // }

          const pos = curProcessTextNode._wordoffset + curProcessTextNode.textContent.length;
          const attachs = attachMap[pos];
          if (pos < end && attachs) {
            attachs.forEach((attach: Attach) => {
              const { node } = attach;

              resolveTextNode(node, 0, node.textContent.length, true);
            });
          }

          curProcessTextNode = curProcessTextNode._next;
<<<<<<< HEAD
        } while (curProcessTextNode);
      }

      // spans = [...spans, ...attachMockSpans];
      if (temp) {
        return spans;
      } else {
        spanNodeMap[underlineKey] = spans;
        return underlineKey;
=======
        }
>>>>>>> wrapunderline
      }

      // const attachMockSpans = [];
      // // 处理attachnode
      // Object.keys(attachMap).forEach(pos => {
      //   if (Number(pos) >= start && Number(pos) < end) {
      //     const attachs = attachMap[pos];
      //     attachs.forEach((attach: Attach) => {
      //       const { node } = attach;
      //       if (!attach.mockNode) {
      //         attach.mockNode = createAttachMockNode(node, props, attach);
      //         node.parentNode.insertBefore(attach.mockNode, node);
      //         attach.quote = 0;
      //       }
      //       attach.quote++;
      //       attachMockSpans.push(attach.mockNode);
      //     });
      //   }
      // });

      // spans = [...spans, ...attachMockSpans];
      return underlineKey;
    } catch (error) {
      console.error(error);
    }
  }

  function mockUnderline(start: number, end: number, props: any = {}, container = null, temp = false) {
    const underlineKey = getKeyByRange({ start, end });
    const spans = getSpanByKey(underlineKey);
    const fontScale = getScaleByDom();
    let splitResults: SplitResult[];

    function getSpanSplitResult(span: HTMLSpanElement): SplitResult[] {
      const nativeRange = document.createRange();
      // 这里可能有坑，span的第一个子节点不一定是text节点，mark
      nativeRange.selectNodeContents(span.childNodes[0]);
      const textSplit = splitRange(nativeRange)
        .map((r: Range) => {
          // 找第一个宽度不为0的矩形
          let rects;
          if (SPECIAL_NODE.indexOf(r.commonAncestorContainer.nodeName) !== -1) {
            rects = span.getClientRects();
          } else {
            rects = r.getClientRects();
          }
          for (let rect of rects) {
            if (rect.width > 0) {
              return { text: r.toString().replace('\n', ''), rect };
            }
          }
        })
        .filter((i: any) => i);
      textSplit.forEach((item: { firstBlockParent: any; style: string; rect: { right: number; left: number } }) => {
        const computeStyle = getComputedStyle(span);
        item.firstBlockParent = findFirstParent(span, dom => {
          return getComputedStyle(dom).display === 'block';
        });

        item.style = `text-align-last: justify; overflow-x: hidden; font-size:${
          parseFloat(computeStyle.fontSize) / fontScale
        }px; width: ${item.rect.right - item.rect.left}px; font-weight:${computeStyle.fontWeight}; font-family: ${
          computeStyle.fontFamily
        }; line-height: ${parseFloat(computeStyle.lineHeight) / fontScale}px`;
      });
      return textSplit;
    }
    if (spans.length === 0) {
      const underlineKey = insertSpanInRange(start, end);
      splitResults = getSpanByKey(underlineKey).reduce(
        (pre: any, cur: HTMLSpanElement) => [...pre, ...getSpanSplitResult(cur)],
        [],
      );
      // 用完就删掉
      removeSpanByKey(start, end);
    } else {
      splitResults = spans.reduce((pre: any, cur: HTMLSpanElement) => [...pre, ...getSpanSplitResult(cur)], []);
    }
    let allRanges: any = {};
    const linePosition = [];
    for (let splitResult of splitResults) {
      let find = false;
      for (let i = 0; i < linePosition.length; i++) {
        if (Math.abs(splitResult.rect.bottom - linePosition[i]) < 5) {
          allRanges[linePosition[i]].push(splitResult);
          find = true;
        }
      }
      if (!find) {
        linePosition.push(splitResult.rect.bottom);
        allRanges[splitResult.rect.bottom] = [splitResult];
      }
    }
    allRanges = Object.keys(allRanges)
      .sort((a, b) => parseFloat(a) - parseFloat(b))
      .reduce((pre, cur) => {
        allRanges[cur].sort((a: SplitResult, b: SplitResult) => {
          return a.rect.left - b.rect.left;
        });
        pre.push(allRanges[cur]);
        return pre;
      }, []);

    function createMockSpan(rects: Array<SplitResult>) {
      // 同一行的元素他们的第一个块级父元素应该都是一样的
      const firstBlockParent = rects[0].firstBlockParent;
      if (!container) {
        container = firstBlockParent;
      }
      container.style.position = 'relative';
      const containerRect = container.getClientRects()[0];
      const containerStyle = getComputedStyle(container);
      const span = document.createElement(tag || 'span');

      const parentStyle = getComputedStyle(firstBlockParent);
      // 同一行要以最高的位置为基准
      const top = rects.reduce((pre, cur) => {
        return Math.min(pre, cur.rect.top);
      }, rects[0].rect.top);
      span.style = `position: absolute;color: transparent;z-index: 10;text-indent: 0;white-space: nowrap;overflow-x: hidden;padding: ${
        parentStyle.padding
      }; padding-left:0;padding-right:0; top:${top - containerRect.top}px; left:${
        rects[0].rect.left - containerRect.left - parseFloat(containerStyle.borderLeftWidth)
      }px; font-size: ${parseFloat(parentStyle.fontSize) / fontScale}px; line-height: ${
        parseFloat(parentStyle.lineHeight) / fontScale
      }px`;

      container.appendChild(span);

      let maxTopOffset = -999;
      rects.forEach((r, index) => {
        // inline-flex会影响下划线粗细，所以要再套一层
        const flexS = document.createElement('span');
        const innerS = document.createElement('span');
        flexS.appendChild(innerS);
        innerS.innerText = `${r.text} add long text`; // 为了防止长度不够手动加点文本，反正看不到
        flexS.setAttribute(
          'style',
          `${r.style}; margin-left: ${index === 0 ? 0 : r.rect.left - rects[index - 1].rect.right}px`,
        );
        innerS.className = props.innerClass;
        // s.classList.add('mock_underline_child');
        span.appendChild(flexS);
        maxTopOffset = Math.max(maxTopOffset, span.getBoundingClientRect().top - flexS.getBoundingClientRect().top);
        // 先置为inline，用来算块级元素包含行内元素的高度差，算完后要用inline-flex保持宽度，并且保持位置
        flexS.style.display = 'inline-flex';
      });
      // 作者发现块级元素包含行内元素会导致块级元素和行内元素的top不同，而这个偏移值是我们模拟行内元素所需要的
      span.style.marginTop = `${maxTopOffset}px`;
      let containerWidth = parseFloat(getComputedStyle(span).width);
      span.style.width = `${containerWidth}px`;
      span.className = 'underline';
      if (!temp) {
        if (spanMockUnderlineMap[underlineKey]) {
          spanMockUnderlineMap[underlineKey].push(span);
        } else {
          spanMockUnderlineMap[underlineKey] = [span];
        }
      }
      span.underlineKey = underlineKey;
      Object.keys(props).forEach(key => {
        if (key !== 'innerClass') {
          span[key] = props[key];
        }
      });
      return span;
    }

    const mockUnderlineSpans = allRanges.map((rects: SplitResult[]) => createMockSpan(rects));
    if (temp) {
      return mockUnderlineSpans;
    }
    return underlineKey;
  }

  function mergeTextNode(span: Element) {
    // if (isAttachMockNode(span)) {
    //   return removeAttachMockNode(span);
    // }
    const parentNode = span.parentNode;
    let curTextNode: any;
    // 把所有子节点拿到外面
    while ((curTextNode = span.childNodes[0])) {
      parentNode.insertBefore(curTextNode, span);
    }
    span.remove();
    if (span._isAttach) return;
    // 在合并textnode前，找到连续的textnode节点并重新指定_prev和_next
    let firstTextNode: Text;
    parentNode.childNodes.forEach((child: Text) => {
      if (isTextNode(child)) {
        if (!firstTextNode) firstTextNode = child;
        state.textNodeArr.fill(firstTextNode, child._wordoffset, child._wordoffset + child.textContent.length);
        if (child._next) {
          child._next._prev = firstTextNode;
        }
        firstTextNode._next = child._next;
      } else {
        firstTextNode = null;
      }
    });
    parentNode.normalize();
  }

  function getTextByStartEnd(start: number, end: number) {
    try {
      if (end <= start) return '';
      const startNode = state.textNodeArr[start];
      const endNode = state.textNodeArr[end - 1];
      if (!startNode || !endNode) return '';
      let text = startNode.textContent.slice(start - startNode._wordoffset, end - startNode._wordoffset);
      if (startNode !== endNode) {
        // 说明不止由startNode组成text
        let curNode = startNode;
        do {
          curNode = curNode._next;
          if (inSameLine(curNode, curNode._prev)) {
            text += ' ';
          } else if (needWrap(curNode, curNode._prev)) {
            text += '\n';
          }
          text += curNode.textContent.slice(0, end - curNode._wordoffset);
        } while (curNode !== endNode);
      }

      return text;
    } catch (error) {
      console.error(error);
    }
  }

<<<<<<< Updated upstream
<<<<<<< HEAD
  function getRenderInfoByStartEnd(start: number, end: number) {
    if (end <= start) return [];
    const startNode = textNodeArr[start];
    const endNode = textNodeArr[end - 1];
    if (!startNode || !endNode) return [];
    const result = [];
    // 说明不止由startNode组成text
    let curNode = startNode;
    do {
      let text = startNode.textContent.slice(start - startNode._wordoffset, end - startNode._wordoffset);
      curNode = curNode._next;
      if (needWrap(curNode, curNode._prev)) {
        text += '\n';
      }
      result.push({ ...curNode._renderInfo, textContent: text });
      // text += curNode.textContent.slice(0, end - curNode._wordoffset);
    } while (curNode !== endNode);

    return result;
  }

=======
>>>>>>> Stashed changes
  function removeSpanByKey(underlineKey: string | number, mock = false) {
    if (mock) {
      if (spanMockUnderlineMap[underlineKey]) {
        spanMockUnderlineMap[underlineKey].forEach((s: { remove: () => any }) => s.remove());
        delete spanMockUnderlineMap[underlineKey];
      }
    } else {
      if (spanNodeMap[underlineKey]) {
        spanNodeMap[underlineKey].forEach(mergeTextNode);
        delete spanNodeMap[underlineKey];
      }
    }
=======
  function removeSpanByKey(start: number, end: number) {
    getSpans(start, end).forEach(s => {
      mergeTextNode(s);
    });
>>>>>>> wrapunderline
  }

  function getSpanByKey(underlineKey: string | number, mock = false) {
    if (mock) {
      return spanMockUnderlineMap[underlineKey] || [];
    }
    return spanNodeMap[underlineKey] || [];
  }

  function getSpans(start: number, end: number) {
    // if (mock) {
    //   return spanMockUnderlineMap[underlineKey] || [];
    // }
    const startTextNode = textNodeArr[start];
    const endTextNode = textNodeArr[end - 1];
    const spans = [];
    let curProcessTextNode: Text;
    do {
      if (!curProcessTextNode) {
        curProcessTextNode = startTextNode;
      } else {
        curProcessTextNode = curProcessTextNode._next;
      }
      spans.push(findParentHighlightSpan(curProcessTextNode));
    } while (curProcessTextNode !== endTextNode);
    return Array.from(new Set(spans));
  }

  // 获取文章总字数
  function getTotalCount() {
    return state.textNodeArr.length;
  }

  function getNativeRangeByStartAndEnd(start: number, end: number) {
    if (end <= start) return null;
    const range = document.createRange();
    range.setStart(state.textNodeArr[start], start - state.textNodeArr[start]._wordoffset);
    range.setEnd(state.textNodeArr[end - 1], end - state.textNodeArr[end - 1]._wordoffset);
    return range;
  }

  function getNodeAndOffset(offset: number, preferPrevNode = false) {
    if (preferPrevNode) {
      if (state.textNodeArr[offset - 1]) {
        return {
          node: state.textNodeArr[offset - 1],
          offset: offset - state.textNodeArr[offset - 1]._wordoffset,
        };
      }
    }
    return {
      node: state.textNodeArr[offset],
      offset: offset - state.textNodeArr[offset]?._wordoffset,
    };
  }

  function computeDomPos() {
    attachMap = {};
    state.textNodeArr = [];
    const dom = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!dom) return;
    let offset = 0;
    let lastTextNode = null;
    const treeWalker = document.createTreeWalker(dom, NodeFilter.SHOW_ALL, {
      acceptNode: needFilterNode || (() => NodeFilter.FILTER_ACCEPT),
    });
    let currentNode = treeWalker.currentNode as any;

    while (currentNode) {
      currentNode._wordoffset = offset;

      plugins.forEach(p => p.init(currentNode));
      // 找一下有没有文字节点要带上它一起划线
      !getAttachNode && (getAttachNode = () => false);
      if (isTextNode(currentNode) && getAttachNode(currentNode, lastTextNode)) {
        const attachPosition = lastTextNode._wordoffset + lastTextNode.textContent.length;
        attachMap[attachPosition]
          ? attachMap[attachPosition].push({ node: currentNode, mockNode: null, quote: 0 })
          : (attachMap[attachPosition] = [{ node: currentNode, quote: 0, mockNode: null }]);
      }

      if (isTextNode(currentNode) && !getAttachNode(currentNode)) {
        if (lastTextNode) {
          // 做个链表
          lastTextNode._next = currentNode;
          currentNode._prev = lastTextNode;
        }
        const wordLen = currentNode.textContent.length;
        const newOffset = offset + wordLen;
        state.textNodeArr.length = newOffset;
        state.textNodeArr.fill(currentNode, offset, newOffset);
        offset = newOffset;
        lastTextNode = currentNode;
      }
      currentNode = treeWalker.nextNode();
    }

    return state.textNodeArr;
  }
  computeDomPos();

  const exportFuncs = {
    insertSpanInRange,
    getTextByStartEnd,
    removeSpanByKey,
    getSpans,
    getSpanByKey,
    getTotalCount,
    getNativeRangeByStartAndEnd,
    mockUnderline,
    computeDomPos,
    mergeTextNode,
    getNodeAndOffset,
  };
  plugins.forEach(p => {
    p.exportFuncs.forEach(f => (exportFuncs[f] = p[f]));
  });

  return exportFuncs;
}

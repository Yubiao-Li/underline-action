import { getScaleByDom } from './getScaleByDom';
import { needWrap } from './needWrap';
import { findFirstBlockParent } from './findFirstBlockParent';
import { splitRange } from './splitRange';

export function UnderlineAction(opt) {
  // 用来按顺序保存text节点方便后面遍历
  const textNodeArr = [];
  // 保存key对应的span列表，方便删除
  const spanNodeMap = {};
  const spanMockUnderlineMap = {};

  function isTextNode(node) {
    // 只有文字节点才需要计算偏移量
    return node.nodeName === '#text';
  }

  function createHighlightSpan(content, props) {
    const span = document.createElement(opt.tag || 'span');
    span.textContent = content;
    span.className = 'underline';
    if (spanNodeMap[props.underlineKey]) {
      spanNodeMap[props.underlineKey].push(span);
    } else {
      spanNodeMap[props.underlineKey] = [span];
    }
    Object.keys(props).forEach(key => (span[key] = props[key]));
    return span;
  }

  // 分割textnode，把中间的取出来用span包住，并更新数组和链表
  function resolveTextNode(textnode, startOffset, endOffset, props) {
    const firstText = textnode.textContent.slice(0, startOffset);
    const secondText = textnode.textContent.slice(startOffset, endOffset);
    const lastText = textnode.textContent.slice(endOffset);
    const behindTextNode = textnode.splitText(startOffset);
    const fragment = document.createDocumentFragment();
    const span = createHighlightSpan(secondText, props);
    const spanTextNode = span.childNodes[0];
    textNodeArr.fill(
      spanTextNode,
      textnode._wordoffset + startOffset,
      textnode._wordoffset + endOffset
    );
    spanTextNode._wordoffset = textnode._wordoffset + startOffset;
    fragment.appendChild(span);

    if (lastText) {
      const lastTextNode = document.createTextNode(lastText);
      spanTextNode._next = lastTextNode;
      lastTextNode._prev = spanTextNode;
      lastTextNode._wordoffset = textnode._wordoffset + endOffset;
      if (textnode._next) {
        lastTextNode._next = textnode._next;
        textnode._next._prev = lastTextNode;
        textNodeArr.fill(
          lastTextNode,
          textnode._wordoffset + endOffset,
          textnode._next._wordoffset
        );
      } else {
        textNodeArr.fill(lastTextNode, textnode._wordoffset + endOffset);
      }
      fragment.appendChild(lastTextNode);
    } else if (textnode._next) {
      spanTextNode._next = textnode._next;
      textnode._next._prev = spanTextNode;
    }

    if (firstText) {
      textnode._next = spanTextNode;
      spanTextNode._prev = textnode;
    } else {
      if (textnode._prev) {
        textnode._prev._next = spanTextNode;
        spanTextNode._prev = textnode._prev;
      }
      textnode.remove();
    }

    behindTextNode.parentNode.insertBefore(fragment, behindTextNode);
    behindTextNode.remove();
    return spanTextNode;
  }

  function insertSpanInRange(start, end, props) {
    try {
      if (end <= start) return;
      const underlineKey = opt.getKeyByRange({ start, end, props });
      const startTextNode = textNodeArr[start];
      const endTextNode = textNodeArr[end - 1];
      if (!startTextNode || !endTextNode) return;
      let curProcessTextNode = startTextNode;
      if (startTextNode === endTextNode) {
        // 如果是同一段，只需要分解一个节点就好了
        resolveTextNode(
          curProcessTextNode,
          start - curProcessTextNode._wordoffset,
          end - curProcessTextNode._wordoffset,
          { ...props, underlineKey }
        );
      } else {
        // 如果是不同段，需要一直遍历到最后一个节点，全部分割一遍
        do {
          // 分解之后要记得更新一下当前处理的节点指针为插入span的部分dom
          if (curProcessTextNode === startTextNode) {
            curProcessTextNode = resolveTextNode(
              curProcessTextNode,
              start - curProcessTextNode._wordoffset,
              curProcessTextNode.textContent.length,
              { ...props, underlineKey }
            );
          } else if (curProcessTextNode === endTextNode) {
            curProcessTextNode = resolveTextNode(
              curProcessTextNode,
              0,
              end - curProcessTextNode._wordoffset,
              { ...props, underlineKey }
            );
            break;
          } else {
            curProcessTextNode = resolveTextNode(
              curProcessTextNode,
              0,
              curProcessTextNode.textContent.length,
              { ...props, underlineKey }
            );
          }

          curProcessTextNode = curProcessTextNode._next;
        } while (curProcessTextNode);
      }

      return underlineKey;
    } catch (error) {
      console.error(error);
    }
  }

  function mockUnderline(start, end, props = {}, container = document.body, temp=false) {
    const containerRect = container.getBoundingClientRect();
    const underlineKey = opt.getKeyByRange({ start, end });
    const spans = getSpanByKey(underlineKey);
    const fontScale = getScaleByDom();
    let splitResults;

    function getSpanSplitResult(span) {
      const nativeRange = document.createRange();
      // 这里可能有坑，span的第一个子节点不一定是text节点，mark
      nativeRange.selectNodeContents(span.childNodes[0]);
      const textSplit = splitRange(nativeRange).map(r => ({ text: r.toString() }));
      const rectSplit = [];
      for (let rect of span.getClientRects()) {
        if (rectSplit.length && rectSplit[rectSplit.length - 1].top === rect.top) {
          rectSplit[rectSplit.length - 1].left = Math.min(
            rect.left,
            rectSplit[rectSplit.length - 1].left
          );
          rectSplit[rectSplit.length - 1].right = Math.max(
            rect.right,
            rectSplit[rectSplit.length - 1].right
          );
        } else {
          rectSplit.push({
            top: rect.top,
            right: rect.right,
            left: rect.left,
            bottom: rect.bottom,
          });
        }
      }

      if (rectSplit.length === textSplit.length) {
        textSplit.forEach((item, index) => {
          item.rect = rectSplit[index];
          const computeStyle = getComputedStyle(span);
          item.firstBlockParent = findFirstBlockParent(span);

          item.style = `text-align-last: justify; overflow-x: hidden; font-size:${
            parseFloat(computeStyle.fontSize) / fontScale
          }px; width: ${item.rect.right - item.rect.left}px; font-weight:${
            computeStyle.fontWeight
          }; font-family: ${computeStyle.fontFamily}; line-height: ${
            parseFloat(computeStyle.lineHeight) / fontScale
          }px`;
        });
        return textSplit;
      } else {
        return [];
      }
    }
    if (spans.length === 0) {
      const underlineKey = insertSpanInRange(start, end);
      splitResults = getSpanByKey(underlineKey).reduce(
        (pre, cur) => [...pre, ...getSpanSplitResult(cur)],
        []
      );
      // 用完就删掉
      removeSpanByKey(underlineKey);
    } else {
      splitResults = spans.reduce((pre, cur) => [...pre, ...getSpanSplitResult(cur)], []);
    }
    let allRanges = {};
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
        pre.push(allRanges[cur]);
        return pre;
      }, []);

    function createMockSpan(rects) {
      const span = document.createElement(opt.tag || 'span');

      // 同一行的元素他们的第一个块级父元素应该都是一样的
      const firstBlockParent = rects[0].firstBlockParent;
      const parentStyle = getComputedStyle(firstBlockParent);
      span.style = `position: absolute;color: transparent;z-index: 10;white-space: nowrap;overflow-x: hidden;padding: ${
        parentStyle.padding
      }; padding-left:0;padding-right:0; top:${rects[0].rect.top - containerRect.top}px; left:${
        rects[0].rect.left - containerRect.left
      }px; font-size: ${parseFloat(parentStyle.fontSize) / fontScale}px; line-height: ${
        parseFloat(parentStyle.lineHeight) / fontScale
      }px`;

      container.appendChild(span);

      let maxTopOffset = -999;
      rects.forEach((r, index) => {
        const s = document.createElement('span');
        s.innerText = `${r.text}add long long text`; // 为了防止长度不够手动加点文本，反正看不到
        s.style = `${r.style}; margin-left: ${
          index === 0 ? 0 : r.rect.left - rects[index - 1].rect.right
        }px`;
        s.className = props.innerClass;
        span.appendChild(s);
        maxTopOffset = Math.max(
          maxTopOffset,
          span.getBoundingClientRect().top - s.getBoundingClientRect().top
        );
        // 先置为inline，用来算块级元素包含行内元素的高度差，算完后要用inline-flex保持宽度，并且保持位置
        s.style.display = 'inline-flex';
      });
      // 作者发现块级元素包含行内元素会导致块级元素和行内元素的top不同，而这个偏移值是我们模拟行内元素所需要的
      span.style.marginTop = `${maxTopOffset}px`;
      let containerWidth = parseFloat(getComputedStyle(span).width);
      span.style.width = `${containerWidth}px`;
      span.className = 'underline';
      if(!temp) {
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

    const mockUnderlineSpans = allRanges.map(rects => createMockSpan(rects));
    if(temp) {
      return mockUnderlineSpans;      
    }
    return underlineKey;
  }

  function mergeTextNode(span) {
    const parentNode = span.parentNode;
    let curTextNode;
    while ((curTextNode = span.childNodes[0])) {
      parentNode.insertBefore(curTextNode, span);
    }
    span.remove();
    // 在合并textnode前，找到连续的textnode节点并重新指定_prev和_next
    let firstTextNode;
    parentNode.childNodes.forEach(child => {
      if (isTextNode(child)) {
        if (!firstTextNode) firstTextNode = child;
        textNodeArr.fill(
          firstTextNode,
          child._wordoffset,
          child._wordoffset + child.textContent.length
        );
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

  function getTextByStartEnd(start, end) {
    try {
      if (end <= start) return '';
      const startNode = textNodeArr[start];
      const endNode = textNodeArr[end - 1];
      if (!startNode || !endNode) return '';
      let text = startNode.textContent.slice(
        start - startNode._wordoffset,
        end - startNode._wordoffset
      );
      if (startNode !== endNode) {
        // 说明不止由startNode组成text
        let curNode = startNode;
        do {
          curNode = curNode._next;
          if (needWrap(curNode, curNode._prev)) {
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

  function removeSpanByKey(underlineKey, mock = false) {
    if (mock) {
      if (spanMockUnderlineMap[underlineKey]) {
        spanMockUnderlineMap[underlineKey].forEach(s => s.remove());
        delete spanMockUnderlineMap[underlineKey];
      }
    } else {
      if (spanNodeMap[underlineKey]) {
        spanNodeMap[underlineKey].forEach(mergeTextNode);
        delete spanNodeMap[underlineKey];
      }
    }
  }

  function getSpanByKey(underlineKey, mock = false) {
    if (mock) {
      return spanMockUnderlineMap[underlineKey] || [];
    }
    return spanNodeMap[underlineKey] || [];
  }

  // 获取文章总字数
  function getTotalCount() {
    return textNodeArr.length;
  }

  function getNativeRangeByStartAndEnd(start, end) {
    if (end <= start) return null;
    const range = document.createRange();
    range.setStart(textNodeArr[start], start - textNodeArr[start]._wordoffset);
    range.setEnd(textNodeArr[end - 1], end - textNodeArr[end - 1]._wordoffset);
    return range;
  }

  function computeDomPos() {
    const dom =
      typeof opt.selector === 'string' ? document.querySelector(opt.selector) : opt.selector;
    if (!dom) return;
    let offset = 0;
    let lastTextNode = null;
    const treeWalker = document.createTreeWalker(
      dom,
      NodeFilter.SHOW_ALL,
      {
        acceptNode: opt.needFilterNode || (() => NodeFilter.FILTER_ACCEPT),
      },
      true
    );
    let currentNode = treeWalker.currentNode;

    while (currentNode) {
      currentNode._wordoffset = offset;
      if (isTextNode(currentNode)) {
        if (lastTextNode) {
          // 做个链表
          lastTextNode._next = currentNode;
          currentNode._prev = lastTextNode;
        }
        const wordLen = currentNode.textContent.length;
        const newOffset = offset + wordLen;
        textNodeArr.length = newOffset;
        textNodeArr.fill(currentNode, offset, newOffset);
        offset = newOffset;
        lastTextNode = currentNode;
      }
      currentNode = treeWalker.nextNode();
    }

    return textNodeArr;
  }
  computeDomPos();

  return {
    insertSpanInRange,
    getTextByStartEnd,
    removeSpanByKey,
    getSpanByKey,
    getTotalCount,
    getNativeRangeByStartAndEnd,
    mockUnderline,
  };
}

import { isTextNode } from './utils';

// 将一个跨行的 range 切割为多个不跨行的 range，用bottom来比较，因为有的文字在同一行也会突出来
export function splitRange(nativeRange: {
  startContainer: Node;
  startOffset: number;
  endContainer: Node;
  endOffset: number;
}) {
  const { startContainer, startOffset, endContainer, endOffset } = nativeRange;
  const range = document.createRange();
  const rowBottom = getCharBottom(startContainer as Text, startOffset);
  // 头尾高度一致说明在同一行
  if (rowBottom === getCharBottom(endContainer as Text, endOffset - 1)) {
    range.setStart(startContainer, startOffset);
    range.setEnd(endContainer, endOffset);
    return [range];
  } else {
    const last = findRowLastChar(rowBottom, startContainer as Text, startOffset, endContainer, endOffset);
    range.setStart(startContainer, startOffset);
    range.setEnd(last.node, last.offset + 1);
    const findNextNode = last.offset + 1 === last.node.textContent.length;
    const others = splitRange({
      startContainer: findNextNode ? last.node._next : last.node,
      startOffset: findNextNode ? 0 : last.offset + 1,
      endContainer,
      endOffset,
    });
    return [range, ...others];
  }
}

function findRowLastCharSameNode(bottom: number, node: Text, start: number, end: number) {
  if (end - start === 1) {
    return start;
  }
  const mid = (end + start) >> 1;
  return getCharBottom(node, mid) === bottom
    ? findRowLastCharSameNode(bottom, node, mid, end)
    : findRowLastCharSameNode(bottom, node, start, mid);
}

// 二分法找到 range 某一行的最右字符
function findRowLastChar(
  top: number,
  startContainer: Text,
  startOffset: number,
  endContainer: Node,
  endOffset: number,
) {
  if (startContainer === endContainer) {
    // 只有一个节点二分
    return {
      node: startContainer,
      offset: findRowLastCharSameNode(top, startContainer, startOffset, endOffset),
    };
  } else if (top !== getCharBottom(startContainer._next, 0)) {
    // 下一个文字节点不在当前行，那么说明转折点就在当前文字节点
    return {
      node: startContainer,
      offset: findRowLastCharSameNode(top, startContainer, startOffset, startContainer.textContent.length),
    };
  } else {
    // 首尾节点不同但换行不发生在首节点
    return findRowLastChar(top, startContainer._next, 0, endContainer, endOffset);
  }
}

// 获取 range 某个字符位置的 top 值
function getCharBottom(node: Text, offset: number) {
  return Math.round(getCharRect(node, offset).bottom);
}

// 获取 range 某个字符位置的 DOMRect
function getCharRect(node: Node, offset: number) {
  const range = document.createRange();
  range.setStart(node, offset);
  range.setEnd(node, offset + 1 > node.textContent.length ? offset : offset + 1);
  return range.getBoundingClientRect();
}

function findLine(leaves: Node[], startNodeIndex: number, startOffset: number) {
  function isNextLine(range: Range) {
    const rects = [...range.getClientRects()].filter(r => r.width !== 0);
    if (rects.length === 0 || Math.abs(rects[rects.length - 1].bottom - rects[0].bottom) < 15) {
      return false;
    }
    return true;
  }

  const range = document.createRange();
  const startNode = leaves[startNodeIndex];

  range.setStart(startNode, startOffset);

  function findLastNode(start: number, end: number) {
    if (end - start <= 1) {
      // 如果start都超了，那lastNode肯定不是end，反之要继续判断
      range.setEndAfter(leaves[start]);
      return !isNextLine(range) ? end : start;
    }
    const mid = (start + end) >> 1;
    range.setEndAfter(leaves[mid]);
    return !isNextLine(range) ? findLastNode(mid, end) : findLastNode(start, mid);
  }
  const lastNodeIndex = findLastNode(startNodeIndex, leaves.length - 1);
  const lastNode = leaves[lastNodeIndex];
  function findLastCharIndex(start: number, end: number) {
    if (end - start <= 1) {
      if (isTextNode(lastNode)) {
        range.setEnd(lastNode, end);
      } else {
        range.setEndAfter(lastNode);
      }
      if (isNextLine(range)) {
        if (start === 0) {
          // 说明要去掉这个节点才能不超
          range.setEndBefore(lastNode);
        } else {
          range.setEnd(lastNode, start);
        }
        return start;
      } else {
        return end;
      }
    }
    const mid = (start + end) >> 1;
    range.setEnd(lastNode, mid);
    return !isNextLine(range) ? findLastCharIndex(mid, end) : findLastCharIndex(start, mid);
  }

  const lastCharIndex = findLastCharIndex(lastNode === startNode ? startOffset : 0, lastNode.textContent.length);
  return {
    range,
    lastNodeIndex,
    lastCharIndex,
  };
}

export function findAllLines(dom: HTMLElement) {
  const lines = [];

  // 二分法找出每一行
  function getLeaf(node: Node) {
    let result: Node[] = [];
    if (!node.childNodes || node.childNodes.length === 0) {
      return [node];
    }
    node.childNodes.forEach(child => {
      result = [...result, ...getLeaf(child)];
    });
    return result;
  }
  const leaves = getLeaf(dom);

  let startNodeIndex = 0;
  let startOffset = 0;
  while (startNodeIndex < leaves.length) {
    const lineInfo = findLine(leaves, startNodeIndex, startOffset);
    lines.push(lineInfo.range);
    startNodeIndex = lineInfo.lastNodeIndex;
    startOffset = lineInfo.lastCharIndex;
    if (startNodeIndex === leaves.length - 1 && startOffset === leaves[startNodeIndex].textContent.length) {
      break;
    }
  }

  return lines;
}

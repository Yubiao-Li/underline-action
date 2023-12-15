import { findFirstParent } from './findParent.js';

function findBlock(dom1: Node, dom2: Node) {
  // dom1的第一个block父节点不是dom2的父节点，说明需要换行
  const parentBlockNode = findFirstParent(dom1, dom => {
    return getComputedStyle(dom).display === 'block' || getComputedStyle(dom).display === 'table-row';
  });
  if (parentBlockNode && !parentBlockNode.contains(dom2)) {
    return true;
  }
  return false;
}

function findBr(dom1: Node, dom2: Node) {
  // 判断两个节点之间是否有br节点
  const range = document.createRange();
  range.setStart(dom2, 0);
  range.setEnd(dom1, 1);
  const div = document.createElement('div');
  div.appendChild(range.cloneContents());
  return div.getElementsByTagName('br').length !== 0;
}

export function needWrap(dom1: Node, dom2: Node) {
  if (!dom1 || !dom2) return false;

  return findBlock(dom1, dom2) || findBlock(dom2, dom1) || findBr(dom1, dom2) || findBr(dom2, dom1);
}

export function inSameLine(dom1: Node, dom2: Node) {
  if (!dom1 || !dom2) return false;
  // 同一个flex里面
  const parentFlexNode = findFirstParent(dom1, dom => {
    return getComputedStyle(dom).display === 'flex';
  });
  if (parentFlexNode && parentFlexNode.contains(dom2) && getComputedStyle(parentFlexNode).flexDirection === 'row') {
    return true;
  }
  // 同一个tr里面
  const parentTrNode = findFirstParent(dom1, dom => {
    return dom.tagName === 'TR';
  });
  if (parentTrNode && parentTrNode.contains(dom2)) {
    return true;
  }
  return false;
}

export function removeNowrapLinebreak(node: Text) {
  const style = getComputedStyle(node.parentNode as Element);
  if (style.display === 'inline' && style.whiteSpace.indexOf('pre') === -1) {
    // 处理一下一些不换行的换行符
    node._text = node.textContent.replaceAll(/\n/g, ' ');
  } else {
    node._text = node.textContent;
  }
}

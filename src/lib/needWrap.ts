import { findFirstBlockParent } from './findFirstBlockParent.js';

function findBlock(dom1: Node, dom2: Node) {
  // dom1的第一个block父节点不是dom2的父节点，说明需要换行
  const parentBlockNode = findFirstBlockParent(dom1);
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

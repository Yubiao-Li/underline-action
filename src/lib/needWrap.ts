import { findFirstParent } from './findParent.js';

function findBlock(dom1: Node, dom2: Node) {
  // 找到两个节点的最近公共父节点
  let parent1: Node | null = dom1.parentNode;
  while (parent1) {
    if (parent1.contains(dom2)) {
      // 找到公共父节点后，检查 dom1 到公共父节点路径上是否经过了 block 子节点
      let cur: Node | null = dom1;
      while (cur && cur !== parent1) {
        if (cur.nodeType === Node.ELEMENT_NODE) {
          const style = getComputedStyle(cur as Element);
          if (style.display === 'block' || style.display === 'table-row') {
            return true;
          }
        }
        cur = cur.parentNode;
      }
      break;
    }
    parent1 = parent1.parentNode;
  }
  return false;
}

function findBr(dom1: Node, dom2: Node) {
  // 判断两个节点之间是否有br节点
  const range = document.createRange();
  range.setStartBefore(dom2);
  range.setEndAfter(dom1);
  const div = document.createElement('div');
  div.appendChild(range.cloneContents());
  return div.getElementsByTagName('br').length !== 0;
}

export function needWrap(dom1: Node, dom2: Node) {
  if (!dom1 || !dom2) return false;

  if (findBlock(dom1, dom2) || findBlock(dom2, dom1) || findBr(dom1, dom2) || findBr(dom2, dom1)) {
    if (inSameLine(dom1, dom2)) return false;
    return true;
  }

  return false;
}

export function inSameLine(dom1: Node, dom2: Node) {
  if (!dom1 || !dom2) return false;
  
  // 找到两个节点的最近公共父节点
  let parent1: Node | null = dom1.parentNode;
  while (parent1) {
    if (parent1.contains(dom2)) {
      // 检查这个公共父节点是否是 flex 容器且方向为 row
      if (parent1.nodeType === Node.ELEMENT_NODE) {
        const style = getComputedStyle(parent1 as Element);
        if (style.display === 'flex' && style.flexDirection === 'row') {
          return true;
        }
      }
      
      // 检查这个公共父节点是否是 TR
      if (parent1.nodeType === Node.ELEMENT_NODE && (parent1 as Element).tagName === 'TR') {
        return true;
      }
      break;
    }
    parent1 = parent1.parentNode;
  }
  
  return false;
}

export function removeNowrapLinebreak(node: Text) {
  const style = getComputedStyle(node.parentNode as Element);
  if (style.display === 'inline' && style.whiteSpace.indexOf('pre') === -1) {
    // 处理一下一些不换行的换行符
    node._text = node.textContent.replace(/\n/g, ' ');
  } else {
    node._text = node.textContent;
  }
}

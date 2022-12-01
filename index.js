function findFirstBlockParent(dom) {
  let parent = dom.parentNode;
  while (parent) {
    if (getComputedStyle(parent).display === 'block') {
      break;
    }
    parent = parent.parentNode;
  }
  return parent;
}

export function needWrap(dom1, dom2) {
  if (!dom1 || !dom2) return false;
  const parentBlockNode = findFirstBlockParent(dom1);
  // dom1的第一个block父节点不是dom2的父节点，说明需要换行
  if (parentBlockNode && !parentBlockNode.contains(dom2)) {
    return true;
  }
  // 判断两个节点之间是否有br节点
  const range = document.createRange();
  range.setStart(dom1, 0);
  range.setEnd(dom2, 1);
  const div = document.createElement('div');
  div.appendChild(range.cloneContents());
  return div.getElementsByTagName('br').length !== 0;
}

export function UnderlineAction(opt) {
  // 用来按顺序保存text节点方便后面遍历
  const textNodeArr = [];
  // 保存key对应的span列表，方便删除
  const spanNodeMap = {};

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

  function removeSpanByKey(underlineKey) {
    if (spanNodeMap[underlineKey]) {
      spanNodeMap[underlineKey].forEach(mergeTextNode);
      delete spanNodeMap[underlineKey];
    }
  }

  function getSpanByKey(underlineKey) {
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
  };
}

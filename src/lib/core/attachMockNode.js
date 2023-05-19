const LONG_TEXT = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

export function createAttachMockNode(node, props, attach) {
  const width = node.getBoundingClientRect().width;
  const attachMockNode = document.createElement('span');
  attachMockNode.innerText = LONG_TEXT;
  attachMockNode.className = props.className;
  attachMockNode.style = `width:${width}px;user-select:none; display: inline-flex; white-space:nowrap; overflow-x:hidden; color: transparent`;
  attachMockNode._attachmock = true;
  attachMockNode._attach = attach;
  node.onAttach && node.onAttach();
  return attachMockNode;
}

export function removeAttachMockNode(node) {
  node._attach.quote--;
  if (node._attach.quote === 0) {
    node.remove();
    node._attach.onRemove && node._attach.onRemove();
  }
}

export function isAttachMockNode(node) {
  if (!node) return false;
  return node._attachmock;
}

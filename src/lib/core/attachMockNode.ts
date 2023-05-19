import { Attach } from '../type';

const LONG_TEXT = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

declare global {
  interface Element {
    onAttach?: () => void;
    onRemove?: () => void;
    _attach: Attach;
    _attachmock?: boolean;
    _wordoffset: number;
  }
}

export function createAttachMockNode(node: Element, props: { className: string }, attach: Attach) {
  const width = node.getBoundingClientRect().width;
  const attachMockNode = document.createElement('span');
  attachMockNode.innerText = LONG_TEXT;
  attachMockNode.className = props.className;
  attachMockNode.setAttribute(
    'style',
    `width:${width}px;user-select:none; display: inline-flex; white-space:nowrap; overflow-x:hidden; color: transparent`,
  );
  attachMockNode._attachmock = true;
  attachMockNode._attach = attach;
  node.onAttach && node.onAttach();
  return attachMockNode;
}

export function removeAttachMockNode(node: Element) {
  node._attach.quote--;
  if (node._attach.quote === 0) {
    node.remove();
    node._attach.node.onRemove && node._attach.node.onRemove();
  }
}

export function isAttachMockNode(node: Element) {
  if (!node) return false;
  return node._attachmock;
}

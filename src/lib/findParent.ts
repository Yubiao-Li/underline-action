export function findFirstBlockParent(dom: Node) {
  let parent = dom.parentElement;
  while (parent) {
    if (getComputedStyle(parent).display === 'block') {
      break;
    }
    parent = parent.parentElement;
  }
  return parent;
}

export function findFirstFlexParent(dom: Node) {
  let parent = dom.parentElement;
  while (parent) {
    if (getComputedStyle(parent).display === 'flex') {
      break;
    }
    parent = parent.parentElement;
  }
  return parent;
}
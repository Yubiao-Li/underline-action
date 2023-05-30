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

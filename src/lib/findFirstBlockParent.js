export function findFirstBlockParent(dom) {
  let parent = dom.parentNode;
  while (parent) {
    if (getComputedStyle(parent).display === 'block') {
      break;
    }
    parent = parent.parentNode;
  }
  return parent;
}

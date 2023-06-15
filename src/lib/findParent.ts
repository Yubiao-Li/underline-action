export function findFirstParent(dom : Node, condition: (dom: Element) => boolean) {
  let parent = dom.parentElement;
  while (parent) {
    if (condition(parent)) {
      break;
    }
    parent = parent.parentElement;
  }
  return parent;
}
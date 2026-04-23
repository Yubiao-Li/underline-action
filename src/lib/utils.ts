export const SVG_NS = 'http://www.w3.org/2000/svg';

export function copyObjArray(obj: any, num: number) {
  const result = [];
  for (let i = 0; i < num; i++) {
    result.push(JSON.parse(JSON.stringify(obj)));
  }
  return result;
}

export function isTextNode(node: any) {
  // 只有文字节点才需要计算偏移量
  return node.nodeName === '#text' && node.textContent.length;
}

export function isLeafNode(node: HTMLElement): boolean {
  // 获取所有非空白文本的子节点
  const children = Array.from(node.childNodes).filter(child => 
      child.nodeType !== Node.TEXT_NODE || 
      (child.nodeType === Node.TEXT_NODE && child.nodeValue?.trim() !== '')
  );
  return children.length === 0;
}

/**
 * 判断一个节点是否处于 SVG <text> 子树内。
 * SVG 里的 text/tspan 不能嵌套 HTML <span>，否则渲染器直接忽略；
 * 外层调用方应在创建高亮元素前调用此函数，决定用 HTML span 还是 SVG tspan。
 */
export function isInSvgText(node: Node | null | undefined): boolean {
  let p: Node | null = (node as Node) || null;
  while (p) {
    // SVG 元素的 namespaceURI 一定是 SVG_NS
    if ((p as Element).namespaceURI === SVG_NS) return true;
    p = p.parentNode;
  }
  return false;
}

export function createHighlightSpan(tag: string | undefined, props: any) {
  const span =
    tag === 'tspan'
      ? (document.createElementNS(SVG_NS, 'tspan') as unknown as HTMLElement)
      : document.createElement(tag || 'span');
  span.setAttribute('class', 'underline');
  Object.keys(props).forEach(key => (span[key] = props[key]));
  return span;
}
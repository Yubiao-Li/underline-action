export const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * 常见的 SVG 元素标签白名单，用于判断 createHighlightSpan 是否需要走 SVG 命名空间。
 * 只覆盖可能作为高亮容器出现的标签；如有新增场景可扩充此集合。
 */
const SVG_TAGS = new Set([
  'tspan',
  'text',
  'textPath',
  'a',
  'g',
  'switch',
  'foreignObject',
]);

export function isSvgTag(tag: string | undefined): boolean {
  return !!tag && SVG_TAGS.has(tag);
}

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

export function createHighlightSpan(tag: string | undefined, props: Record<string, any>) {
  const isSvg = isSvgTag(tag);
  const span = isSvg
    ? (document.createElementNS(SVG_NS, tag || 'tspan') as unknown as HTMLElement)
    : document.createElement(tag || 'span');
  span.setAttribute('class', 'underline');
  Object.keys(props).forEach(key => {
    if (isSvg && (key === 'className' || key === 'class')) {
      // SVG 元素的 className 是只读的 SVGAnimatedString，必须走 setAttribute
      const cur = span.getAttribute('class') || '';
      span.setAttribute('class', `${cur} ${props[key] || ''}`.trim());
    } else if (isSvg && key === 'style' && typeof props[key] === 'string') {
      span.setAttribute('style', props[key]);
    } else {
      (span as any)[key] = props[key];
    }
  });
  return span;
}
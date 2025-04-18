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


export function createHighlightSpan(tag: string, props: any) {
  const span = document.createElement(tag || 'span');
  span.className = 'underline';
  Object.keys(props).forEach(key => (span[key] = props[key]));
  return span;
}
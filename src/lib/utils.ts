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

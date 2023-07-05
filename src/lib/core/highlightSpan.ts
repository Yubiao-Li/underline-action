import { RenderInfo } from "../type";

declare global {
  interface HTMLElement {
    _isHighlightSpan: boolean;
    _isAttach: boolean;
    _renderInfo: RenderInfo;
  }
}

export function createHighlightSpan(props: any, tag?: string) {
  const span = document.createElement(tag || 'span');
  span._isHighlightSpan = true;
  // span.textContent = content;
  span.className = 'underline';
  Object.keys(props).forEach(key => (span[key] = props[key]));
  return span;
}

export function isHighlightSpan(dom: HTMLElement) {
  return dom._isHighlightSpan;
}

export function findParentHighlightSpan(dom: Text) {
  let ele = dom.parentElement;
  do {
    if (isHighlightSpan(ele)) return ele;
  } while ((ele = ele.parentElement));
}

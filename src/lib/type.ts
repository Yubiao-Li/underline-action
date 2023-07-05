export interface SplitResult {
  rect: DOMRect;
  firstBlockParent: HTMLElement;
  text: string;
  style: string;
}

export interface Attach {
  quote: number;
  mockNode: Node;
  node: Text;
}

export interface RenderInfo {
  type: 'text' | 'td' | 'newline' | 'table-newline';
  colspan?: string;
  tableCol?: number;
  tableRow?: number;
  totalRow?: number;
  totalCol?: number;
  textContent?: string;
}

declare global {
  interface Text {
    _prev: Text;
    _next: Text;
    _wordoffset: number;
    _renderInfo: RenderInfo;
  }
  // interface Node {
  // }
}

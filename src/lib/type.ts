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
  tableCol?: number;
  tableRow?: number;
}

declare global {
  interface Text {
    _prev: Text;
    _next: Text;
    _wordoffset: number;
  }
  interface Node {
    _isAttach: boolean;
    _renderInfo: RenderInfo;
  }
}

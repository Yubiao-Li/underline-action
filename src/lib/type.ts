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

declare global {
  interface Text {
    _prev: Text;
    _next: Text;
    _wordoffset: number;
  }
  interface Node {
    _isAttach: boolean;
    _renderInfo: {
      tagName?: string;
      nodeName?: string;
      tableCol?: number;
      tableRow?: number;
    };
  }
}

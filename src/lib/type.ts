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

export interface RenderInfo extends Record<string, string | number> {
  type: string;
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
    _text: string;
  }
  // interface Node {
  // }

  interface HTMLElement {
    _isHighlightSpan: boolean;
    _isAttach?: boolean;
    _renderInfo: RenderInfo;
    underlineKey: string;
  }
}

export interface Options {
  getKeyByRange?(range: { start: number; end: number; props?: any }): string;
  tag: string;
  selector: string | HTMLElement;
  needFilterNode?: (node: Node) => number;
  getAttachNode?(cur: HTMLElement | Text, lastTextNode: Text): boolean;
  getRenderInfo?(cur: HTMLElement): object;
}

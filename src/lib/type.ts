export interface SplitResult {
  rect: { left: number; right: number; top: number; bottom: number };
  firstBlockParent?: HTMLElement;
  text?: string;
  style?: string;
}

export interface Attach {
  quote: number;
  mockNode: Node;
  node: Text;
}

export interface RenderInfo extends Record<string, string | number | undefined> {
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
    _special: HTMLElement;
  }
  // interface Node {
  // }

  interface HTMLElement extends Text {
    _isHighlightSpan: boolean;
    _renderInfo: RenderInfo;
    _innerSpan?: HTMLSpanElement;
    underlineKey: string;
  }
}

export interface Options {
  getKeyByRange?(range: { start: number; end: number; props?: any }): string;
  tag?: string;
  selector: string | HTMLElement;
  needFilterNode?: (node: Node) => number;
  getAttachNode?(cur: HTMLElement | Text, lastContentNode: Text): boolean;
  getRenderInfo?(cur: HTMLElement): object;
  isSpecialNode?(cur: HTMLElement): boolean;
  
  // 特殊的正文节点
  getContentNodeInfo?(cur: HTMLElement): {
    text: string;
    len: number;
  } | null;
  shadowNodeWhiteList: string[];
}

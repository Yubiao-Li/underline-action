export interface SplitResult {
  rect: DOMRect;
  firstBlockParent: HTMLElement;
  text: string;
  style: string;
}

export interface Attach {
  quote: number;
  mockNode: Node;
  node: Element;
}
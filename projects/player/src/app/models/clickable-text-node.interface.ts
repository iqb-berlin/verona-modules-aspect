export interface ClickableTextNode {
  node: Node;
  words: Clickable[]
}

export interface Clickable {
  id: number;
  before: string;
  clickable: string;
  after: string;
  clicked: boolean
}

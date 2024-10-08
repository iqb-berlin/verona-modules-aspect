export interface MarkablesContainer {
  node: Node;
  markables: Markable[]
}

export interface Markable {
  id: number;
  prefix: string;
  word: string;
  suffix: string;
  marked: boolean
}

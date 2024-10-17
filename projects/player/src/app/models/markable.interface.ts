export interface MarkablesContainer {
  node: Node;
  markables: Markable[]
}

export interface Markable {
  id: number;
  prefix: string;
  word: string;
  suffix: string;
  isActive: boolean;
  color: string | null;
}

export interface MarkingColor {
  id: string,
  color: string | undefined,
  markingMode: 'selection' | 'word' | 'range',
  markingPanels: string[]
}

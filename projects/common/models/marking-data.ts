export interface MarkingData {
  active: boolean,
  mode: 'mark' | 'delete',
  color: string,
  colorName: string | undefined
}

export interface MarkingPanelMarkingData {
  id: string,
  markingData: MarkingData
}

export interface MarkingRange {
  first: number | null;
  second: number | null;
}

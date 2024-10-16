export interface MarkingData {
  active: boolean,
  mode: 'mark' | 'delete',
  color: string,
  colorName: string | undefined
}

export interface RemoteMarkingData {
  id: string,
  markingData: MarkingData
}

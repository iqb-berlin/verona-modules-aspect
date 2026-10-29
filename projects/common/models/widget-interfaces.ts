export interface WidgetPeriodicTableCall {
  showInfoOrder: boolean;
  showInfoENeg: boolean;
  showInfoAMass: boolean;
  showInfoName: boolean;
  showInfoSymbol: boolean;
  highlightBlocks: boolean;
  closeOnSelection: boolean;
  maxNumberOfSelections: number;
}

export interface WidgetMoleculeEditorCall {
  bondingType: 'VALENCE' | 'ELECTRONS';
}

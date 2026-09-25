export interface WidgetPeriodicTableCall {
  showInfoOrder: boolean;
  showInfoENeg: boolean;
  showInfoAMass: boolean;
  closeOnSelection: boolean;
  maxNumberOfSelections: number;
}

export interface WidgetMoleculeEditorCall {
  bondingType: 'VALENCE' | 'ELECTRONS';
}

/**
 * What an element hands the player when it calls its widget. The widget reads its settings from two
 * places, and a key sent to the wrong one is ignored without a word: `parameters` travel with the
 * call, `sharedParameters` are the ones the widget declares as shared. Which key belongs where is the
 * widget's decision (`…Param` and `…SharedParam` in verona-widgets-chemistry); `BONDING_TYPE` went
 * out as a parameter until #1420 and never reached the molecule editor.
 */
export interface WidgetCall<P, S> {
  parameters: P;
  sharedParameters: S;
}

export interface WidgetPeriodicTableParameters {
  showInfoOrder: boolean;
  showInfoName: boolean;
  showInfoSymbol: boolean;
  showInfoENeg: boolean;
  showInfoAMass: boolean;
  showInfoLabels: boolean;
  highlightBlocks: boolean;
  closeOnSelection: boolean;
  maxNumberOfSelections: number;
}

/**
 * The colours of the element fields; with `highlightBlocks` the background comes from the block. A
 * colour is left out when the field in the editor is empty: the widget falls back to its own default
 * only for a missing key, and an empty one leaves the fields in a colour nobody chose.
 */
export interface WidgetPeriodicTableSharedParameters {
  textColor?: string;
  backgroundColor?: string;
}

export type WidgetPeriodicTableCall =
  WidgetCall<WidgetPeriodicTableParameters, WidgetPeriodicTableSharedParameters>;

/** The molecule editor's element picker is a periodic table, and these three set it up. */
export interface WidgetMoleculeEditorParameters {
  showInfoName: boolean;
  showInfoOrder: boolean;
  highlightBlocks: boolean;
}

export interface WidgetMoleculeEditorSharedParameters {
  bondingType: 'VALENCE' | 'ELECTRONS';
}

export type WidgetMoleculeEditorCall =
  WidgetCall<WidgetMoleculeEditorParameters, WidgetMoleculeEditorSharedParameters>;

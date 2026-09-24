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
 * The colours of the element fields; with `highlightBlocks` the background comes from the block. Both
 * are always there, because the host keeps a shared value until it is overwritten: a colour left out
 * would show the one of the periodic table opened before. An empty field in the editor sends the
 * default instead, which is the widget's own fallback (#1420) -- an empty value the widget would take
 * as given and draw the fields in a colour nobody chose (#1475).
 */
export interface WidgetPeriodicTableSharedParameters {
  textColor: string;
  backgroundColor: string;
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

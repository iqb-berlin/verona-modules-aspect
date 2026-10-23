/**
 * How far a tetfolio element shrinks its experiment to fit the width it is given (#1598).
 *
 * tet.folio exports are laid out at a fixed size. Where the element is narrower than that, the
 * component lays the iframe out at the width the experiment needs and scales it down as a whole, so
 * the experiment stays uncut and usable: the browser maps pointer input through the transform, and
 * the experiment measures positions in its own document, which the transform does not reach.
 *
 * Only ever down, never up: where the experiment fits, it is shown as it always was. Down there is no
 * lower bound - a cut experiment would be the alternative, and tet.folio hides its horizontal
 * scrollbar (`::-webkit-scrollbar { height: 0 }`), so nothing would tell the test taker there is more.
 */
export class TetfolioScaling {
  /**
   * The scale for an experiment that needs `contentWidth` where `availableWidth` is given. 1 while
   * either is not known yet (0) - the iframe then fills the element, as before the first report.
   */
  static scaleFor(availableWidth: number, contentWidth: number): number {
    if (availableWidth <= 0 || contentWidth <= 0 || availableWidth >= contentWidth) return 1;
    return availableWidth / contentWidth;
  }
}

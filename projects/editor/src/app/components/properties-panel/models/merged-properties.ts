/**
 * A property set as the panel sees it for the current selection.
 *
 * `ElementPropertiesPanelComponent.createCombinedProperties()` merges the selected elements into one
 * object. Two things happen to every property in the process, and both are in the type:
 *
 * - it may be **absent**, because not all selected elements have it
 * - it may be **`null`**, because the elements have it but disagree on the value
 *
 * `null` is therefore not "no value" but "more than one value" — the state
 * {@link MergedCheckboxComponent} renders as indeterminate.
 *
 * Used as the input type of the panel's leaf components, in place of the untyped `UIElement` /
 * `CombinedProperties`. Those carry an index signature (`[index: string]: unknown`), which is why
 * every binding in the panel needed a `$any()` cast; with a concrete `T` the compiler checks the
 * property names again.
 */
export type Merged<T> = {
  [K in keyof T]?: T[K] | null;
};

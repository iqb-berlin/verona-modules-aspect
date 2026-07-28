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
 * The type is recursive for nested property groups and stops at arrays, because that is exactly what
 * the merge does: it recurses into `position`, `dimensions`, `styling` and the like, and sets a
 * diverging **array** to `null` rather than merging it element by element. Both are pinned down by
 * the tests on `createCombinedProperties()`.
 *
 * Used as the input type of the panel's leaf components, in place of the untyped `UIElement` /
 * `CombinedProperties`. Those carry an index signature (`[index: string]: unknown`), which is why
 * every binding in the panel needed a `$any()` cast; with a concrete `T` the compiler checks the
 * property names again.
 */
export type Merged<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[] ? T[K] | null
    : T[K] extends object ? Merged<T[K]> | null
      : T[K] | null;
};

/**
 * The declared keys of `T`, without the ones an index signature contributes.
 *
 * Needed because `DimensionProperties` carries `[index: string]: unknown`, which makes plain
 * `keyof` collapse to `string | number` — useless as a check on a property name. This keeps the
 * names that are actually declared, so they stay tied to the interface: rename a field there and
 * the panel stops compiling, which is the whole point of typing the write path.
 */
export type DeclaredKeys<T> = keyof {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
};

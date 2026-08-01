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
/*
 * `NonNullable` in both conditions, not `T[K]` directly: the four groups the merge recurses into are
 * all declared optional (`dimensions?: DimensionProperties`), and `DimensionProperties | undefined
 * extends object` is false. Without it every one of them fell through to `T[K] | null`, leaving its
 * leaves typed as if they could never be `null` — the exact opposite of what this type is for.
 */
export type Merged<T> = {
  [K in keyof T]?: NonNullable<T[K]> extends readonly unknown[] ? T[K] | null
    : NonNullable<T[K]> extends object ? Merged<NonNullable<T[K]>> | null
      : T[K] | null;
};

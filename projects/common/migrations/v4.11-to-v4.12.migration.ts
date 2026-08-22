/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable class-methods-use-this */
import { ELEMENT_DEFAULTS, ElementDefaultsEntry, GROUP_SECTIONS } from 'common/models/elements/element-registry';
import {
  AssertNever, DimensionProperties, PlayerProperties, PositionProperties, Stylings
} from 'common/models/elements/property-group-interfaces';
import { PageProperties } from 'common/models/page';
import { SectionProperties } from 'common/models/section';
import { Measurement, UIElementType } from 'common/models/ui-element-interfaces';
import { UnitTraversalMigration } from './unit-traversal-migration';

/** The members a properties interface declares as a plain number. */
type NumberMembers<T> = {
  [K in keyof T]-?: number extends NonNullable<T[K]> ? K : never
}[keyof T] & string;

/** The members it declares as a Measurement, or as a list of them. */
type MeasurementMembers<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends Measurement ? K : never
}[keyof T] & string;
type MeasurementListMembers<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends { value: number; unit: string }[] ? K : never
}[keyof T] & string;

/* The lists have to name every one of them, and both directions are checked: `satisfies` rejects a name
   the interface does not declare as such a member, and the assertions below name a member the list
   forgot. A hand-kept list is what this repo has been bitten by (#1177, #1187); here a forgotten name
   would leave one member unrepaired, silently. */
const SECTION_NUMBERS = ['height', 'visibilityDelay'] as const satisfies
readonly NumberMembers<SectionProperties>[];
const SECTION_MEASUREMENT_LISTS = ['gridColumnSizes', 'gridRowSizes'] as const satisfies
readonly MeasurementListMembers<SectionProperties>[];
const PAGE_NUMBERS = ['maxWidth', 'margin', 'alwaysVisibleAspectRatio'] as const satisfies
readonly NumberMembers<PageProperties>[];
const DIMENSION_NUMBERS = ['width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight'] as const satisfies
readonly NumberMembers<DimensionProperties>[];
const POSITION_NUMBERS = [
  'xPosition', 'yPosition', 'gridColumn', 'gridColumnRange', 'gridRow', 'gridRowRange', 'zIndex'
] as const satisfies readonly NumberMembers<PositionProperties>[];
const POSITION_MEASUREMENTS = ['marginLeft', 'marginRight', 'marginTop', 'marginBottom'] as const satisfies
readonly MeasurementMembers<PositionProperties>[];
const STYLING_NUMBERS = ['fontSize', 'borderWidth', 'borderRadius', 'lineHeight'] as const satisfies
readonly NumberMembers<Stylings>[];
const PLAYER_NUMBERS = [
  'defaultVolume', 'minVolume', 'hintDelay', 'minRuns', 'maxRuns', 'playbackTime'
] as const satisfies readonly NumberMembers<PlayerProperties>[];

export type SectionNumbersAreComplete =
  AssertNever<Exclude<NumberMembers<SectionProperties>, typeof SECTION_NUMBERS[number]>>;
export type SectionMeasurementsAreComplete =
  AssertNever<Exclude<MeasurementListMembers<SectionProperties>, typeof SECTION_MEASUREMENT_LISTS[number]>>;
export type PageNumbersAreComplete =
  AssertNever<Exclude<NumberMembers<PageProperties>, typeof PAGE_NUMBERS[number]>>;
export type DimensionNumbersAreComplete =
  AssertNever<Exclude<NumberMembers<DimensionProperties>, typeof DIMENSION_NUMBERS[number]>>;
export type PositionNumbersAreComplete =
  AssertNever<Exclude<NumberMembers<PositionProperties>, typeof POSITION_NUMBERS[number]>>;
export type PositionMeasurementsAreComplete =
  AssertNever<Exclude<MeasurementMembers<PositionProperties>, typeof POSITION_MEASUREMENTS[number]>>;
export type StylingNumbersAreComplete =
  AssertNever<Exclude<NumberMembers<Stylings>, typeof STYLING_NUMBERS[number]>>;
export type PlayerNumbersAreComplete =
  AssertNever<Exclude<NumberMembers<PlayerProperties>, typeof PLAYER_NUMBERS[number]>>;

/**
 * Numbers that were stored as strings become numbers.
 *
 * Measured over 15 units: `"400"` as the height of every section of ten 3.6.0 units, plus a `"250"`
 * expectedCharactersCount and a `"3"` firstColumnSizeRatio in two 4.10.0 units. The editor stopped
 * producing them -- its number fields emit a number through `aspectNumberField` -- but nothing removed
 * the ones already stored: the constructors take a stored value with an `undefined` check and no type
 * check, so the string survives every load and is written back on every save (#1306).
 *
 * Nothing was visibly wrong: every consumer either multiplies or builds a CSS value, and both put up
 * with a string. What made it worth a step is that the model now says otherwise -- since #1198 and
 * #1308 the normalizer answers with the typed interfaces, so `SectionProperties.height` is reachable
 * as a `number` without a cast and arithmetic on it compiles. `SectionComponent.getPageHeight` adds
 * section heights and answers `"0400"` for such a unit.
 *
 * Which members are numbers is not decided here by hand: the four lists above are checked against the
 * interfaces, and an element's own properties are decided by the type of their default in
 * `ELEMENT_DEFAULTS`. A value that is not a numeric string is left exactly as it is -- this repairs a
 * type, it does not guess a value.
 *
 * Reach: units below 4.12, which is all of the measured ones. A unit the beta editor already stamped
 * 4.12 is out of reach of this step, as `MigrationManager` explains -- and stays as it is, in line with
 * the decision not to repair beta data.
 */
export class Migration4m11To4m12 extends UnitTraversalMigration {
  fromVersion = '4.11';
  toVersion = '4.12.0';

  protected override migratePage(page: Record<string, unknown>): Record<string, unknown> {
    return Migration4m11To4m12.convert(super.migratePage(page), PAGE_NUMBERS);
  }

  /* The grid sizes are a list of Measurements, and their `value` is a number the model asks for and the
     stored unit rarely holds: `MigrationLegacy` builds them from `"1fr 178px"` by slicing the string,
     so it hands on `{ value: '1', unit: 'fr' }`. It runs before this step, which is what lets this one
     repair its output in the same pass. */
  protected override migrateSection(section: Record<string, unknown>): Record<string, unknown> {
    const migrated = Migration4m11To4m12.convert(super.migrateSection(section), SECTION_NUMBERS);
    SECTION_MEASUREMENT_LISTS.forEach(key => {
      const sizes = migrated[key];
      if (!Array.isArray(sizes)) return;
      migrated[key] = sizes.map(size => Migration4m11To4m12.convertGroup(size, ['value']));
    });
    return migrated;
  }

  /* Which own properties of an element are numbers is decided by the type of their default, so this
     needs no list of property names. Two limits come with that, and neither is silent:

     - a property whose default is `null` is not answered for by its default -- `maxLength`,
       `minLength` and `itemsPerRow` are `number | null` and stay as they are stored. None was found as
       a string in the units at hand, and a `null` default cannot tell a number apart from the other
       nullable things an element holds (`imgSrc`, `actionParam`).
     - a likert row of a unit old enough to spell its type `likert_row` is not in the table under that
       name. The alias is mapped below; a row stored with no type at all keeps its own numbers, and its
       dimensions and position are converted regardless. */
  protected override migrateElement(element: Record<string, unknown>): Record<string, unknown> {
    const storedType = element['type'] as string;
    const type = (storedType === 'likert_row' ? 'likert-row' : storedType) as UIElementType;
    const defaults = ELEMENT_DEFAULTS[type] as ElementDefaultsEntry | undefined ?? {};
    const ownNumbers = Object.entries(defaults)
      .filter(([key, value]) => !(GROUP_SECTIONS as readonly string[]).includes(key) && typeof value === 'number')
      .map(([key]) => key);
    const migrated = Migration4m11To4m12.convert(element, ownNumbers);
    /* Only where the group is stored: a step hands on what it was given, and writing `undefined` under
       a group an element never had would put the key into the unit. */
    if (migrated['dimensions'] !== undefined) {
      migrated['dimensions'] = Migration4m11To4m12.convertGroup(migrated['dimensions'], DIMENSION_NUMBERS);
    }
    if (migrated['styling'] !== undefined) {
      migrated['styling'] = Migration4m11To4m12.convertGroup(migrated['styling'], STYLING_NUMBERS);
    }
    if (migrated['player'] !== undefined) {
      migrated['player'] = Migration4m11To4m12.convertGroup(migrated['player'], PLAYER_NUMBERS);
    }
    if (migrated['position'] !== undefined) {
      migrated['position'] = Migration4m11To4m12.convertPosition(migrated['position']);
    }
    return migrated;
  }

  private static convertPosition(position: unknown): unknown {
    const converted = Migration4m11To4m12.convertGroup(position, POSITION_NUMBERS);
    if (typeof converted !== 'object' || converted === null) return converted;
    const margins = converted as Record<string, unknown>;
    POSITION_MEASUREMENTS.forEach(key => {
      if (margins[key] === undefined) return;
      margins[key] = Migration4m11To4m12.convertGroup(margins[key], ['value']);
    });
    return margins;
  }

  private static convertGroup(group: unknown, keys: readonly string[]): unknown {
    if (typeof group !== 'object' || group === null || Array.isArray(group)) return group;
    return Migration4m11To4m12.convert(group as Record<string, unknown>, keys);
  }

  /* A numeric string and nothing else: `''`, `'auto'` and `'12px'` stay, and so does a value that is
     already a number. `Number('')` is 0, which is why the emptiness is asked about separately. */
  private static convert(record: Record<string, unknown>, keys: readonly string[]): Record<string, unknown> {
    const converted = { ...record };
    keys.forEach(key => {
      const value = converted[key];
      if (typeof value !== 'string' || value.trim() === '') return;
      const asNumber = Number(value);
      if (Number.isFinite(asNumber)) converted[key] = asNumber;
    });
    return converted;
  }
}

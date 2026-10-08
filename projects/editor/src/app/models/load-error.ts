import { UIElement } from 'common/models/elements/element';
import { VariableInfoLocation } from 'editor/src/app/utils/variable-info-origins';

/**
 * Something the unit could not load -- what the player reports to the host as a runtime error, and what the editor,
 * which has no way to report it (verona-interfaces/editor#16), lists in its hints area instead (#1537).
 */
export interface LoadError {
  code: string;
  /** The technical text meant for the host, in English. Shown only as a detail. */
  message: string;
  /** The element that could not load, if any: GeoGebra failing to load concerns every geometry element at once. */
  elementId?: string;
}

/** A load error as the hints area lists it: with its element and where that sits, or neither for the whole unit. */
export interface LoadErrorHint {
  error: LoadError;
  element: UIElement | null;
  location: VariableInfoLocation | null;
  /** The translation key of what the author is told: what went wrong and what to do about it. */
  textKey: string;
}

import { Unit } from 'common/models/unit';
import { LoadError, LoadErrorHint } from 'editor/src/app/models/load-error';
import { ElementLocator } from 'editor/src/app/utils/element-locator';

/** Turns the load errors into what the hints area lists: each with its element, the way there and its text (#1537). */
export abstract class LoadErrorHints {
  /**
   * The codes the player reports that have a text of their own, the ones of studio-lite#1788. Any other code gets a
   * general one, and its technical message beneath says the rest.
   */
  static readonly EXPLAINED_CODES: readonly string[] = [
    'image-not-loading', 'media-timeout', 'media-duration-error', 'geometry-timeout', 'geogebra-not-loading'
  ];

  /**
   * The errors that concern the unit as it is now. One of an element the unit no longer holds is left out, and so is
   * one without an element while the unit has no geometry element -- GeoGebra is all that reports such an error, and
   * a unit without geometry does not miss it.
   */
  static resolve(unit: Unit, errors: LoadError[]): LoadErrorHint[] {
    const elements = unit.getAllElements();
    const hasGeometry = elements.some(element => element.type === 'geometry');
    return errors.flatMap((error): LoadErrorHint[] => {
      const textKey = LoadErrorHints.textKeyOf(error.code);
      if (error.elementId === undefined) {
        return hasGeometry ? [{
          error, element: null, location: null, textKey
        }] : [];
      }
      const element = elements.find(candidate => candidate.id === error.elementId);
      const location = element ? ElementLocator.locate(unit, element) : null;
      return element && location ? [{
        error, element, location, textKey
      }] : [];
    });
  }

  static textKeyOf(code: string): string {
    return LoadErrorHints.EXPLAINED_CODES.includes(code) ?
      `unitHints.loadErrors.code.${code}` :
      'unitHints.loadErrors.code.other';
  }
}

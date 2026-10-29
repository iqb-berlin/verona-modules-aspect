import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoadError } from 'editor/src/app/models/load-error';

/**
 * Collects what the unit could not load (#1537). The error handler reports here, the unit service clears on every
 * load, and the hints area reads it through the unit service, which knows which of the elements are still there.
 *
 * Without dependencies on purpose: the error handler is built at bootstrap and needs it, and nothing it would depend
 * on may in turn need the error handler.
 */
@Injectable({
  providedIn: 'root'
})
export class LoadErrorService {
  /**
   * Per element type, the property whose new value is loaded anew AND reports again if it fails: `img` fires `error`
   * for every source it is given. Writing it takes the element's errors back. Media and geometry are not here on
   * purpose: their timeout does not restart for a new file, so taking the entry back would give a file that still
   * fails a clean bill until the next load of the unit.
   */
  static readonly RELOADING_SOURCES: Readonly<Record<string, string>> = { image: 'src' };

  static reloadsOnWrite(elementType: string, property: string): boolean {
    return LoadErrorService.RELOADING_SOURCES[elementType] === property;
  }

  readonly errors = new BehaviorSubject<LoadError[]>([]);

  /**
   * Adds the error unless the same element has reported the same thing already, which it does each time it is built
   * again. Returns whether it was new.
   */
  report(error: LoadError): boolean {
    const known = this.errors.value
      .some(listed => listed.code === error.code && listed.elementId === error.elementId);
    if (known) return false;
    this.errors.next([...this.errors.value, error]);
    return true;
  }

  /**
   * Forgets the errors of every element, for a unit that is loaded anew. An error without an element stays: GeoGebra
   * is loaded once per application and not tried again, so a failed load holds for every unit that follows.
   */
  clearElementErrors(): void {
    this.replace(this.errors.value.filter(error => error.elementId === undefined));
  }

  /** Forgets the errors of one element, whose source has just been replaced. */
  clearErrorsOf(elementId: string): void {
    this.replace(this.errors.value.filter(error => error.elementId !== elementId));
  }

  private replace(errors: LoadError[]): void {
    if (errors.length !== this.errors.value.length) this.errors.next(errors);
  }
}

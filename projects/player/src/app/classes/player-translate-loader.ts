import { TranslateLoader } from '@ngx-translate/core';
import { from, merge, Observable } from 'rxjs';
import { reduce } from 'rxjs/operators';

/**
 * Loads the player's translations for a language from two files -- its own and the one in `common` --
 * and hands `ngx-translate` the two merged into one table.
 */
export class PlayerTranslateLoader implements TranslateLoader {
  /**
   * Emits once, when both files have arrived. A key that both files carry is decided by whichever
   * arrives last, which is not fixed: the two are imported in parallel. Keys are therefore to be kept
   * apart between the two files rather than deliberately overridden.
   */
  getTranslation = (lang: string): Observable<Record<string, string>> => merge(
    from(import(`../../assets/i18n/${lang}.json`)),
    from(import(`../../../../common/assets/i18n/${lang}.json`))
  ).pipe(
    reduce((
      merged: Record<string, string>,
      file: Record<string, string>
    ): Record<string, string> => ({ ...merged, ...file }), {})
  );
}

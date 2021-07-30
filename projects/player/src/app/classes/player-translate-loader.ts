import { TranslateLoader } from '@ngx-translate/core';
import { from, merge, Observable } from 'rxjs';
import { reduce } from 'rxjs/operators';

export class PlayerTranslateLoader implements TranslateLoader {
  getTranslation = (lang: string): Observable<Record<string, string>> => merge(
    from(import(`../../assets/i18n/${lang}.json`)),
    from(import(`../../../../common/assets/i18n/${lang}.json`))
  ).pipe(
    reduce((merged, entity) => ({ ...merged, ...entity }), {})
  );
}

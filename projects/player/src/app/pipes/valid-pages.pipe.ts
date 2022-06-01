import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Page } from 'common/models/page';

@Pipe({
  name: 'validPages'
})
export class ValidPagesPipe implements PipeTransform {

  constructor(private translateService: TranslateService) {}

  transform(pages: Page[]): Record<string, string> {
    return this.getValidPages(pages);
  }

  private getValidPages(pages: Page[]): Record<string, string> {
    return pages
      .filter((page: Page): boolean => !page.alwaysVisible)
      .reduce(
        (validPages: Record<string, string>, page: Page, index: number) => ({
          ...validPages,
          [index.toString(10)]: `${this.translateService.instant(
            'pageIndication', { index: index + 1 }
          )}`
        }), {}
      );
  }
}

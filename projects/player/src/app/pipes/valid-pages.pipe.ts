import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Page } from 'common/interfaces/unit';

@Pipe({
  name: 'validPages'
})
export class ValidPagesPipe implements PipeTransform {

  constructor(private translateService: TranslateService) {}

  transform(pages: Page[]): Record<string, string> {
    return this.getValidPages(pages);
  }

  private getValidPages(pages: Page[]): Record<string, string> {
    return pages.reduce(
      (validPages: Record<string, string>, page: Page, index: number) => ({
        ...validPages,
        [index.toString(10)]: `${this.translateService.instant(
          'pageIndication', { index: index + 1 }
        )}`
      }), {}
    );
  }
}

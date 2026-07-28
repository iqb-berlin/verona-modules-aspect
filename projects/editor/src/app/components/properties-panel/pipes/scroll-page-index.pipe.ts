import { Pipe, PipeTransform } from '@angular/core';
import { EditorPage } from 'editor/src/app/models/editor-page';

@Pipe({
  name: 'scrollPageIndex',
  standalone: false
})
export class ScrollPageIndexPipe implements PipeTransform {
  transform(pages: EditorPage[], index: number): number | null {
    if (pages.find((page: EditorPage): boolean => page.alwaysVisible)) {
      return index - 1;
    }
    return index;
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { ClozeMark } from 'common/models/elements/compound-group-elements/cloze/cloze';

@Pipe({
  name: 'markList',
  standalone: false
})
export class MarkListPipe implements PipeTransform {
  transform(markList: ClozeMark[] | undefined): string[] {
    return markList ? markList.map(mark => mark.type) : [];
  }
}

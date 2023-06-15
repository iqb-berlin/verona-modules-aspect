import { Pipe, PipeTransform } from '@angular/core';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';


import { TextImageLabel } from 'common/models/elements/label-interfaces';

@Pipe({
  name: 'LikertRowLabel'
})
export class LikertRowLabelPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(rows: LikertRowElement[]): TextImageLabel[] {
    return rows.map(row => row.rowLabel);
  }
}

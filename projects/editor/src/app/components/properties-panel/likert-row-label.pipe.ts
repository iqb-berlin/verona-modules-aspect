import { Pipe, PipeTransform } from '@angular/core';
import { LikertRowElement } from 'common/models/elements/compound-elements/likert/likert-row';

import { TextImageLabel } from 'common/interfaces';

@Pipe({
    name: 'LikertRowLabel',
    standalone: false
})
export class LikertRowLabelPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(rows: LikertRowElement[]): (TextImageLabel & { alias: string })[] {
    return rows.map(row => ({ ...row.rowLabel, alias: row.alias }));
  }
}

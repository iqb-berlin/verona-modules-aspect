import { Pipe, PipeTransform } from '@angular/core';
import { LikertRowElement } from 'common/models/elements/compound-group-elements/likert/likert-row';

import { TextImageLabel } from 'common/models/label-interfaces';

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

import { Pipe, PipeTransform } from '@angular/core';
import { UnitService } from 'editor/src/app/services/unit.service';

@Pipe({
  name: 'getValidDropLists',
  standalone: false
})
export class GetValidDropListsPipe implements PipeTransform {
  constructor(private unitService: UnitService) {}

  transform(idList: string[] | undefined): { id: string, alias: string }[] {
    if (!idList) return [];
    return this.unitService.getAllDropListElementIDs()
      .filter(dropListIDPair => !idList.includes(dropListIDPair.id));
  }
}

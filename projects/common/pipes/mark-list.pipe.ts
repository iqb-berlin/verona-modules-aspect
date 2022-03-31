import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'markList'
})
export class MarkListPipe implements PipeTransform {
  transform(markList: Record<string, any>): any[] {
    console.log('markList', markList);

    return markList ? markList.map((element: any) => element.type) : [];
  }
}

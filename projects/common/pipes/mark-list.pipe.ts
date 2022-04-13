import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'markList'
})
export class MarkListPipe implements PipeTransform {
  transform(markList: Record<string, any>): string[] {
    return markList ? markList.map((element: any) => element.type) : [];
  }
}

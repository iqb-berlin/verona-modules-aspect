import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'inputAssistanceCustomKeys',
    standalone: false
})
export class InputAssistanceCustomKeysPipe implements PipeTransform {
  transform(keys: unknown): string {
    return keys as string;
  }
}

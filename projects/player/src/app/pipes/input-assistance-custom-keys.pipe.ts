import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inputAssistanceCustomKeys'
})
export class InputAssistanceCustomKeysPipe implements PipeTransform {
  transform(keys: unknown): string {
    return keys as string;
  }
}

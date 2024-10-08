import {
  Injectable
} from '@angular/core';
import { Markable } from 'player/src/app/models/markable.interface';

@Injectable({
  providedIn: 'root'
})
export class MarkableService {
  markables: Markable[] = [];

  getMarkables(text: string): string[] {
    return [];
  }
}

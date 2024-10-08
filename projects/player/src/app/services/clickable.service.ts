import {
  Injectable
} from '@angular/core';
import { Clickable } from 'player/src/app/models/clickable-text-node.interface';

@Injectable({
  providedIn: 'root'
})
export class ClickableService {
  clickables: Clickable[] = [];

  getClickedWords(text: string): string[] {
    return [];
  }
}

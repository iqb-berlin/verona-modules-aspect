import {
  Injectable
} from '@angular/core';
import { Markable } from 'player/src/app/models/markable.interface';
import { TextElement } from 'common/models/elements/text/text';

@Injectable({
  providedIn: 'root'
})
export class MarkableService {
  markables: Markable[] = [];
  selectedColor = 'yellow'; // TODO

  getMarkedMarkables(): string[] {
    return this.markables
      .filter((markable: Markable) => markable.marked)
      .map((markable: Markable) => this.mapToTextSelectionFormat(markable));
  }

  private mapToTextSelectionFormat(markable: Markable): string {
    const color = TextElement.selectionColors[this.selectedColor];
    return `${markable.id}-${markable.id}-${color}`;
  }

  getWordById(id: number): Markable | undefined {
    return this.markables.find((markable: Markable) => markable.id === id);
  }

  reset(): void {
    this.markables = [];
  }
}

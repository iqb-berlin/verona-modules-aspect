import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TextElement } from 'common/models/elements/text';
import { MarkingPanelElement } from 'common/models/elements/marking-panel';
import { MarkingData } from 'common/models/marking-data';

@Component({
  selector: 'aspect-text-marking-bar',
  templateUrl: './text-marking-bar.component.html',
  styleUrls: ['./text-marking-bar.component.scss'],
  standalone: false
})
export class TextMarkingBarComponent {
  @Input() elementModel!: TextElement | MarkingPanelElement;
  @Input() sticky!: boolean;
  @Input() markingMode!: 'selection' | 'word' | 'range';
  @Output() markingDataChanged = new EventEmitter<MarkingData>();
  @Input() showHint!: boolean;
  @Input() selectedColor!: string;
  selectionColors: Record<string, string> = TextElement.selectionColors;

  changeMarkingData(selection: { isSelected: boolean, color: string, mode: 'mark' | 'delete' }): void {
    this.selectedColor = selection.isSelected ? this.getColorName(selection.color) : 'none';
    this.markingDataChanged
      .emit({
        active: selection.isSelected,
        mode: selection.mode,
        color: selection.color,
        colorName: selection.isSelected ? this.getColorName(selection.color) : 'none'
      });
  }

  getColorName(color: string): string {
    return Object.keys(this.selectionColors)
      .find(key => this.selectionColors[key] === color) || 'none';
  }
}

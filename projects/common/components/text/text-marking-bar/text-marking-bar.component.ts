import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TextElement } from 'common/models/elements/text/text';

@Component({
  selector: 'aspect-text-marking-bar',
  template: `
    <div class="marking-bar">
      <aspect-text-marking-button *ngIf="elementModel.highlightableYellow"
                                  [color]="selectionColors.yellow"
                                  [isMarkingSelected]="selectedColor === selectionColors.yellow"
                                  mode="mark"
                                  (selectedMarkingChanged)="changeMarkingData($event)">
      </aspect-text-marking-button>
      <aspect-text-marking-button *ngIf="elementModel.highlightableTurquoise"
                                  [color]="selectionColors.turquoise"
                                  [isMarkingSelected]="selectedColor === selectionColors.turquoise"
                                  mode="mark"
                                  (selectedMarkingChanged)="changeMarkingData($event)">
      </aspect-text-marking-button>
      <aspect-text-marking-button *ngIf="elementModel.highlightableOrange"
                                  [color]="selectionColors.orange"
                                  [isMarkingSelected]="selectedColor === selectionColors.orange"
                                  mode="mark"
                                  (selectedMarkingChanged)="changeMarkingData($event)">
      </aspect-text-marking-button>
      <aspect-text-marking-button *ngIf="elementModel.markingMode === 'default'"
                                  [color]="selectionColors.delete"
                                  [isMarkingSelected]="selectedColor === selectionColors.delete"
                                  mode="delete"
                                  (selectedMarkingChanged)="changeMarkingData($event)">
      </aspect-text-marking-button>
    </div>`,
  styles: [
    '.marking-bar {position: sticky; top: 0; margin-bottom: 13px;}'
  ]
})
export class TextMarkingBarComponent {
  @Input() elementModel!: TextElement;
  @Output() markingDataChanged = new EventEmitter<{
    active: boolean,
    mode: 'mark' | 'delete',
    color: string,
    colorName: string | undefined
  }>();

  selectedColor!: string;
  selectionColors: Record<string, string> = TextElement.selectionColors;

  changeMarkingData(selection: { isSelected: boolean, color: string, mode: 'mark' | 'delete' }): void {
    this.selectedColor = selection.isSelected ? selection.color : 'none';
    this.markingDataChanged
      .emit({
        active: selection.isSelected,
        mode: selection.mode,
        color: selection.color,
        colorName: selection.isSelected ?
          Object.keys(this.selectionColors).find(key => this.selectionColors[key] === selection.color) : 'none'
      });
  }
}

import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TextElement } from 'common/models/elements/text/text';
import { MarkingPanelElement } from 'common/models/elements/text/marking-panel';
import { MarkingData } from 'common/models/marking-data';

@Component({
  selector: 'aspect-text-marking-bar',
  template: `
    <div class="marking-bar"
         [class.sticky]="sticky">
      <aspect-text-marking-button *ngIf="elementModel.highlightableYellow"
                                  [color]="selectionColors.yellow"
                                  [isMarkingSelected]="selectionColors[selectedColor] === selectionColors.yellow"
                                  mode="mark"
                                  (selectedMarkingChanged)="changeMarkingData($event)">
      </aspect-text-marking-button>
      <aspect-text-marking-button *ngIf="elementModel.highlightableTurquoise"
                                  [color]="selectionColors.turquoise"
                                  [isMarkingSelected]="selectionColors[selectedColor] === selectionColors.turquoise"
                                  mode="mark"
                                  (selectedMarkingChanged)="changeMarkingData($event)">
      </aspect-text-marking-button>
      <aspect-text-marking-button *ngIf="elementModel.highlightableOrange"
                                  [color]="selectionColors.orange"
                                  [isMarkingSelected]="selectionColors[selectedColor] === selectionColors.orange"
                                  mode="mark"
                                  (selectedMarkingChanged)="changeMarkingData($event)">
      </aspect-text-marking-button>
      <aspect-text-marking-button *ngIf="hasDeleteButton"
                                  [color]="selectionColors.delete"
                                  [isMarkingSelected]="selectionColors[selectedColor] === selectionColors.delete"
                                  mode="delete"
                                  (selectedMarkingChanged)="changeMarkingData($event)">
      </aspect-text-marking-button>
    </div>`,
  styles: [
    '.sticky {position: sticky; top: 0;}',
    '.marking-bar {margin-bottom: 13px;}'
  ]
})
export class TextMarkingBarComponent {
  @Input() elementModel!: TextElement | MarkingPanelElement;
  @Input() sticky!: boolean;
  @Input() hasDeleteButton!: boolean;
  @Output() markingDataChanged = new EventEmitter<MarkingData>();

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

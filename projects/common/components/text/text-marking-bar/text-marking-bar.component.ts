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
                                  [markingMode]="markingMode"
                                  [isMarkingSelected]="selectionColors[selectedColor] === selectionColors.yellow"
                                  mode="mark"
                                  (selectedMarkingChanged)="changeMarkingData($event)">
      </aspect-text-marking-button>
      <aspect-text-marking-button *ngIf="elementModel.highlightableTurquoise"
                                  [color]="selectionColors.turquoise"
                                  [markingMode]="markingMode"
                                  [isMarkingSelected]="selectionColors[selectedColor] === selectionColors.turquoise"
                                  mode="mark"
                                  (selectedMarkingChanged)="changeMarkingData($event)">
      </aspect-text-marking-button>
      <aspect-text-marking-button *ngIf="elementModel.highlightableOrange"
                                  [color]="selectionColors.orange"
                                  [markingMode]="markingMode"
                                  [isMarkingSelected]="selectionColors[selectedColor] === selectionColors.orange"
                                  mode="mark"
                                  (selectedMarkingChanged)="changeMarkingData($event)">
      </aspect-text-marking-button>
      <aspect-text-marking-button *ngIf="markingMode !== 'word'"
                                  [color]="selectionColors.delete"
                                  [isMarkingSelected]="selectionColors[selectedColor] === selectionColors.delete"
                                  mode="delete"
                                  (selectedMarkingChanged)="changeMarkingData($event)">
      </aspect-text-marking-button>
      <span *ngIf="showHint"
            class="hint">{{'markingHint' | translate}}</span>
    </div>`,
  styles: `
    .sticky {
      position: sticky;
      top: 0;
    }
    .marking-bar {
      margin-bottom: 13px;
    }
    .hint {
      font-size: 16px;
      margin-left: 10px;
      color: #f44336;
      position: absolute;
      margin-top: 10px;
      background-color: white;
      padding: 5px;
    }`
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

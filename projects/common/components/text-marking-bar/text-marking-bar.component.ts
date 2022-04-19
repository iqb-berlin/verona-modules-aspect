import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TextElement } from '../../interfaces/elements';

@Component({
  selector: 'aspect-text-marking-bar',
  template: `
    <div class="marking-bar">
      <aspect-text-marking-button *ngIf="elementModel.highlightableYellow"
                             [color]="selectionColors.yellow"
                             [selected]="selectedColor === selectionColors.yellow"
                             mode="mark"
                             (selectedChanged)="onSelectionChange($event)">
      </aspect-text-marking-button>
      <aspect-text-marking-button *ngIf="elementModel.highlightableTurquoise"
                             [color]="selectionColors.turquoise"
                             [selected]="selectedColor === selectionColors.turquoise"
                             mode="mark"
                             (selectedChanged)="onSelectionChange($event)">
      </aspect-text-marking-button>
      <aspect-text-marking-button *ngIf="elementModel.highlightableOrange"
                             [color]="selectionColors.orange"
                             [selected]="selectedColor === selectionColors.orange"
                             mode="mark"
                             (selectedChanged)="onSelectionChange($event)">
      </aspect-text-marking-button>
      <aspect-text-marking-button [color]="selectionColors.delete"
                             [selected]="selectedColor === selectionColors.delete"
                             mode="delete"
                             (selectedChanged)="onSelectionChange($event)">
      </aspect-text-marking-button>
    </div>`,
  styles: [
    '.marking-bar {position: sticky; top: 0; margin-bottom: 13px;}'
  ]
})
export class TextMarkingBarComponent {
  @Input() elementModel!: TextElement;
  @Output() selectionChanged = new EventEmitter<{
    active: boolean,
    mode: 'mark' | 'delete',
    color: string,
    colorName: string | undefined
  }>();

  selectedColor!: string;
  selectionColors: Record<string, string> = {
    yellow: '#f9f871', turquoise: '#9de8eb', orange: '#ffa06a', delete: 'lightgrey'
  };

  onSelectionChange(selection: { selected: boolean, color: string, mode: 'mark' | 'delete' }): void {
    this.selectedColor = selection.selected ? selection.color : 'none';
    this.selectionChanged
      .emit({
        active: selection.selected,
        mode: selection.mode,
        color: selection.color,
        colorName: selection.selected ?
          Object.keys(this.selectionColors).find(key => this.selectionColors[key] === selection.color) : 'none'
      });
  }
}

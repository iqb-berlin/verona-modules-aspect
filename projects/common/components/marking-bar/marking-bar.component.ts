import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TextElement } from '../../ui-elements/text/text-element';

@Component({
  selector: 'app-marking-bar',
  template: `
    <div class="marking-bar">
      <app-marking-button *ngIf="elementModel.highlightableYellow"
                          [color]="'#f9f871'"
                          [selected]="selectedColor === '#f9f871'"
                          mode="mark"
                          (selectedChange)="onSelectionChange($event)">
      </app-marking-button>
      <app-marking-button *ngIf="elementModel.highlightableTurquoise"
                          [color]="'#9de8eb'"
                          [selected]="selectedColor === '#9de8eb'"
                          mode="mark"
                          (selectedChange)="onSelectionChange($event)">
      </app-marking-button>
      <app-marking-button *ngIf="elementModel.highlightableOrange"
                          [color]="'#ffa06a'"
                          [selected]="selectedColor === '#ffa06a'"
                          mode="mark"
                          (selectedChange)="onSelectionChange($event)">
      </app-marking-button>
      <app-marking-button [color]="'lightgrey'"
                          [selected]="selectedColor === 'lightgrey'"
                          mode="delete"
                          (selectedChange)="onSelectionChange($event)">
      </app-marking-button>
    </div>`,
  styles: [
    '.marking-bar {position: sticky; top: 0; margin-bottom: 13px;}'
  ]
})
export class MarkingBarComponent {
  @Input() element!: HTMLElement;
  @Input() elementModel!: TextElement;
  @Output() applySelection = new EventEmitter<{
    active: boolean,
    mode: 'mark' | 'delete',
    color: string,
    element: HTMLElement
  }>();

  selectedColor!: string;

  onSelectionChange(selection: { selected: boolean, color: string, mode: 'mark' | 'delete' }): void {
    this.selectedColor = selection.selected ? selection.color : 'none';
    this.applySelection
      .emit({
        active: selection.selected, mode: selection.mode, color: selection.color, element: this.element
      });
  }
}

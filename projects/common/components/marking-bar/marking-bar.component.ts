import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TextElement } from '../../ui-elements/text/text-element';

@Component({
  selector: 'app-marking-bar',
  template: `
    <div class="marking-bar">
      <button *ngIf="elementModel.highlightableYellow"
              type="button"
              class="marking-button"
              mat-mini-fab [style.background-color]="'#f9f871'"
              (click)="applySelection.emit({ mode: 'mark', color:'#f9f871', element })">
        <mat-icon>border_color</mat-icon>
      </button>
      <button *ngIf="elementModel.highlightableTurquoise"
              type="button"
              class="marking-button"
              mat-mini-fab [style.background-color]="'#9de8eb'"
              (click)="applySelection.emit({ mode: 'mark', color: '#9de8eb', element })">
        <mat-icon>border_color</mat-icon>
      </button>
      <button *ngIf="elementModel.highlightableOrange"
              type="button"
              class="marking-button"
              mat-mini-fab [style.background-color]="'#ffa06a'"
              (click)="applySelection.emit({ mode: 'mark', color: '#ffa06a', element })">
        <mat-icon>border_color</mat-icon>
      </button>
      <button type="button"
              class="marking-button" [style.background-color]="'lightgrey'" mat-mini-fab
              (click)="applySelection.emit({ mode: 'delete', color: 'none', element })">
        <mat-icon svgIcon="rubber-black"></mat-icon>
      </button>
    </div>`,
  styles: [
    '.marking-bar {position: sticky; top: 0; margin-bottom: 15px;}',
    '.marking-button {color: #333; margin-right: 5px;}'
  ]
})
export class MarkingBarComponent {
  @Input() element!: HTMLElement;
  @Input() elementModel!: TextElement;
  @Output() applySelection = new EventEmitter<{
    mode: 'mark' | 'underline' | 'delete',
    color: string,
    element: HTMLElement
  }>();
}

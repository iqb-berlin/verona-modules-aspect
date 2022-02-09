import {
  Component, EventEmitter, Input, Output
} from '@angular/core';

@Component({
  selector: 'aspect-marking-button',
  template: `
    <button type="button"
            class="marking-button"
            [class.selected]=selected
            mat-mini-fab
            [style.background-color]="color"
            (mousedown)="$event.stopPropagation();"
            (click)="selected = !selected; selectedChanged.emit({ selected, mode, color })">
      <mat-icon *ngIf="mode === 'mark'">border_color</mat-icon>
      <mat-icon *ngIf="mode === 'delete'" svgIcon="rubber-black"></mat-icon>
    </button>`,
  styles: [
    '.marking-button {color: #333; margin-left: 5px; margin-top: 2px}',
    '.selected {outline: 2px solid black}']
})
export class MarkingButtonComponent {
  @Input() selected!: boolean;
  @Input() color!: string;
  @Input() mode!: 'mark' | 'delete';
  @Input() element!: HTMLElement;
  @Output() selectedChanged = new EventEmitter<{
    selected: boolean,
    mode: 'mark' | 'delete',
    color: string,
  }>();
}

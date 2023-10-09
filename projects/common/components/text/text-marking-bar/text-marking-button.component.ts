import {
  Component, EventEmitter, Input, Output
} from '@angular/core';

@Component({
  selector: 'aspect-text-marking-button',
  template: `
    <button type="button"
            class="marking-button"
            [style.border-color]="isMarkingSelected ? 'black' : color"
            mat-mini-fab
            [style.background-color]="color"
            (pointerdown)="selectMarking()">
      <mat-icon *ngIf="mode === 'mark'"
                class="marking-icon">border_color
      </mat-icon>
      <span *ngIf="mode === 'delete'"
            class="marking-icon">
        <svg x="0px" y="0px" width="24px" height="24px" viewBox="0 0 360 360">
          <g>
            <g>
              <path d="M348.994,102.946L250.04,3.993c-5.323-5.323-13.954-5.324-19.277,0l-153.7,
                       153.701l118.23,118.23l153.701-153.7 C354.317,116.902,354.317,108.271,348.994,102.946z"/>
              <path d="M52.646,182.11l-41.64,41.64c-5.324,5.322-5.324,13.953,0,19.275l98.954,98.957c5.323,5.322,13.954,
                       5.32,19.277,0 l41.639-41.641L52.646,182.11z"/>
              <polygon points="150.133,360 341.767,360 341.767,331.949 182.806,331.949"/>
            </g>
          </g>
        </svg>
      </span>
    </button>`,
  styles: [
    '.marking-button {color: #333; margin-left: 5px; margin-top: 2px; border: 2px solid;}',
    '.marking-icon {margin-top: -4px}'
  ]
})
export class TextMarkingButtonComponent {
  @Input() isMarkingSelected!: boolean;
  @Input() color!: string;
  @Input() mode!: 'mark' | 'delete';
  @Input() element!: HTMLElement;
  @Output() selectedMarkingChanged = new EventEmitter<{
    isSelected: boolean,
    mode: 'mark' | 'delete',
    color: string,
  }>();

  selectMarking(): void {
    this.isMarkingSelected = !this.isMarkingSelected;
    this.selectedMarkingChanged.emit({ isSelected: this.isMarkingSelected, mode: this.mode, color: this.color });
  }
}

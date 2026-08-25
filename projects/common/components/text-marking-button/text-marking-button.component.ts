import {
  Component, EventEmitter, Input, Output
} from '@angular/core';

@Component({
  selector: 'aspect-text-marking-button',
  templateUrl: './text-marking-button.component.html',
  styleUrls: ['./text-marking-button.component.scss'],
  standalone: false
})
export class TextMarkingButtonComponent {
  @Input() isMarkingSelected!: boolean;
  @Input() color!: string;
  @Input() mode!: 'mark' | 'delete';
  @Input() markingMode!: 'selection' | 'word' | 'range';
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

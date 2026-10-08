import {
  Component, ElementRef, EventEmitter, Input, Output, ViewChild
} from '@angular/core';

/** An entry of the combo button's list: the value it emits, and the translation key it shows instead. */
export interface ComboButtonOption {
  value: string;
  label: string;
}

@Component({
  selector: 'aspect-combo-button',
  standalone: false,
  templateUrl: './combo-button.component.html',
  styleUrls: ['./combo-button.component.scss']
})
export class ComboButtonComponent {
  @Input() inputType!: 'color' | 'list';
  @Input() selectedValue!: string;
  @Input() availableValues: ComboButtonOption[] | undefined;
  /** A translation key; the button translates it itself. */
  @Input() tooltip!: string;
  @Input() icon!: string;
  @Input() isActive: boolean = false;
  @Output() applySelection = new EventEmitter<void>();
  @Output() selectionChanged = new EventEmitter<string>();

  @ViewChild('colorInput') colorInput!: ElementRef<HTMLInputElement>;

  selectValue(value: string) {
    this.selectionChanged.emit(value);
  }

  onClickSelect(event: MouseEvent) {
    if (this.inputType === 'color') {
      event.preventDefault();
      event.stopPropagation();
      this.colorInput.nativeElement.click();
    }
  }
}

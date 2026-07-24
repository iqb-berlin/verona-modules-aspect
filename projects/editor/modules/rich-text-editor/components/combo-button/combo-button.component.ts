import {
  Component, ElementRef, EventEmitter, Input, Output, ViewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgForOf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'aspect-combo-button',
  imports: [
    NgForOf,
    MatButtonModule,
    MatTooltipModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './combo-button.component.html',
  styleUrls: ['./combo-button.component.scss']
})
export class ComboButtonComponent {
  @Input() inputType!: 'color' | 'list';
  @Input() selectedValue!: string;
  @Input() availableValues: string[] | undefined;
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

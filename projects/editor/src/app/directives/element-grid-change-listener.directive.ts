import {
  Directive, EventEmitter, Input, OnChanges, Output
} from '@angular/core';

@Directive({
  selector: '[appElementGridChangeListener]',
  standalone: true
})
export class ElementGridChangeListenerDirective implements OnChanges {
  @Input() autoColumnSize!: boolean;
  @Input() gridColumn!: number | null;
  @Input() gridColumnRange!: number;
  @Input() gridRow!: number | null;
  @Input() gridRowRange!: number;

  @Output() elementChanged = new EventEmitter();

  ngOnChanges(): void {
    this.elementChanged.emit();
  }
}

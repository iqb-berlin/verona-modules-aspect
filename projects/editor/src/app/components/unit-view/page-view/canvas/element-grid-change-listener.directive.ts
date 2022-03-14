import {
  Directive, EventEmitter, Input, OnChanges, Output
} from '@angular/core';

@Directive({
  selector: '[appElementGridChangeListener]'
})
export class ElementGridChangeListenerDirective implements OnChanges {
  @Input() autoColumnSize!: boolean;
  @Input() gridColumn!: number;
  @Input() gridColumnRange!: number;
  @Input() gridRow!: number;
  @Input() gridRowRange!: number;

  @Output() elementChanged = new EventEmitter();

  ngOnChanges(): void {
    this.elementChanged.emit();
  }
}

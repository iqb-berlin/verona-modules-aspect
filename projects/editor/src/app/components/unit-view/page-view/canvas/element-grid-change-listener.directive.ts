import {
  Directive, EventEmitter, Input, OnChanges, Output
} from '@angular/core';

@Directive({
  selector: '[appElementGridChangeListener]'
})
export class ElementGridChangeListenerDirective implements OnChanges {
  @Input() autoColumnSize!: boolean;
  @Input() gridColumnStart!: number;
  @Input() gridColumnEnd!: number;
  @Input() gridRowStart!: number;
  @Input() gridRowEnd!: number;

  @Output() elementChanged = new EventEmitter();

  ngOnChanges(): void {
    this.elementChanged.emit();
  }
}

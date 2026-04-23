import {
  AfterViewInit,
  Directive, EventEmitter, Input, Output, QueryList
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ElementComponent } from './element-component.directive';

@Directive()
export abstract class CompoundElementComponent extends ElementComponent implements AfterViewInit {
  @Output() childrenAdded = new EventEmitter<ElementComponent[]>();
  @Input() parentForm!: UntypedFormGroup;
  abstract compoundChildren: QueryList<any>;

  ngAfterViewInit(): void {
    this.childrenAdded.emit(this.getFormElementChildrenComponents());
  }

  abstract getFormElementChildrenComponents(): ElementComponent[];
}

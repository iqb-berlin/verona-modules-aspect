import {
  AfterViewInit,
  Directive, EventEmitter, Output, QueryList
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ElementComponent } from './element-component.directive';
import { InputElement, ValueChangeElement } from '../models/uI-element';

@Directive({ selector: 'app-compound-element' })

export abstract class CompoundElementComponent extends ElementComponent implements AfterViewInit {
  @Output() childrenAdded = new EventEmitter<QueryList<ElementComponent>>();
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  compoundChildren!: QueryList<ElementComponent>;
  parentForm!: FormGroup;
  allowClickThrough = true;

  ngAfterViewInit(): void {
    this.childrenAdded.emit(this.compoundChildren);
  }

  abstract getFormElementModelChildren(): InputElement[];
}

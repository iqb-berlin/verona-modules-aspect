import {
  AfterViewInit,
  Directive, EventEmitter, Output, QueryList
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ElementComponent } from '../../element-component.directive';
import { InputElement, UIElement } from '../../models/uI-element';

@Directive({ selector: 'app-compound-element' })

export abstract class CompoundElementComponent extends ElementComponent implements AfterViewInit {
  @Output() childrenAdded = new EventEmitter<QueryList<ElementComponent>>();
  compoundChildren!: QueryList<ElementComponent>;
  parentForm!: FormGroup;

  ngAfterViewInit(): void {
    this.childrenAdded.emit(this.compoundChildren);
  }

  abstract getFormElementModelChildren(): InputElement[];
}

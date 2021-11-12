import {
  AfterViewInit,
  Directive, EventEmitter, Output, QueryList
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ElementComponent } from '../../element-component.directive';
import { InputElement, UIElement } from '../../models/uI-element';

@Directive({ selector: 'app-compound-element' })

export abstract class CompoundElementComponent implements AfterViewInit {
  @Output() childrenAdded = new EventEmitter<QueryList<ElementComponent>>();
  compoundChildren!: QueryList<ElementComponent>;
  parentForm!: FormGroup;
  abstract elementModel: UIElement;

  ngAfterViewInit(): void {
    this.childrenAdded.emit(this.compoundChildren);
  }

  abstract getFormElementModelChildren(): InputElement[];
}

import {
  AfterViewInit,
  Directive, EventEmitter, Output, QueryList
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ElementComponent } from './element-component.directive';
import { InputElement, ValueChangeElement } from '../models/uI-element';
import { CompoundChildOverlayComponent } from '../components/compound-child-overlay.component';
import { LikertRadioButtonGroupComponent } from '../ui-elements/likert/likert-radio-button-group.component';

@Directive()
export abstract class CompoundElementComponent extends ElementComponent implements AfterViewInit {
  @Output() childrenAdded = new EventEmitter<ElementComponent[]>();
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  compoundChildren!: QueryList<CompoundChildOverlayComponent | LikertRadioButtonGroupComponent>;
  parentForm!: FormGroup;

  ngAfterViewInit(): void {
    this.childrenAdded.emit(this.getFormElementChildrenComponents());
  }

  abstract getFormElementModelChildren(): InputElement[];
  abstract getFormElementChildrenComponents(): ElementComponent[];
}

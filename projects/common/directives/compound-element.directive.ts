import {
  AfterViewInit,
  Directive, EventEmitter, Output, QueryList
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ElementComponent } from './element-component.directive';
import { CompoundChildOverlayComponent } from '../components/compound-child-overlay.component';
import { LikertRadioButtonGroupComponent } from '../components/ui-elements/likert-radio-button-group.component';
import { InputElement, ValueChangeElement } from '../interfaces/elements';

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

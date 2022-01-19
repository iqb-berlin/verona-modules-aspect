import {
  AfterViewInit,
  Directive, EventEmitter, Output, QueryList
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ElementComponent } from './element-component.directive';
import { InputElement, ValueChangeElement } from '../models/uI-element';
import { CompoundChildOverlayComponent } from './cloze-child-overlay/compound-child-overlay.component';
import { LikertRadioButtonGroupComponent } from '../ui-elements/likert/likert-radio-button-group.component';

@Directive({ selector: 'app-compound-element' })

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

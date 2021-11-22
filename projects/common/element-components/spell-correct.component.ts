import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import { ElementComponent } from '../element-component.directive';
import { SliderElement } from '../models/slider-element';
import { FormElementComponent } from '../form-element-component.directive';
import {ValidatorFn, Validators} from "@angular/forms";
import {SpellCorrectElement} from "../models/spell-correct-element";
import {InputElementValue} from "../models/uI-element";
import {MatInput} from "@angular/material/input";

@Component({
  selector: 'app-spell-correct',
  template: `
    <div [style.display]="'flex'"
         [style.flex-direction]="'column'"
         [style.width.%]="100"
         [style.color]="elementModel.fontColor"
         [style.font-family]="elementModel.font"
         [style.font-size.px]="elementModel.fontSize"
         [style.font-weight]="elementModel.bold ? 'bold' : ''"
         [style.font-style]="elementModel.italic ? 'italic' : ''"
         appInputBackgroundColor [backgroundColor]="elementModel.backgroundColor"
         [style.height.%]="100">
        <input matInput type="text"
               [readonly]="elementModel.readOnly"
               [style.display]="'flex'"
               autocomplete="off"
               [formControl]="elementFormControl">
      <button mat-button
              [style.width.%]="100"
              [style.text-decoration-line]="strikethrough(elementFormControl.value) ? 'line-through' : ''"
              (click)="onClick($event)">
        {{elementModel.buttonLabel}}
      </button>
    </div>
  `,
  styles: [
    '::ng-deep app-spell-correct .small-input div.mat-form-field-infix {border-top: none; padding: 0.75em 0 0.25em 0;}'
  ]
})
export class SpellCorrectComponent extends FormElementComponent {
  elementModel!: SpellCorrectElement;
  @ViewChild(MatInput) inputElement!: MatInput;

  public strikethrough(value: InputElementValue): boolean {
    if (value === null) return false;
    if (value === undefined) return false;
    if (typeof value !== "string") return false;
    return value.length > 0;
  }

  onClick(event: MouseEvent) : void {
    if (this.strikethrough(this.elementFormControl.value)) {
      this.elementFormControl.setValue('');
    } else {
      this.elementFormControl.setValue(this.elementModel.buttonLabel);
      console.log(this.inputElement);
      console.log(typeof this.inputElement);
      this.inputElement.focus();
    }
    event.preventDefault();
    event.stopPropagation();
  }
}

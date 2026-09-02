import { EventEmitter, Injectable, Output } from '@angular/core';
import { TextInputComponentType } from 'player/src/app/models/text-input-component.type';
import { MathTableComponent } from 'common/components/elements/math-table/math-table.component';
import { InputAssistancePreset } from 'common/models/input-element-interfaces';
import {
  TextAreaMathComponent
} from 'common/components/elements/text-area-math/text-area-math.component';
import { MathFieldComponent } from 'common/components/elements/math-field/math-field.component';

/**
 * What both input aids have in common: which element is being typed into, which key set is shown, and
 * whether the aid is open. `KeyboardService` is the on-screen keyboard, `KeypadService` the smaller
 * key row beside a field.
 *
 * The keys themselves are not pressed here -- the aid emits `select`, `deleteCharacters` and `enterKey`,
 * and the element that registered itself decides what that means for its value.
 */
@Injectable({
  providedIn: 'root'
})
export abstract class InputService {
  preset: InputAssistancePreset = null;
  elementComponent!: TextInputComponentType | MathTableComponent | TextAreaMathComponent | MathFieldComponent;
  inputElement!: HTMLTextAreaElement | HTMLInputElement | HTMLElement;
  isOpen: boolean = false;

  @Output() enterKey = new EventEmitter<string>();
  @Output() deleteCharacters = new EventEmitter<boolean>();
  @Output() select = new EventEmitter<string>();
  @Output() willToggle = new EventEmitter<boolean>();

  /** Points the aid at the field being typed into. The two are held until the next call -- closing the
      aid does not clear them. */
  setCurrentKeyInputElement(
    focusedElement: HTMLElement,
    elementComponent: TextInputComponentType | MathTableComponent | TextAreaMathComponent | MathFieldComponent
  ): void {
    this.inputElement = focusedElement;
    this.elementComponent = elementComponent;
  }

  close(): void {
    this.isOpen = false;
  }
}

import { EventEmitter, Injectable, Output } from '@angular/core';
import { TextInputComponentType } from 'player/src/app/models/text-input-component.type';
import { MathTableComponent } from 'common/components/input-elements/math-table.component';
import { InputAssistancePreset } from 'common/interfaces';
import { TextAreaMathComponent } from 'common/components/input-elements/text-area-math/text-area-math.component';

@Injectable({
  providedIn: 'root'
})
export abstract class InputService {
  preset: InputAssistancePreset = null;
  elementComponent!: TextInputComponentType | MathTableComponent | TextAreaMathComponent;
  inputElement!: HTMLTextAreaElement | HTMLInputElement | HTMLElement;
  isOpen: boolean = false;

  @Output() enterKey = new EventEmitter<string>();
  @Output() deleteCharacters = new EventEmitter<boolean>();
  @Output() select = new EventEmitter<string>();
  @Output() willToggle = new EventEmitter<boolean>();

  setCurrentKeyInputElement(
    focusedElement: HTMLElement,
    elementComponent: TextInputComponentType | MathTableComponent | TextAreaMathComponent
  ): void {
    this.inputElement = focusedElement;
    this.elementComponent = elementComponent;
  }

  close(): void {
    this.isOpen = false;
  }
}

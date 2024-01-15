import { InputAssistancePreset } from 'common/models/elements/element';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { TextInputComponentType } from 'player/src/app/models/text-input-component.type';
import { MathTableComponent } from 'common/components/input-elements/math-table.component';

@Injectable({
  providedIn: 'root'
})
export abstract class InputService {
  preset: InputAssistancePreset = null;
  elementComponent!: TextInputComponentType | MathTableComponent;
  inputElement!: HTMLTextAreaElement | HTMLInputElement | HTMLElement;
  isOpen: boolean = false;

  @Output() enterKey = new EventEmitter<string>();
  @Output() deleteCharacters = new EventEmitter<boolean>();
  @Output() select = new EventEmitter<string>();
  @Output() willToggle = new EventEmitter<boolean>();

  setCurrentKeyInputElement(
    focusedElement: HTMLElement,
    elementComponent: TextInputComponentType | MathTableComponent
  ): void {
    this.inputElement = focusedElement;
    this.elementComponent = elementComponent;
  }

  close(): void {
    this.isOpen = false;
  }
}

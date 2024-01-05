import { InputAssistancePreset } from 'common/models/elements/element';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { TextInputComponentType } from 'player/src/app/models/text-input-component.type';

@Injectable({
  providedIn: 'root'
})
export abstract class InputService {
  preset: InputAssistancePreset = null;
  elementComponent!: TextInputComponentType;
  inputElement!: HTMLTextAreaElement | HTMLInputElement;
  isOpen: boolean = false;

  @Output() enterKey = new EventEmitter<string>();
  @Output() deleteCharacters = new EventEmitter<boolean>();
  @Output() select = new EventEmitter<string>();

  setCurrentKeyInputElement(
    focusedElement: HTMLElement,
    elementComponent: TextInputComponentType
  ): void {
    this.inputElement = elementComponent.elementModel.type === 'text-area' ?
      focusedElement as HTMLTextAreaElement :
      focusedElement as HTMLInputElement;
    this.elementComponent = elementComponent;
  }

  close(): void {
    this.isOpen = false;
  }
}

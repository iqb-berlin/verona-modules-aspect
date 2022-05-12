import { Injectable } from '@angular/core';
import { TextFieldComponent } from 'common/components/input-elements/text-field.component';
import { TextAreaComponent } from 'common/components/input-elements/text-area.component';
import { InputService } from '../classes/input-service';
import { SpellCorrectComponent } from 'common/components/input-elements/spell-correct.component';
import { TextFieldSimpleComponent } from 'common/components/compound-elements/cloze/cloze-child-elements/text-field-simple.component';
import { InputAssistancePreset } from 'common/models/elements/element';

@Injectable({
  providedIn: 'root'
})
export class KeypadService extends InputService {
  preset: InputAssistancePreset = null;
  position: 'floating' | 'right' = 'floating';

  toggle(focusedElement: HTMLElement | null,
         elementComponent: TextAreaComponent | TextFieldComponent | TextFieldSimpleComponent | SpellCorrectComponent):
    boolean {
    if (focusedElement) {
      this.preset = elementComponent.elementModel.inputAssistancePreset;
      this.position = elementComponent.elementModel.inputAssistancePosition;
      this.isOpen = this.open(focusedElement, elementComponent);
    } else {
      this.isOpen = false;
    }
    return this.isOpen;
  }
}

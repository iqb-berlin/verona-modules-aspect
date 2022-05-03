import { Injectable } from '@angular/core';
import { TextFieldComponent } from 'common/components/ui-elements/text-field.component';
import { TextAreaComponent } from 'common/components/ui-elements/text-area.component';
import { InputAssistancePreset } from 'common/interfaces/elements';
import { InputService } from '../classes/input-service';
import { SpellCorrectComponent } from 'common/components/ui-elements/spell-correct.component';
import { TextFieldSimpleComponent } from 'common/components/ui-elements/text-field-simple.component';

@Injectable({
  providedIn: 'root'
})
export class KeypadService extends InputService {
  preset: InputAssistancePreset = 'none';
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

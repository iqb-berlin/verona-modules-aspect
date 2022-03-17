import { Injectable } from '@angular/core';
import { TextFieldComponent } from '../../../../common/components/ui-elements/text-field.component';
import { TextAreaComponent } from '../../../../common/components/ui-elements/text-area.component';
import { InputAssistancePreset, TextFieldElement } from '../../../../common/interfaces/elements';
import { InputService } from '../classes/input-service';

@Injectable({
  providedIn: 'root'
})
export class KeypadService extends InputService {
  preset!: InputAssistancePreset;
  position!: 'floating' | 'right';

  toggle(focussedElement: HTMLElement | null,
         elementComponent: TextAreaComponent | TextFieldComponent): boolean {
    if (focussedElement) {
      this.preset = (elementComponent.elementModel as TextFieldElement).inputAssistancePreset;
      this.position = (elementComponent.elementModel as TextFieldElement).inputAssistancePosition;
      this.isOpen = this.open(focussedElement, elementComponent);
    } else {
      this.isOpen = false;
    }
    return this.isOpen;
  }
}

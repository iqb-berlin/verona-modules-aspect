import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { KeyboardService } from '../../services/keyboard.service';
import { TextAreaElement, TextFieldElement, UIElement } from '../../../../../common/interfaces/elements';
import { TextFieldComponent } from '../../../../../common/components/ui-elements/text-field.component';
import { TextAreaComponent } from '../../../../../common/components/ui-elements/text-area.component';

@Component({
  selector: 'aspect-element-text-input-group',
  templateUrl: './element-text-input-group.component.html',
  styleUrls: ['./element-text-input-group.component.scss']
})
export class ElementTextInputGroupComponent implements OnInit {
  @Input() elementModel!: UIElement;

  form!: FormGroup;
  isKeyboardOpen!: boolean;
  TextAreaElement!: TextAreaElement;
  TextFieldElement!: TextFieldElement;

  constructor(public keyboardService: KeyboardService) {}

  ngOnInit(): void {
    this.form = new FormGroup({});
  }

  onFocusChanged(focussedElement: HTMLElement | null, elementComponent: TextAreaComponent | TextFieldComponent) {
    if (focussedElement) {
      const focussedInputElement = this.elementModel.type === 'text-area' ?
        focussedElement as HTMLTextAreaElement :
        focussedElement as HTMLInputElement;
      const preset = (this.elementModel as TextFieldElement).inputAssistancePreset;
      const position = (this.elementModel as TextFieldElement).inputAssistancePosition;
      this.isKeyboardOpen = this.keyboardService
        .openKeyboard(focussedInputElement, preset, position, elementComponent);
    } else {
      this.isKeyboardOpen = this.keyboardService.closeKeyboard();
    }
  }
}

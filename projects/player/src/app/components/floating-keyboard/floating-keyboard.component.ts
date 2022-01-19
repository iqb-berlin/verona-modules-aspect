import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { InputAssistancePreset } from '../../../../../common/models/uI-element';

@Component({
  selector: 'app-floating-keyboard',
  templateUrl: './floating-keyboard.component.html',
  styleUrls: ['./floating-keyboard.component.scss']
})
export class FloatingKeyboardComponent {
  @Input() preset!: InputAssistancePreset;
  @Input() position!: 'floating' | 'right';
  @Input() inputElement!: HTMLTextAreaElement | HTMLInputElement;
  @Input() positionOffset!: number;
  @Input() isKeyboardOpen!: boolean;

  @Input() overlayOrigin!: CdkOverlayOrigin;
  @Output() deleteCharacter = new EventEmitter();
  @Output() enterKey = new EventEmitter<string>();
}

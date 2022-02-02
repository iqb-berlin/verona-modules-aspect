import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { InputAssistancePreset } from '../../../../../common/models/uI-element';

@Component({
  selector: 'app-key',
  templateUrl: './key.component.html',
  styleUrls: ['./key.component.css']
})
export class KeyComponent {
  @Input() key!: string;
  @Input() oval!: boolean;
  @Input() position!: 'floating' | 'right';
  @Input() last!: boolean;
  @Input() preset!: InputAssistancePreset;

  @Output() enterKey = new EventEmitter<string>();
}

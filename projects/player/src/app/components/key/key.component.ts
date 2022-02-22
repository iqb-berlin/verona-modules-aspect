import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { InputAssistancePreset } from '../../../../../common/interfaces/elements';

@Component({
  selector: 'aspect-key',
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

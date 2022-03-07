import {
  Component, Input
} from '@angular/core';
import { KeyboardService } from '../../services/keyboard.service';

@Component({
  selector: 'aspect-floating-keyboard',
  templateUrl: './floating-keyboard.component.html',
  styleUrls: ['./floating-keyboard.component.scss']
})
export class FloatingKeyboardComponent {
  @Input() isKeyboardOpen!: boolean;

  constructor(public keyboardService: KeyboardService) {}
}

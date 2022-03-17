import {
  Component, Input
} from '@angular/core';
import { KeypadService } from '../../services/keypad.service';

@Component({
  selector: 'aspect-floating-keypad',
  templateUrl: './floating-keypad.component.html',
  styleUrls: ['./floating-keypad.component.scss']
})
export class FloatingKeypadComponent {
  @Input() isKeypadOpen!: boolean;

  constructor(
    public keypadService: KeypadService
  ) {}
}

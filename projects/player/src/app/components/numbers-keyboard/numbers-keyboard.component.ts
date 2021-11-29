import { Component, Input } from '@angular/core';
import { KeyboardService } from '../../services/keyboard.service';

@Component({
  selector: 'app-numbers-keyboard',
  templateUrl: './numbers-keyboard.component.html',
  styleUrls: ['./numbers-keyboard.component.css']
})
export class NumbersKeyboardComponent {
  @Input() operators!: boolean;

  constructor(public keyboardService: KeyboardService) {}
}

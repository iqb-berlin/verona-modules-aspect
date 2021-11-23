import { Component, Input } from '@angular/core';
import { KeyboardService } from '../../services/keyboard.service';

@Component({
  selector: 'app-key',
  templateUrl: './key.component.html',
  styleUrls: ['./key.component.css']
})
export class KeyComponent {
  @Input() key!: string;
  @Input() big!: boolean;

  constructor(public keyboardService: KeyboardService) { }
}

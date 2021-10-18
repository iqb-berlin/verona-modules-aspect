import { Component, Input } from '@angular/core';
import { KeyboardService } from '../../services/keyboard.service';

@Component({
  selector: 'app-key',
  templateUrl: './key.component.html',
  styleUrls: ['./key.component.css']
})
export class KeyComponent {
  @Input() key!: string;

  constructor(public keyboardService: KeyboardService) { }

  onMouseDown(event: MouseEvent): void {
    this.keyboardService.enterKey(this.key);
    event.preventDefault();
    event.stopPropagation();
  }
}

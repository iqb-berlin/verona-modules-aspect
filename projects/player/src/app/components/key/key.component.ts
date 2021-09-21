import { Component, Input } from '@angular/core';
import { SpecialCharacterService } from '../../services/special-character.service';

@Component({
  selector: 'app-key',
  templateUrl: './key.component.html',
  styleUrls: ['./key.component.css']
})
export class KeyComponent {
  @Input() character!: string;

  constructor(private specialCharacterService: SpecialCharacterService) { }

  onMouseDown(event: MouseEvent): void {
    this.specialCharacterService.inputCharacter(this.character);
    event.preventDefault();
  }
}

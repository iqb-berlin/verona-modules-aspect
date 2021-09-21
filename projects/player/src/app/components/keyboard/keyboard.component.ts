import { Component, OnInit } from '@angular/core';
import { SpecialCharacterService } from '../../services/special-character.service';

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.css']
})
export class KeyboardComponent implements OnInit {
  upperCharacters!: string[];
  lowerCharacters!: string[];

  constructor(private specialCharacterService: SpecialCharacterService) { }

  ngOnInit(): void {
    this.upperCharacters = this.specialCharacterService.upperCharacters;
    this.lowerCharacters = this.specialCharacterService.lowerCharacters;
  }
}

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-french-keyboard',
  templateUrl: './french-keyboard.component.html',
  styleUrls: ['./french-keyboard.component.css']
})
export class FrenchKeyboardComponent implements OnInit {
  rows!: string[][];
  lowerCharacters!: boolean;
  private readonly upperCharacterRows: string[][] = [
    ['Â', 'À', 'Æ', 'Ê', 'È', 'É', 'Ë', 'Î'],
    ['Ï', 'Ô', 'Ò', 'Œ', 'Û', 'Ù', 'Ü', 'Ç']
  ];

  private readonly lowerCharacterRows: string[][] = [
    ['â', 'à', 'æ', 'ê', 'è', 'é', 'ë', 'î'],
    ['ï', 'ô', 'ò', 'œ', 'û', 'ù', 'ü', 'ç']
  ];

  ngOnInit(): void {
    this.rows = this.lowerCharacterRows;
    this.lowerCharacters = true;
  }

  toggleCharacterCase(event: MouseEvent): void {
    this.lowerCharacters = !this.lowerCharacters;
    if (this.lowerCharacters) {
      this.rows = this.lowerCharacterRows;
    } else {
      this.rows = this.upperCharacterRows;
    }
    event.preventDefault();
  }
}

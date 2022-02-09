import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';

@Component({
  selector: 'aspect-french-keyboard',
  templateUrl: './french-keyboard.component.html',
  styleUrls: ['./french-keyboard.component.css']
})
export class FrenchKeyboardComponent implements OnInit {
  @Input() position!: 'floating' | 'right';
  @Output() enterKey = new EventEmitter<string>();

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

  toggleCharacterCase(): void {
    this.lowerCharacters = !this.lowerCharacters;
    if (this.lowerCharacters) {
      this.rows = this.lowerCharacterRows;
    } else {
      this.rows = this.upperCharacterRows;
    }
  }
}

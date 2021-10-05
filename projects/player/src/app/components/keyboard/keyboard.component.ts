import { Component, OnInit } from '@angular/core';
import { KeyboardService } from '../../services/keyboard.service';

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.css']
})
export class KeyboardComponent implements OnInit {
  rows!: string[][];

  constructor(public keyboardService: KeyboardService) { }

  ngOnInit(): void {
    this.rows = this.keyboardService.rows;
  }

  onMouseDown = (event: MouseEvent): void => {
    event.preventDefault();
  };
}

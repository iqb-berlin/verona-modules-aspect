import {
  Component, EventEmitter, Input, Output
} from '@angular/core';

@Component({
  selector: 'app-key',
  templateUrl: './key.component.html',
  styleUrls: ['./key.component.css']
})
export class KeyComponent {
  @Input() key!: string;
  @Input() big!: boolean;
  @Input() position!: 'floating' | 'right';
  @Input() last!: boolean;

  @Output() enterKey = new EventEmitter<string>();
}

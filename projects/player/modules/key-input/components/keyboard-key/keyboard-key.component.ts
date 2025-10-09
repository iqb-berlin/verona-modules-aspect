import {
  Component, EventEmitter, Input, Output
} from '@angular/core';

@Component({
    selector: 'aspect-keyboard-key',
    templateUrl: './keyboard-key.component.html',
    styleUrls: ['./keyboard-key.component.scss'],
    standalone: false
})
export class KeyboardKeyComponent {
  @Input() alternativeKey!: string | null;
  @Input() key!: string;
  @Output() keyClicked = new EventEmitter<string>();
}

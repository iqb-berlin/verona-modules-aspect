import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { TextElement } from 'common/models/elements/text/text';

@Component({
  selector: 'aspect-markable-word',
  standalone: true,
  imports: [],
  templateUrl: './markable-word.component.html',
  styleUrl: './markable-word.component.scss'
})
export class MarkableWordComponent {
  @Input() text = '';
  @Input() color!: string | null;
  @Input() markColor!: string | undefined;
  @Output() colorChange = new EventEmitter<string | null>();

  toggleMarked(): void {
    if (!this.markColor || this.markColor === 'none') {
      return;
    }
    if (this.color && this.color === TextElement.selectionColors[this.markColor]) {
      this.color = null;
    } else {
      this.color = TextElement.selectionColors[this.markColor];
    }
    this.colorChange.emit(this.color);
  }
}

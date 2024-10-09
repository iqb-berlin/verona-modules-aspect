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
  @Input() marked!: boolean;
  @Output() markedChange = new EventEmitter<boolean>();

  selectionColors: Record<string, string> = TextElement.selectionColors;

  toggleMarked(): void {
    this.marked = !this.marked;
    this.markedChange.emit(this.marked);
  }
}

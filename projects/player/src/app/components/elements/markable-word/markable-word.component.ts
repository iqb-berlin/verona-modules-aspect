import { Component, Input } from '@angular/core';

@Component({
  selector: 'aspect-markable-word',
  standalone: true,
  imports: [],
  templateUrl: './markable-word.component.html',
  styleUrl: './markable-word.component.scss'
})
export class MarkableWordComponent {
  @Input() text = '';
}

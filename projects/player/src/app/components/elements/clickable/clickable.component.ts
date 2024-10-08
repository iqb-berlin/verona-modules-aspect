import { Component, Input } from '@angular/core';

@Component({
  selector: 'aspect-clickable',
  standalone: true,
  imports: [],
  templateUrl: './clickable.component.html',
  styleUrl: './clickable.component.scss'
})
export class ClickableComponent {
  @Input() text = '';
}

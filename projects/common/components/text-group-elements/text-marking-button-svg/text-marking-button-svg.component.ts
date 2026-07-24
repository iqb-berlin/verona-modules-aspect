import { Component, Input } from '@angular/core';

@Component({
  selector: 'aspect-text-marking-button-svg',
  imports: [],
  templateUrl: './text-marking-button-svg.component.html'
})
export class TextMarkingButtonSvgComponent {
  @Input() buttonType!: 'selection' | 'word' | 'range' | 'delete';
}

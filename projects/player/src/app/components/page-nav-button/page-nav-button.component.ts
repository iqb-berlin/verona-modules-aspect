import {
  Component, EventEmitter, Input, Output
} from '@angular/core';

@Component({
  selector: 'aspect-page-nav-button',
  templateUrl: './page-nav-button.component.html',
  styleUrls: ['./page-nav-button.component.scss']
})
export class PageNavButtonComponent {
  @Input() direction!: 'previous' | 'next';
  @Output() clicked: EventEmitter<string> = new EventEmitter<string>();
}

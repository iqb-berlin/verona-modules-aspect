import { Component, Input } from '@angular/core';

@Component({
  selector: 'aspect-markable-delimiter',
  standalone: true,
  imports: [],
  templateUrl: './markable-delimiter.component.html',
  styleUrl: './markable-delimiter.component.scss'
})
export class MarkableDelimiterComponent {
  @Input() color!: string | null;
  @Input() text!: string;
  @Input() neighbourColor!: string | null;
}

import { Component, Input } from '@angular/core';

@Component({
  selector: 'character-icon',
  templateUrl: './character-icon.component.html',
  styleUrls: ['./character-icon.component.scss'],
  host: {
  '[style.font-size.px]': 'size',
  '[style.line-height.px]': 'size',
  '[style.width.px]': 'size',
  '[style.height.px]': 'size'
  },
})
export class CharacterIconComponent {
  @Input() size: number = 24;
}

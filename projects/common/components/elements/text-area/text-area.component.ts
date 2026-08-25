import { Component, Input } from '@angular/core';
import { TextAreaElement } from 'common/models/elements/text-area';
import { TextInputComponent } from 'common/directives/text-input-component.directive';

@Component({
  selector: 'aspect-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss'],
  standalone: false
})
export class TextAreaComponent extends TextInputComponent {
  @Input() elementModel!: TextAreaElement;
  dynamicRows: number = 0;
  @Input() tableMode: boolean = false;
}

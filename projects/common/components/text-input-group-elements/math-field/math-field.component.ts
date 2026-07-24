import { Component, Input } from '@angular/core';
import { MathFieldElement } from 'common/models/elements/input-elements/math-field';
import { TextInputComponent } from 'common/directives/text-input-component.directive';

@Component({
  selector: 'aspect-math-field',
  templateUrl: './math-field.component.html',
  styleUrls: ['./math-field.component.scss'],
  standalone: false
})
export class MathFieldComponent extends TextInputComponent {
  @Input() elementModel!: MathFieldElement;
}

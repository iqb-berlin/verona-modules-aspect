import {
  Component, Input, ViewChild
} from '@angular/core';
import { MatInput } from '@angular/material/input';
import { SpellCorrectElement } from 'common/models/elements/input-elements/spell-correct';
import { TextInputComponent } from 'common/directives/text-input-component.directive';

@Component({
  selector: 'aspect-spell-correct',
  templateUrl: './spell-correct.component.html',
  styleUrls: ['./spell-correct.component.scss'],
  standalone: false
})
export class SpellCorrectComponent extends TextInputComponent {
  @Input() elementModel!: SpellCorrectElement;
  @ViewChild(MatInput) inputElement!: MatInput;
}

import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MathFieldProperties } from 'common/models/elements/text-input-group-elements/math-field';
import { Merged } from 'editor/src/app/components/properties-panel/models/merged-properties';

@Component({
  selector: 'aspect-math-field-props',
  standalone: false,
  templateUrl: './math-field-props.component.html'
})
export class MathFieldPropsComponent {
  @Input() combinedProperties!: Merged<MathFieldProperties>;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: boolean, isInputValid?: boolean | null }>();
}

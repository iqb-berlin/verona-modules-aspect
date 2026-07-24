import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel/element-properties-panel.component';

@Component({
  selector: 'aspect-math-field-props',
  standalone: false,
  templateUrl: './math-field-props.component.html'
})
export class MathFieldPropsComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: boolean, isInputValid?: boolean | null }>();
}

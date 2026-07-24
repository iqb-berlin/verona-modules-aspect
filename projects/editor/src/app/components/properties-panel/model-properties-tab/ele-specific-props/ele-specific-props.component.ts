import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CombinedProperties } from 'editor/src/app/components/properties-panel/element-properties-panel/element-properties-panel.component';
import { UIElementValue } from 'common/models/ui-element-interfaces';

@Component({
  selector: 'aspect-ele-specific-props',
  standalone: false,
  templateUrl: './ele-specific-props.component.html'
})
export class EleSpecificPropsComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Output() updateModel =
    new EventEmitter<{ property: string; value: UIElementValue, isInputValid?: boolean | null }>();
}

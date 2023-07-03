import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { StateVariable } from 'common/models/state-variable';

@Component({
  selector: 'aspect-button-action-param-state-variable',
  templateUrl: './button-action-param-state-variable.component.html'
})
export class ButtonActionParamStateVariableComponent {
  @Input() stateVariable!: StateVariable;
  @Input() stateVariableIds!: string[];
  @Output() stateVariableChange = new EventEmitter<StateVariable>();
}

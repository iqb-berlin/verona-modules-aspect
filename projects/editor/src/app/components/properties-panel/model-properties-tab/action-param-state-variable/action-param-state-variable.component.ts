import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { StateVariable } from 'common/models/state-variable';

@Component({
  selector: 'aspect-action-param-state-variable',
  templateUrl: './action-param-state-variable.component.html',
  standalone: false
})
export class ActionParamStateVariableComponent {
  @Input() stateVariable!: StateVariable;
  @Input() stateVariables!: StateVariable[];
  @Output() stateVariableChange = new EventEmitter<StateVariable>();
}

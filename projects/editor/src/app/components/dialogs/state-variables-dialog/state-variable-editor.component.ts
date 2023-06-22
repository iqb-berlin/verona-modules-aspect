import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { StateVariable } from 'common/models/state-variable';

@Component({
  selector: 'aspect-state-variable-editor',
  templateUrl: './state-variable-editor.component.html'
})
export class StateVariableEditorComponent {
  @Input() stateVariable: StateVariable = new StateVariable('', '');
  @Output() stateVariableChange = new EventEmitter<StateVariable>();
}

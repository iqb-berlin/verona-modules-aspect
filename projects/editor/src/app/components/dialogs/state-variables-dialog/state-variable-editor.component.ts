import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { StateVariable } from 'common/models/state-variable';
import { IDService } from 'editor/src/app/services/id.service';

@Component({
  selector: 'aspect-state-variable-editor',
  templateUrl: './state-variable-editor.component.html',
  styles: [`
    .error {
      color: #f44336 !important;
    }
  `]
})
export class StateVariableEditorComponent {
  error: boolean = false;
  @Input() stateVariable!: StateVariable;
  @Output() stateVariableChange = new EventEmitter<StateVariable>();

  constructor(private idService: IDService) { }

  checkId(id: string): void {
    if (id !== this.stateVariable.id) {
      this.error = !this.idService.validateAndAddNewID(id, this.stateVariable.id);
      if (!this.error) {
        this.stateVariable.id = id;
        this.stateVariableChange.emit(this.stateVariable);
      }
    } else {
      this.error = false;
    }
  }
}

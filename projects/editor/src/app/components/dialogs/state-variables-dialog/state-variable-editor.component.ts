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

  checkId(alias: string): void {
    if (alias !== this.stateVariable.alias) {
      this.error = !this.idService.isAliasAvailable(alias, 'state-variable');
      if (!this.error) {
        this.idService.unregister(this.stateVariable.alias, 'state-variable', false, true);
        this.idService.register(alias, 'state-variable', false, true);
        this.stateVariable.alias = alias;
        this.stateVariableChange.emit(this.stateVariable);
      }
    } else {
      this.error = false;
    }
  }
}

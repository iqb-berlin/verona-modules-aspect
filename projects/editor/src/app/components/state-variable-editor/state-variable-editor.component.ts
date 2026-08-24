import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { StateVariable } from 'common/models/state-variable';
import { VariableAlias } from 'common/utils/variable-alias';
import { IDService } from 'editor/src/app/services/id.service';

@Component({
  selector: 'aspect-state-variable-editor',
  templateUrl: './state-variable-editor.component.html',
  styleUrls: ['./state-variable-editor.component.scss'],
  standalone: false
})
export class StateVariableEditorComponent {
  error: boolean = false;
  errorMessage: string = '';
  @Input() stateVariable!: StateVariable;
  @Output() stateVariableChange = new EventEmitter<StateVariable>();

  constructor(private idService: IDService) { }

  checkId(alias: string): void {
    if (alias !== this.stateVariable.alias) {
      if (!VariableAlias.isValid(alias)) {
        this.error = true;
        this.errorMessage = 'idContainsInvalidCharacters';
      } else if (!this.idService.isAliasAvailable(alias)) {
        this.error = true;
        this.errorMessage = 'idTaken';
      } else {
        this.error = false;
        this.errorMessage = '';
        this.idService.unregister(this.stateVariable.alias, false, true);
        this.idService.register(alias, false, true);
        this.stateVariable.alias = alias;
        this.stateVariableChange.emit(this.stateVariable);
      }
    } else {
      this.error = false;
      this.errorMessage = '';
    }
  }
}

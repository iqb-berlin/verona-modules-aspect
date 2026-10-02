import { Component, Input } from '@angular/core';
import { UnitService } from 'editor/src/app/services/unit.service';

@Component({
  selector: 'aspect-show-state-variables-button',
  templateUrl: './show-state-variables-button.component.html',
  styleUrls: ['./show-state-variables-button.component.scss'],
  standalone: false
})

export class ShowStateVariablesButtonComponent {
  @Input() stateVariablesCount!: number;
  constructor(private unitService: UnitService) { }

  showStateVariablesDialog() {
    this.unitService.editStateVariables();
  }
}

import { Component } from '@angular/core';
import { UnitService } from '../../services/unit-services/unit.service';

@Component({
    selector: 'aspect-toolbar',
    templateUrl: './toolbar.component.html',
    styles: [
        'mat-toolbar {background-color: #696969}',
        'mat-toolbar button {margin: 15px}'
    ],
    standalone: false
})
export class ToolbarComponent {
  constructor(private unitService: UnitService) { }

  save(): void {
    this.unitService.saveUnit();
  }

  async load(): Promise<void> {
    await this.unitService.loadUnitFromFile();
  }
}

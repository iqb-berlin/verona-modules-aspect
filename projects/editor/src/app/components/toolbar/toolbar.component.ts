import { Component } from '@angular/core';
import { UnitService } from '../../services/unit.service';
import { IdService } from '../../services/id.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styles: [
    'mat-toolbar {background-color: #696969}',
    'mat-toolbar button {margin: 15px}'
  ]
})
export class ToolbarComponent {
  constructor(
    private unitService: UnitService,
    private idService: IdService
  ) { }

  save(): void {
    this.unitService.saveUnit();
  }

  async load(): Promise<void> {
    this.idService.reset();
    await this.unitService.loadUnitFromFile();
  }
}

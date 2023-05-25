import { Component } from '@angular/core';
import { UnitService } from '../../services/unit.service';

@Component({
  selector: 'aspect-toolbar',
  templateUrl: './toolbar.component.html',
  styles: [
    'mat-toolbar {background-color: #696969}',
    'mat-toolbar button {margin: 15px}'
  ]
})
export class ToolbarComponent {
  constructor(private unitService: UnitService) { }

  save(): void {
    this.unitService.saveUnit();
  }

  loadUnitFile(event: Event) {
    this.unitService.loadUnitFile((event.target as HTMLInputElement).files?.[0] as File);
  }

  // async load(): Promise<void> {
  //   await this.unitService.loadUnitFromFile();
  // }
}

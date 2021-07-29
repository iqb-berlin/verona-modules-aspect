import {
  Component, Input
} from '@angular/core';
import { UnitPageSection } from '../../../../../../../common/unit';
import { SelectionService } from './selection.service';

@Component({
  selector: '[app-canvas-section]',
  template: `
    <app-canvas-drag-overlay
      *ngFor="let element of section.elements"
      [element]="element"
      (elementSelected)="canvasService.selectElement($event)">
    </app-canvas-drag-overlay>
  `
})
export class CanvasSectionComponent {
  @Input() section!: UnitPageSection;

  constructor(public canvasService: SelectionService) { }
}

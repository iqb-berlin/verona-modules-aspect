import {
  Component, HostListener, Input
} from '@angular/core';
import { UnitPageSection } from '../../../../../../../common/unit';
import { SelectionService } from './selection.service';
import { UnitService } from '../../../../unit.service';

@Component({
  selector: '[app-canvas-section]',
  template: `
    <div *ngIf="showSectionMenu"
         class="sectionMenu" fxLayout="column">
      <button mat-mini-fab color="accent"
              (click)="unitService.moveSection(sectionIndex, 'up')">
        <mat-icon inline>arrow_upward</mat-icon>
      </button>
      <button mat-mini-fab color="accent"
              (click)="unitService.moveSection(sectionIndex, 'down')">
        <mat-icon inline>arrow_downward</mat-icon>
      </button>
    </div>
    <div *ngIf="!section.dynamicPositioning">
      <app-static-canvas-overlay
        *ngFor="let element of section.elements"
        [element]="$any(element)"
        (elementSelected)="canvasService.selectElement($event)">
      </app-static-canvas-overlay>
    </div>

    <div *ngIf="section.dynamicPositioning"
         [style.display]="'grid'"
         [style.grid-template-columns]="section.gridColumnSizes"
         [style.height.%]="100">
      <app-dynamic-canvas-overlay *ngFor="let element of section.elements"
                                  [element]="$any(element)"
                                  (elementSelected)="canvasService.selectElement($event)"
                                  [style.min-width.px]="element.width"
                                  [style.min-height.px]="element.height"
                                  [style.grid-column-start]="element.gridColumnStart"
                                  [style.grid-column-end]="element.gridColumnEnd">
      </app-dynamic-canvas-overlay>
    </div>
  `,
  styles: [
    '.sectionMenu {position: absolute; left: -29px}',
    '.sectionMenu button {width: 28px; height: 28px}',
    '.sectionMenu .mat-mini-fab {line-height: 0;}',
    '::ng-deep .sectionMenu .mat-mini-fab .mat-button-wrapper {line-height: 0;}'
  ]
})
export class CanvasSectionComponent {
  @Input() section!: UnitPageSection;
  @Input() sectionIndex!: number;
  showSectionMenu: boolean = false;

  constructor(public unitService: UnitService, public canvasService: SelectionService) { }

  @HostListener('mouseenter')
  showMenu(): void {
    this.showSectionMenu = true;
  }
  @HostListener('mouseleave')
  hideMenu(): void {
    this.showSectionMenu = false;
  }
}

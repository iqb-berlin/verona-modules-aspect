import { Component, Input, OnInit } from '@angular/core';
import { UnitPageSection } from '../../../../../../../common/unit';
import { UnitService } from '../../../../unit.service';

@Component({
  selector: '[app-canvas-section]',
  template: `
    <div class="section-wrapper"
         [style.border]="selected ? '1px solid': '1px dotted'"
         [style.width.px]="section.width"
         [style.height.px]="section.height"
         [style.background-color]="section.backgroundColor"
         (click)="this.unitService.selectSection(this)">
      <div *ngIf="!section.dynamicPositioning">
        <app-static-canvas-overlay
          *ngFor="let element of section.elements"
          [element]="$any(element)">
        </app-static-canvas-overlay>
      </div>

      <div *ngIf="section.dynamicPositioning"
           [style.display]="'grid'"
           [style.grid-template-columns]="section.gridColumnSizes"
           [style.height.%]="100">
        <app-dynamic-canvas-overlay *ngFor="let element of section.elements"
                                    [element]="$any(element)"
                                    [style.min-width.px]="element.width"
                                    [style.min-height.px]="element.height"
                                    [style.grid-column-start]="element.gridColumnStart"
                                    [style.grid-column-end]="element.gridColumnEnd">
        </app-dynamic-canvas-overlay>
      </div>

      <div class="sectionMenu" fxLayout="column">
        <button mat-mini-fab color="accent"
                (click)="unitService.moveSection(sectionIndex, 'up')">
          <mat-icon inline>arrow_upward</mat-icon>
        </button>
        <button mat-mini-fab color="accent"
                (click)="unitService.moveSection(sectionIndex, 'down')">
          <mat-icon inline>arrow_downward</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [
    '.sectionMenu {visibility: hidden; transition: 0.2s 0.7s;}',
    '.section-wrapper:hover .sectionMenu {visibility: visible; transition-delay: 0s;}',
    '.sectionMenu {position: absolute; left: -29px}',
    '.sectionMenu button {width: 28px; height: 28px}',
    '.sectionMenu .mat-mini-fab {line-height: 0;}',
    '::ng-deep .sectionMenu .mat-mini-fab .mat-button-wrapper {line-height: 0;}'
  ]
})
export class CanvasSectionComponent implements OnInit {
  @Input() section!: UnitPageSection;
  @Input() sectionIndex!: number;
  selected = true;

  constructor(public unitService: UnitService) {
    this.unitService.selectSection(this);
  }

  ngOnInit(): void {
    this.unitService.selectSection(this);
  }
}

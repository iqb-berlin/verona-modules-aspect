import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnitService } from '../../../../unit.service';
import { UnitPage, UnitPageSection, UnitUIElement } from '../../../../../../../common/unit';
import { SelectionService } from '../canvas/selection.service';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styles: [
    'mat-expansion-panel-header {font-size: larger}',
    'mat-expansion-panel {font-size: large;}',
    '.delete-element-button {margin-bottom: 5px; border: 1px solid red;}',
    '.duplicate-element-button {margin-bottom: 5px}',
    '.alignment-button-group button {margin: 5px;}',
    '::ng-deep app-properties .mat-tab-label {min-width: 0 !important;}'
  ]
})
export class PropertiesComponent {
  selectedElements: UnitUIElement[] = [];
  selectedPage!: UnitPage;
  selectedPageSection!: UnitPageSection;
  expandElement: boolean = false;
  private ngUnsubscribe = new Subject<void>();

  constructor(public unitService: UnitService, private selectionService: SelectionService) { }

  ngOnInit(): void {
    this.unitService.selectedPage
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((page: UnitPage) => {
        this.selectedPage = page;
        this.expandElement = false;
      });
    this.unitService.selectedPageSection
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((pageSection: UnitPageSection) => {
        this.selectedPageSection = pageSection;
      });
    this.selectionService.elementSelected
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => { this.expandElement = true; });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

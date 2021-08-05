import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnitService } from '../../../../unit.service';
import { UnitPage, UnitPageSection, UnitUIElement } from '../../../../../../../common/unit';

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
  expandElementView: boolean = false;
  private ngUnsubscribe = new Subject<void>();

  constructor(public unitService: UnitService) { }

  ngOnInit(): void {
    this.unitService.selectedPage
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((page: UnitPage) => {
        this.selectedPage = page;
        this.expandElementView = false;
      });
    this.unitService.elementSelected
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => { this.expandElementView = true; });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

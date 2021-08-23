import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnitPage, UnitUIElement } from '../../../../../../../common/unit';
import { SelectionService } from '../../../../selection.service';

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
  selectedPage!: UnitPage;
  expandElementView: boolean = false;
  private ngUnsubscribe = new Subject<void>();

  constructor(public selectionService: SelectionService) { }

  ngOnInit(): void {
    this.selectionService.selectedPage
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((page: UnitPage) => {
        this.selectedPage = page;
        this.expandElementView = false;
      });
    this.selectionService.selectedElements
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((elements: UnitUIElement[]) => {
        if (elements.length > 0) {
          this.expandElementView = true;
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

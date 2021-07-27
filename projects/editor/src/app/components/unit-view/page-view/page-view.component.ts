import {
  Component, Input, OnDestroy, OnInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { UnitPage } from '../../../../../../common/unit';
import { UnitService } from '../../../unit.service';

@Component({
  selector: 'app-page-view',
  templateUrl: './page-view.component.html',
  styles: [
    '.page-toolbar {margin-top: 5px}',
    '.delete-page-button {margin-right: 20px; vertical-align: top; height: 45px}',
    'mat-checkbox {margin-left: 20px;}',
    'mat-form-field {margin-left: 20px;}'
  ]
})
export class PageViewComponent implements OnInit, OnDestroy {
  @Input() pageIndex!: number;
  page!: UnitPage;
  private ngUnsubscribe = new Subject<void>();

  constructor(public unitService: UnitService) { }

  ngOnInit(): void {
    this.unitService.getPageObservable(this.pageIndex)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((page: UnitPage) => {
        this.page = page;
      });
  }

  setPageAlwaysVisible(event: MatCheckboxChange): void {
    if (!this.unitService.setPageAlwaysVisible(event.checked)) {
      event.source.checked = false;
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

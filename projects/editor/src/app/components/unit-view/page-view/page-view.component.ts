import {
  Component, Input, OnDestroy, OnInit
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { UnitPage } from '../../../../../../common/unit';
import { UnitService } from '../../../unit.service';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';

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
  @Input() pageObservable!: Observable<UnitPage>;
  private pageSubscription!: Subscription;
  page!: UnitPage;

  constructor(public unitService: UnitService) { }

  ngOnInit(): void {
    this.pageSubscription = this.pageObservable.subscribe((page: UnitPage) => {
      this.page = page;
    });
  }

  setPageAlwaysVisible(event: MatCheckboxChange): void {
    if (!this.unitService.setPageAlwaysVisible(event.checked)) {
      event.source.checked = false;
    }
  }

  ngOnDestroy(): void {
    this.pageSubscription.unsubscribe();
  }
}

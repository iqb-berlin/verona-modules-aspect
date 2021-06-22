import {
  Component, Input, OnDestroy, OnInit
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { UnitPage } from '../../../model/unit';
import { UnitService } from '../../../unit.service';

@Component({
  selector: 'app-page-view',
  templateUrl: './page-view.component.html',
  styles: [
    '.page-toolbar {margin: 8px}',
    '.delete-page-button {margin-right: 20px; vertical-align: top; height: 45px}'
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

  ngOnDestroy(): void {
    this.pageSubscription.unsubscribe();
  }
}

import {
  Component, Input, OnInit, Output, EventEmitter
} from '@angular/core';
import { UnitStateService } from '../../services/unit-state.service';
import { Page } from '../../../../../common/interfaces/unit';

@Component({
  selector: 'aspect-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})

export class PageComponent{
  @Input() page!: Page;
  @Input() isLastPage!: boolean;
  @Input() parentArrayIndex!: number;
  @Input() pagesContainer!: HTMLElement;
  @Output() selectedIndexChange = new EventEmitter<number>();

  constructor(private unitStateService: UnitStateService) {}

  onIntersection(): void {
    this.selectedIndexChange.emit(this.parentArrayIndex);
  }
}

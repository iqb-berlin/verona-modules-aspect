import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { Page } from '../../../../../common/interfaces/unit';

@Component({
  selector: 'aspect-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})

export class PageComponent {
  @Input() page!: Page;
  @Input() isLastPage!: boolean;
  @Input() pageIndex!: number;
  @Input() pagesContainer!: HTMLElement;
  @Output() selectedIndexChange = new EventEmitter<number>();

  onIntersection(): void {
    this.selectedIndexChange.emit(this.pageIndex);
  }
}

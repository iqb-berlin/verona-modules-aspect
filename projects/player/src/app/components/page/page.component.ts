import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { Page } from 'common/models/page';

@Component({
  selector: 'aspect-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})

export class PageComponent {
  @Input() page!: Page;
  @Input() isLastPage!: boolean;
  @Input() pageIndex!: number;
  @Input() scrollPageIndex!: number;
  @Input() pagesContainer!: HTMLElement;
  @Input() concatScrollPadding!: number;
  @Output() selectedIndexChange = new EventEmitter<number>();
}

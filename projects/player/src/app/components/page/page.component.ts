import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { Page } from 'common/models/page';
import { MediaPlayerService } from '../../services/media-player.service';

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
  @Output() selectedIndexChange = new EventEmitter<number>();

  constructor(public mediaPlayerService: MediaPlayerService) {}
}

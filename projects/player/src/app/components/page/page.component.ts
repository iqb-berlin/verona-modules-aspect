import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { MediaPlayerService } from '../../services/media-player.service';
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
  @Input() pagesContainer!: HTMLElement;
  @Output() selectedIndexChange = new EventEmitter<number>();

  constructor(public mediaPlayerService: MediaPlayerService) {}
}

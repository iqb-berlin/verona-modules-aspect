import {
  Component, Input, Output, EventEmitter, ElementRef
} from '@angular/core';
import { Page } from 'common/models/page';
import { PagingMode } from 'player/modules/verona/models/verona';
import { IsVisibleIndex } from 'player/src/app/models/is-visible-index.interface';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { NavigationService } from 'player/src/app/services/navigation.service';

@Component({
  selector: 'aspect-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})

export class PageComponent {
  @Input() page!: Page;
  @Input() isLastPage!: boolean;
  @Input() pageIndex!: number;
  @Input() scrollPageIndex!: number;
  @Input() pagingMode!: PagingMode;
  @Input() isPresentedPagesComplete!: boolean;
  @Input() showUnitNavNext!: boolean;
  @Input() sectionNumbering: {
    enableSectionNumbering: boolean, sectionNumberingPosition: 'left' | 'above'
  } | undefined;

  @Output() selectedIndexChange = new EventEmitter<number>();
  @Output() isVisibleIndexChange = new EventEmitter<IsVisibleIndex>();

  isVisibleIndexSections: IsVisibleIndex[] = [];
  constructor(
    public elementRef: ElementRef,
    public navigationService: NavigationService,
    public veronaPostService: VeronaPostService) {}

  setIsVisibleIndexSections(changedSection: IsVisibleIndex): void {
    let section = this.isVisibleIndexSections
      .find(element => element.index === changedSection.index);
    if (!section) {
      section = changedSection;
      this.isVisibleIndexSections.push(section);
    }
    section.isVisible = changedSection.isVisible;
    this.emitIsVisibleIndexChange();
  }

  emitIsVisibleIndexChange() {
    setTimeout(() => {
      this.isVisibleIndexChange.emit(
        {
          index: this.scrollPageIndex,
          isVisible: !this.isVisibleIndexSections.every(section => !section.isVisible)
        }
      );
    });
  }
}

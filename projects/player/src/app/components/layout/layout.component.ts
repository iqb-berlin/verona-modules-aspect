import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { UnitPage } from '../../../../../common/unit';
import { PlayerConfig } from '../../models/verona';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Input() pages!: UnitPage[];
  @Input() selectedIndex!: number;
  @Input() selectIndex!: Subject<number>;
  @Input() playerConfig!: PlayerConfig;

  @Output() selectedIndexChange = new EventEmitter<number>();
  @Output() validPagesDetermined = new EventEmitter<Record<string, string>[]>();

  playerPageIndices!: number[];
  lastScrollPageIndex!: number;
  scrollPages!: UnitPage[];
  hasScrollPages!: boolean;
  alwaysVisiblePage!: UnitPage | undefined;
  alwaysVisibleUnitPageIndex!: number;
  alwaysVisiblePagePosition!: 'top' | 'bottom' | 'left' | 'right' ;
  layoutAlignment!: 'row' | 'column';
  scrollPageMode!: 'separate' | 'concat-scroll' | 'concat-scroll-snap';
  hidePageLabels!: boolean;

  maxWidth: { alwaysVisiblePage: number, scrollPages: number, allPages: number } =
  { alwaysVisiblePage: 0, scrollPages: 0, allPages: 0 };

  aspectRatioRow: { alwaysVisiblePage: number, scrollPages: number } =
  { alwaysVisiblePage: 0, scrollPages: 0 };

  aspectRatioColumn: { alwaysVisiblePage: number, scrollPages: number } =
  { alwaysVisiblePage: 0, scrollPages: 0 };

  containerMaxWidth: { alwaysVisiblePage: string, scrollPages: string } =
  { alwaysVisiblePage: '0px', scrollPages: '0px' };

  constructor(private translateService: TranslateService) { }

  ngOnInit(): void {
    this.initPages();
    this.initLayout();
    this.selectIndex.subscribe((selectedIndex: number): void => { this.selectedIndex = selectedIndex; });
  }

  private getLastScrollPageIndex(): number {
    if (this.alwaysVisibleUnitPageIndex < 0 || this.alwaysVisibleUnitPageIndex < this.pages.length - 1) {
      return this.pages.length - 1;
    }
    return this.pages.length - 2;
  }

  private initPages(): void {
    this.alwaysVisibleUnitPageIndex = this.pages.findIndex((page: UnitPage): boolean => page.alwaysVisible);
    this.alwaysVisiblePage = this.pages[this.alwaysVisibleUnitPageIndex];
    this.scrollPages = this.pages.filter((page: UnitPage): boolean => !page.alwaysVisible);
    this.hasScrollPages = this.scrollPages && this.scrollPages.length > 0;
    this.lastScrollPageIndex = this.getLastScrollPageIndex();
    this.playerPageIndices = this.pages.map(
      (page: UnitPage, index: number): number => {
        if (index === this.alwaysVisibleUnitPageIndex) {
          return this.pages.length - 1;
        }
        return (this.alwaysVisibleUnitPageIndex < 0 || index < this.alwaysVisibleUnitPageIndex) ? index : index - 1;
      }
    );
    this.validPagesDetermined.emit(this.scrollPages.map((page: UnitPage, index: number): Record<string, string> => (
      { [index.toString(10)]: `${this.translateService.instant('pageIndication', { index: index + 1 })}` })));
  }

  private initLayout(): void {
    this.alwaysVisiblePagePosition = this.alwaysVisiblePage?.alwaysVisiblePagePosition ?
      this.alwaysVisiblePage.alwaysVisiblePagePosition : 'left';
    this.layoutAlignment = (this.alwaysVisiblePagePosition === 'left' || this.alwaysVisiblePagePosition === 'right') ?
      'row' : 'column';
    this.scrollPageMode = this.playerConfig.pagingMode ? this.playerConfig.pagingMode : 'separate';
    this.hidePageLabels = false;

    this.maxWidth.alwaysVisiblePage = this.getAbsolutePageWidth(this.alwaysVisiblePage);
    this.maxWidth.scrollPages = this.getScrollPagesWidth();
    this.maxWidth.allPages = Math.max(this.maxWidth.alwaysVisiblePage, this.maxWidth.scrollPages);

    this.aspectRatioRow.alwaysVisiblePage = this.getAspectRatio('row', 0);
    this.aspectRatioRow.scrollPages = this.getAspectRatio('row', -100);
    this.aspectRatioColumn.alwaysVisiblePage = this.getAspectRatio('column', 0);
    this.aspectRatioColumn.scrollPages = this.getAspectRatio('column', -100);

    this.containerMaxWidth.alwaysVisiblePage = this.getContainerMaxWidth(
      !(this.alwaysVisiblePage && this.alwaysVisiblePage.hasMaxWidth),
      this.maxWidth.alwaysVisiblePage
    );
    this.containerMaxWidth.scrollPages = this.getContainerMaxWidth(
      this.scrollPages.findIndex((page: UnitPage): boolean => !page.hasMaxWidth) > -1,
      this.maxWidth.scrollPages
    );
  }

  private getContainerMaxWidth(condition: boolean, maxWidth: number): string {
    if (condition) {
      return '100%';
    }
    return this.layoutAlignment === 'row' ? `${maxWidth}px` : `${this.maxWidth.allPages}px`;
  }

  private getAspectRatio(alignment: string, offset: number) : number {
    return this.alwaysVisiblePage && this.layoutAlignment === alignment ?
      Math.abs(this.alwaysVisiblePage.alwaysVisibleAspectRatio - offset) : 100;
  }

  private getScrollPagesWidth(): number {
    return this.hasScrollPages ?
      Math.max(...this.scrollPages.map((page: UnitPage): number => this.getAbsolutePageWidth(page))) : 0;
  }

  private getAbsolutePageWidth = (page: UnitPage | undefined): number => ((page) ? 2 * page.margin + page.maxWidth : 0);

  onSelectedIndexChange(selectedIndex: number): void {
    this.selectedIndexChange.emit(selectedIndex);
  }
}

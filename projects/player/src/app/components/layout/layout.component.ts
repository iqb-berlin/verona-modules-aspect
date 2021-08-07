import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
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
  @Input() currentPlayerPageIndex!: number;
  @Input() playerConfig!: PlayerConfig;

  @Output() selectedIndexChange = new EventEmitter();
  @Output() validPagesDetermined = new EventEmitter<Record<string, string>[]>();

  playerPageIndices!: number[];
  scrollPages!: UnitPage[];
  hasScrollPages!: boolean;
  alwaysVisiblePage!: UnitPage | undefined;
  alwaysVisibleUnitPageIndex!: number;

  pageExpansion!: number;
  alwaysVisiblePagePosition!: 'top' | 'bottom' | 'left' | 'right' ;
  layoutAlignment!: 'row' | 'column';
  scrollPageMode!: 'separate' | 'concat-scroll' | 'concat-scroll-snap';
  hidePageLabels!: boolean;

  constructor(private translateService: TranslateService) { }

  ngOnInit(): void {
    this.initPages();
    this.initLayout();
  }

  private initPages(): void {
    this.alwaysVisibleUnitPageIndex = this.pages.findIndex((page: UnitPage): boolean => page.alwaysVisible);
    this.alwaysVisiblePage = this.pages[this.alwaysVisibleUnitPageIndex];
    this.scrollPages = this.pages.filter((page: UnitPage): boolean => !page.alwaysVisible);
    this.hasScrollPages = this.scrollPages && this.scrollPages.length > 0;
    this.playerPageIndices = this.pages.map(
      (page: UnitPage, index: number): number => {
        if (index === this.alwaysVisibleUnitPageIndex) {
          return this.pages.length - 1;
        }
        return (this.alwaysVisibleUnitPageIndex < 0 || index < this.alwaysVisibleUnitPageIndex) ? index : index - 1;
      }
    );
    this.validPagesDetermined.emit(this.scrollPages.map((page: UnitPage, index: number): Record<string, string> => (
      { [page.id]: `${this.translateService.instant('pageIndication', { index: index + 1 })}` })));
  }

  private initLayout(): void {
    this.alwaysVisiblePagePosition = this.alwaysVisiblePage?.alwaysVisiblePagePosition ?
      this.alwaysVisiblePage.alwaysVisiblePagePosition : 'left';
    this.layoutAlignment = (this.alwaysVisiblePagePosition === 'left' || this.alwaysVisiblePagePosition === 'right') ?
      'row' : 'column';
    this.pageExpansion = !this.alwaysVisiblePage || !this.hasScrollPages ? 100 : 50;
    this.scrollPageMode = this.playerConfig.pagingMode ? this.playerConfig.pagingMode : 'separate';
    this.hidePageLabels = false;
  }

  onSelectedIndexChange(): void {
    this.selectedIndexChange.emit();
  }
}

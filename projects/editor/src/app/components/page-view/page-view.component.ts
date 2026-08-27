import {
  Component, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnitService } from 'editor/src/app/services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { SectionService } from 'editor/src/app/services/section.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { SectionComponent } from 'editor/src/app/components/section/section.component';
import { EditorPage } from 'editor/src/app/models/editor-page';

@Component({
  selector: 'aspect-editor-page-view',
  templateUrl: './page-view.component.html',
  styleUrls: ['./page-view.component.scss'],
  standalone: false
})
export class PageViewComponent implements OnInit, OnDestroy {
  @Input() page!: EditorPage;
  @Input() pageIndex!: number;
  @Input() singlePageMode: boolean = false;
  @Input() isLastPage: boolean = false;
  @Output() pagesChanged = new EventEmitter();
  @Output() alwaysVisiblePageModified = new EventEmitter();
  @ViewChildren(SectionComponent) sectionComponents!: QueryList<SectionComponent>;

  private ngUnsubscribe = new Subject<void>();

  constructor(public selectionService: SelectionService,
              public unitService: UnitService,
              public elementService: ElementService,
              public sectionService: SectionService) { }

  ngOnInit(): void {
    this.unitService.sectionCountUpdated
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.sectionComponents.toArray()
            .forEach(sectionComp => {
              sectionComp.updateSectionCounter();
            });
        }
      );
  }

  addSection(pageIndex: number): void {
    this.sectionService.addSection(this.page);
    /* The section is appended, so its index is only known here -- as with the other callers of
       addSection, naming it is this side's job (#1255). */
    this.selectionService.updateSelection(pageIndex, this.page.sections.length - 1);
  }

  moveSectionToNewpage(pageIndex: number): void {
    this.unitService.moveSectionToNewpage(pageIndex, this.selectionService.selectedSectionIndex);
  }

  /** Move page section to page above and delete page. */
  collapsePage(pageIndex: number): void {
    this.unitService.collapsePage(pageIndex);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

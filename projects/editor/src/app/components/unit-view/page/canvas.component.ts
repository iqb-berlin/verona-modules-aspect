import {
  Component, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Page } from 'common/models/page';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { SectionService } from 'editor/src/app/services/unit-services/section.service';
import { ElementService } from 'editor/src/app/services/unit-services/element.service';
import { SectionComponent } from 'editor/src/app/components/unit-view/section/section.component';

@Component({
  selector: 'aspect-page-canvas',
  templateUrl: './canvas.component.html',
  styles: [`
    .canvasBackground {
      background-color: lightgrey;
      padding: 20px 50px;
      height: 100%;
    }
    .add-section-button {
      height: 25px;
      width: 30%;
      background-color: var(--button-darker-grey);
      margin-top: 10px;
    }
    .page-wrapper {
      margin-bottom: 10px; display: flex; flex-direction: column; align-items: center;
    }
    .page-label {
      display: inline; vertical-align: super; font-size: large;
    }
  `]
})
export class CanvasComponent implements OnInit, OnDestroy {
  @Input() pages!: Page[];
  @Output() pagesChanged = new EventEmitter();
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
    this.sectionService.addSection(this.pages[pageIndex]);
    this.selectionService.selectedPageIndex = pageIndex;
    this.selectionService.selectedSectionIndex = this.pages[pageIndex].sections.length - 1;
  }

  moveSectionToNewpage(pageIndex: number): void {
    this.unitService.moveSectionToNewpage(pageIndex, this.selectionService.selectedSectionIndex);
  }

  /* Move page section to page above and delete page. */
  collapsePage(pageIndex: number): void {
    this.unitService.collapsePage(pageIndex);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

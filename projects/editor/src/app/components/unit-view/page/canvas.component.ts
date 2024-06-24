import {
  Component, Input, OnDestroy, OnInit, QueryList, ViewChildren
} from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { PositionedUIElement, UIElement } from 'common/models/elements/element';
import { Page } from 'common/models/page';
import { Section } from 'common/models/section';
import { UnitService } from '../../../services/unit-services/unit.service';
import { SelectionService } from '../../../services/selection.service';
import { CanvasElementOverlay } from 'editor/src/app/components/unit-view/element-overlay/canvas-element-overlay';
import { SectionStaticComponent } from 'editor/src/app/components/unit-view/section/section-static.component';
import { SectionDynamicComponent } from 'editor/src/app/components/unit-view/section/section-dynamic.component';
import { SectionService } from 'editor/src/app/services/unit-services/section.service';
import { ElementService } from 'editor/src/app/services/unit-services/element.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SectionComponent } from 'editor/src/app/components/unit-view/section/section.component';

@Component({
  selector: 'aspect-page-canvas',
  templateUrl: './canvas.component.html',
  styles: [`
    .canvasBackground {
      background-color: lightgrey;
      padding: 20px 50px;
      height: 100%;
      overflow: auto;
    }
    .add-section-icon{
      font-size: 24px;
      color: white;
      margin-top: -5px;
    }
    .add-section-button {
      width: 100%;
      height: 25px;
      background-color: #BABABA;
      margin-top: 10px;
    }
  `]
  })
export class CanvasComponent implements OnInit, OnDestroy {
  @Input() page!: Page;
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

  addSection(): void {
    this.sectionService.addSection(this.page);
    this.selectionService.selectedSectionIndex = this.page.sections.length - 1;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

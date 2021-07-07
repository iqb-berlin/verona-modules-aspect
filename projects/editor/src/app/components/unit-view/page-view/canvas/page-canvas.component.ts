import {
  Component, HostListener,
  Input, OnDestroy,
  OnInit, QueryList, ViewChildren
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { UnitPage, UnitPageSection } from '../../../../../../../common/unit';
import { UnitService } from '../../../../unit.service';
import { CanvasSectionComponent } from './canvas-section.component';
import { CanvasDragOverlayComponent } from './canvas-drag-overlay.component';

@Component({
  selector: 'app-page-canvas',
  template: `
    <app-canvas-section-toolbar
      (addSection)="unitService.addSection()"
      (removeSection)="unitService.deleteSection()"
      (sectionEditMode)="sectionEditMode = $event">
    </app-canvas-section-toolbar>

    <app-canvas-toolbar [disabled]="selectedComponentElements.length < 2" (alignElements)="alignElements($event)">
    </app-canvas-toolbar>

    <div class="canvasFrame" fxLayout="row" [style.padding.px]="page.margin"
         [style.background-color]="page.backgroundColor">
      <div *ngIf="sectionEditMode" cdkDropList (cdkDropListDropped)="dropSection($event)">
        <div #section_component app-canvas-section class="section"
             *ngFor="let section of page.sections; let i = index"
             [section]="section"
             cdkDrag [childrenDraggable]="!sectionEditMode"
             [ngStyle]="{border: '1px solid', 'width.px': page.width, 'height.px': section.height}">
        </div>
      </div>
      <div *ngIf="!sectionEditMode" cdkDropListGroup class="section-list">
        <div #section_component app-canvas-section class="section"
             *ngFor="let section of page.sections; let i = index"
             [section]="section" [childrenDraggable]="!sectionEditMode"
             (elementSelected)="elementSelected($event)" (click)="selectSection(i)"
             cdkDropList (cdkDropListDropped)="elementDropped($event)" [cdkDropListData]="section"
             [ngStyle]="{
                border: i === selectedSectionIndex ? '1px solid': '1px dotted',
                'width.px': page.width,
                'height.px': section.height }">
        </div>
      </div>
    </div>
  `,
  styles: [
    '.canvasFrame {background-color: lightgrey; height: 69vh; overflow: auto; width: 100%}',
    '.section {position: relative;}'
  ]
})
export class PageCanvasComponent implements OnInit, OnDestroy {
  @Input() pageObservable!: Observable<UnitPage>;
  @ViewChildren('section_component') canvasSections!: QueryList<CanvasSectionComponent>;
  private pageSubscription!: Subscription;
  private elementUpdatedSubscription!: Subscription;
  private pageSwitchSubscription!: Subscription;
  page!: UnitPage;
  sectionEditMode: boolean = false;
  selectedSectionIndex = 0;
  selectedComponentElements: CanvasDragOverlayComponent[] = [];

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Delete') {
      this.unitService.deleteSelectedElements();
    }
  }

  constructor(public unitService: UnitService) { }

  ngOnInit(): void {
    this.pageSubscription = this.pageObservable.subscribe((page: UnitPage) => {
      this.page = page;
      this.canvasSections?.toArray().forEach((sectionComponent: CanvasSectionComponent) => {
        sectionComponent.renderSection();
        sectionComponent.updateSelection(this.unitService.getSelectedElements());
      });
    });
    this.elementUpdatedSubscription = this.unitService.elementUpdated.subscribe(() => {
      this.updateSectionElementStyles();
    });
    this.pageSwitchSubscription = this.unitService.pageSwitch.subscribe(
      () => {
        this.clearSelection();
      }
    );
    this.pageSwitchSubscription = this.unitService.selectedPageSectionIndex.subscribe(
      (index: number) => {
        this.selectedSectionIndex = index;
      }
    );
  }

  selectSection(id: number): void {
    this.unitService.selectPageSection(Number(id));
  }

  updateSectionElementStyles(): void {
    this.canvasSections?.toArray().forEach((sectionComponent: CanvasSectionComponent) => {
      sectionComponent.updateElementStyles();
    });
  }

  elementSelected(event: { componentElement: CanvasDragOverlayComponent; multiSelect: boolean }): void {
    if (!event.multiSelect) {
      this.clearSelection();
    }
    this.selectedComponentElements.push(event.componentElement);
    this.unitService.selectElement(event.componentElement.element);
    event.componentElement.selected = true;
  }

  private clearSelection() {
    this.selectedComponentElements = [];
    this.canvasSections?.toArray().forEach((sectionComponent: CanvasSectionComponent) => {
      sectionComponent.clearSelection();
    });
    this.unitService.clearSelectedElements();
  }

  // TODO use updateSelectedElementProperty
  elementDropped(event: CdkDragDrop<UnitPageSection>): void {
    const sourceItemModel = event.item.data;

    if (event.previousContainer !== event.container) {
      transferArrayItem(event.previousContainer.data.elements,
        event.container.data.elements,
        event.previousIndex,
        event.currentIndex);
      this.canvasSections?.toArray().forEach((sectionComponent: CanvasSectionComponent) => {
        sectionComponent.renderSection();
        sectionComponent.updateSelection(this.unitService.getSelectedElements());
      });
    } else {
      sourceItemModel.xPosition += event.distance.x;
      if (sourceItemModel.xPosition < 0) {
        sourceItemModel.xPosition = 0;
      }
      if (sourceItemModel.xPosition > event.container.data.width) {
        sourceItemModel.xPosition = event.container.data.width - sourceItemModel.width;
      }
      sourceItemModel.yPosition += event.distance.y;
      if (sourceItemModel.yPosition < 0) {
        sourceItemModel.yPosition = 0;
      }
      if (sourceItemModel.yPosition > this.getPageHeight()) {
        sourceItemModel.yPosition = this.getPageHeight() - sourceItemModel.height;
      }
    }
    this.unitService.updateElement();
  }

  dropSection(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.page.sections, event.previousIndex, event.currentIndex);
    this.unitService.selectPageSection(0);
  }

  getPageHeight(): number { // TODO weg
    const reduceFct = (accumulator: number, currentValue: UnitPageSection) => accumulator + currentValue.height;
    return this.page.sections.reduce(reduceFct, 0);
  }

  alignElements(event: 'left' | 'right' | 'top' | 'bottom'):void {
    let newValue: number;
    switch (event) {
      case 'left':
        newValue = Math.min(...this.selectedComponentElements.map(el => el.element.xPosition));
        this.selectedComponentElements.forEach((element: CanvasDragOverlayComponent) => {
          element.element.xPosition = newValue;
        });
        break;
      case 'right':
        newValue = Math.max(...this.selectedComponentElements.map(
          el => el.element.xPosition + el.element.width
        ));
        this.selectedComponentElements.forEach((element: CanvasDragOverlayComponent) => {
          element.element.xPosition = newValue - element.element.width;
        });
        break;
      case 'top':
        newValue = Math.min(...this.selectedComponentElements.map(el => el.element.yPosition));
        this.selectedComponentElements.forEach((element: CanvasDragOverlayComponent) => {
          element.element.yPosition = newValue;
        });
        break;
      case 'bottom':
        newValue = Math.max(...this.selectedComponentElements.map(
          el => el.element.yPosition + el.element.height
        ));
        this.selectedComponentElements.forEach((element: CanvasDragOverlayComponent) => {
          element.element.yPosition = newValue - element.element.height;
        });
        break;
      // no default
    }
    this.updateSectionElementStyles();
  }

  ngOnDestroy(): void {
    this.pageSubscription.unsubscribe();
    this.elementUpdatedSubscription.unsubscribe();
    this.pageSwitchSubscription.unsubscribe();
  }
}

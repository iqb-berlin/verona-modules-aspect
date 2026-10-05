import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, QueryList, ViewChildren
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { SectionService } from 'editor/src/app/services/section.service';
import { UIElement } from 'common/models/elements/element';
import { ElementOverlay } from 'editor/src/app/directives/element-overlay.directive';
import { StaticSectionComponent } from 'editor/src/app/components/static-section/static-section.component';
import { DynamicSectionComponent } from 'editor/src/app/components/dynamic-section/dynamic-section.component';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { SectionCounter } from 'common/utils/section-counter';
import { PositionedUIElement } from 'common/models/ui-element-interfaces';
import { EditorSection } from 'editor/src/app/models/editor-section';

@Component({
  selector: 'aspect-editor-section-view',
  standalone: false,
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss']
})
export class SectionComponent implements AfterViewInit, OnDestroy {
  /** How long a revealed element keeps its highlight, in milliseconds. */
  private static readonly REVEAL_HIGHLIGHT_DURATION = 2000;

  @Input() section!: EditorSection;
  @Input() sectionIndex!: number;
  @Input() lastSectionIndex!: number;
  @Input() alwaysVisiblePage: boolean = false;
  @Input() isOnSelectedPage: boolean = false;
  @Input() pageIndex!: number;
  @Output() sectionSelected = new EventEmitter();

  @ViewChildren('sectionComponent')
    sectionComponents!: QueryList<StaticSectionComponent | DynamicSectionComponent>;

  sectionCounter: number | undefined;
  highlightedElementComponent: ElementOverlay | undefined;
  private ngUnsubscribe = new Subject<void>();

  constructor(public selectionService: SelectionService,
              public unitService: UnitService,
              public elementService: ElementService,
              public sectionService: SectionService,
              private hostElement: ElementRef<HTMLElement>) { }

  /**
   * Takes an element request once the overlays exist. Subscribing only now is what lets the tabbed view work: a
   * page shown for the request renders this section after the request was made, and the subject hands it over.
   */
  ngAfterViewInit(): void {
    this.selectionService.requestedElementID
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(elementID => {
        if (elementID && this.getElementOverlay(elementID)) {
          // Selecting changes what the rest of the editor displays, which may not happen during this check.
          setTimeout(() => this.revealElement(elementID));
        }
      });
    this.selectionService.requestedSection
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(request => {
        if (request && this.isRequested(request)) setTimeout(() => this.revealSection());
      });
  }

  private isRequested(request: { pageIndex: number; sectionIndex: number }): boolean {
    return request.pageIndex === this.pageIndex && request.sectionIndex === this.sectionIndex;
  }

  /** Selects the section and scrolls it into view, for an author who arrives from a list naming it (#1520). */
  private revealSection(): void {
    const request = this.selectionService.requestedSection.value;
    if (!request || !this.isRequested(request)) return;
    this.selectionService.requestedSection.next(null);
    // As revealElement does: the tab group has put the section back to the first one on turning the page.
    this.selectionService.updateSelection(this.pageIndex, this.sectionIndex);
    this.hostElement.nativeElement.scrollIntoView({ block: 'center' });
  }

  /** Selects the element, scrolls it into view and flashes its outline, for an author who arrives from elsewhere. */
  private revealElement(elementID: string): void {
    const elementComponent = this.getElementOverlay(elementID);
    if (!elementComponent || this.selectionService.requestedElementID.value !== elementID) return;
    this.selectionService.requestedElementID.next(null);
    /* As a click does (#1204): the tab group reports the page it turned to through `selectPage`, which puts the
       section back to the first one. */
    this.selectionService.updateSelection(this.pageIndex, this.sectionIndex);
    this.selectionService.selectElement({ elementComponent, multiSelect: false });
    elementComponent.childComponent?.location.nativeElement.scrollIntoView({ block: 'center' });
    elementComponent.highlight(SectionComponent.REVEAL_HIGHLIGHT_DURATION);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  updateSectionCounter(): void {
    this.sectionCounter = undefined;
    if (this.unitService.unit.enableSectionNumbering &&
        !this.alwaysVisiblePage &&
        !this.section.ignoreNumbering) {
      this.sectionCounter = SectionCounter.getNext();
    }
  }

  selectElement(elementID: string): void {
    const elementComponent = this.getElementOverlay(elementID);
    if (elementComponent) {
      this.selectionService.selectElement({ elementComponent: elementComponent, multiSelect: false });
    }
  }

  highlightElement(elementID: string): void {
    const elementComponent = this.getElementOverlay(elementID);
    this.highlightedElementComponent = elementComponent;
    elementComponent?.highlight();
  }

  removeHighlight(): void {
    this.highlightedElementComponent?.removeHighlight();
  }

  /**
   * Only the elements positioned in this section have an overlay, so an ID this section does not
   * render itself -- the child of a compound element, an element already removed -- has none, and
   * both callers have to live with that. Hovering a likert row in the element list called
   * `highlight()` on the missing one and threw (#1078).
   */
  private getElementOverlay(elementID: string): ElementOverlay | undefined {
    return this.sectionComponents.toArray()
      .flatMap(sectionComp => sectionComp.childElementComponents.toArray())
      .find(elComp => elComp.element.id === elementID);
  }

  elementDropped(event: CdkDragDrop<{ pageIndex: number, sectionIndex: number; gridCoordinates?: number[]; }>): void {
    const selectedElements = this.selectionService.getSelectedElements() as PositionedUIElement[];

    if (event.previousContainer !== event.container) {
      this.moveElementsBetweenSections(selectedElements,
                                       event.previousContainer.data.pageIndex,
                                       event.previousContainer.data.sectionIndex,
                                       event.container.data.pageIndex,
                                       event.container.data.sectionIndex);
    } else {
      const page = this.unitService.getSelectedPage();
      selectedElements.forEach((element: PositionedUIElement) => {
        let newXPosition = element.position.xPosition + event.distance.x;
        if (newXPosition < 0) {
          newXPosition = 0;
        }
        if (page.hasMaxWidth && newXPosition > page.maxWidth - element.dimensions.width) {
          newXPosition = page.maxWidth - element.dimensions.width;
        }
        this.elementService.updateElementsPositionProperty([element], 'xPosition', newXPosition);

        let newYPosition = element.position.yPosition + event.distance.y;
        if (newYPosition < 0) {
          newYPosition = 0;
        }
        if (newYPosition > this.getPageHeight() - element.dimensions.height) {
          newYPosition = this.getPageHeight() - element.dimensions.height;
        }
        this.elementService.updateElementsPositionProperty([element], 'yPosition', newYPosition);
      });
    }
  }

  getPageHeight(): number { // TODO weg
    const page = this.unitService.getSelectedPage();
    const reduceFct = (accumulator: number, currentValue: EditorSection) => accumulator + currentValue.height;
    return page.sections.reduce(reduceFct, 0);
  }

  moveElementsBetweenSections(elements: UIElement[], sourcePageIndex: number, sourceSectionIndex: number,
                              targetPageIndex: number, targetSectionIndex: number): void {
    const sourceSection = this.unitService.unit.pages[sourcePageIndex].sections[sourceSectionIndex];
    const targetSection = this.unitService.unit.pages[targetPageIndex].sections[targetSectionIndex];
    this.sectionService.transferElements(elements, sourceSection, targetSection);
    this.selectionService.selectedPageIndex = targetPageIndex;
    this.selectionService.selectedSectionIndex = targetSectionIndex;
  }
}

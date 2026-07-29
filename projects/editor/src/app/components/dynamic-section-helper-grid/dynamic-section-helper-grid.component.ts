import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {
  Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges
} from '@angular/core';
import { UIElement } from 'common/models/elements/element';
import { Section } from 'common/models/section';
import { UnitService } from 'editor/src/app/services/unit.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { UIElementType } from 'common/models/ui-element-interfaces';

@Component({
  selector: '[app-dynamic-section-helper-grid]',
  standalone: false,
  templateUrl: './dynamic-section-helper-grid.component.html',
  styleUrls: ['./dynamic-section-helper-grid.component.scss']
})
export class DynamicSectionHelperGridComponent implements OnInit, OnChanges {
  @Input() autoColumnSize!: boolean;
  @Input() autoRowSize!: boolean;
  @Input() gridColumnSizes!: { value: number; unit: string }[];
  @Input() gridRowSizes!: { value: number; unit: string }[];
  @Input() section!: Section;
  @Input() sectionIndex!: number;
  @Input() pageIndex!: number;
  @Output() transferElement = new EventEmitter<{
    sourcePageIndex: number,
    sourceSectionIndex: number,
    targetPageIndex: number,
    targetSectionIndex: number }>();

  columnCountArray: unknown[] = [];
  rowCountArray: unknown[] = [];

  constructor(public unitService: UnitService, private elementService: ElementService) {}

  ngOnInit(): void {
    this.calculateColumnCount();
    this.calculateRowCount();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.autoColumnSize || changes.gridColumnSizes || changes.gridRowSizes) {
      this.calculateColumnCount();
      this.calculateRowCount();
    }
  }

  refresh(): void {
    this.calculateColumnCount();
    this.calculateRowCount();
  }

  private calculateColumnCount(): void {
    let numberOfColumns;
    if (this.autoColumnSize) {
      numberOfColumns = this.section.elements
        .reduce((accumulator, currentValue) => (
          currentValue.position.gridColumn ?
            Math.max(accumulator, currentValue.position.gridColumn + currentValue.position.gridColumnRange) :
            accumulator
        ),
                0) - 1;
    } else {
      numberOfColumns = this.gridColumnSizes.length;
    }
    this.columnCountArray = Array(Math.max(numberOfColumns, 1));
  }

  private calculateRowCount(): void {
    let numberOfRows;
    if (this.autoRowSize) {
      numberOfRows = this.section.elements
        .reduce((accumulator, currentValue) => (
          currentValue.position.gridRow ?
            Math.max(accumulator, currentValue.position.gridRow + currentValue.position.gridRowRange) :
            accumulator
        ),
                0) - 1;
    } else {
      numberOfRows = this.gridRowSizes.length;
    }
    this.rowCountArray = Array(Math.max(numberOfRows, 1));
  }

  drop(event: CdkDragDrop<{ pageIndex: number, sectionIndex: number; gridCoordinates: number[]; }>): void {
    const dragItemData: { dragType: string; element: UIElement; } = event.item.data;

    // Move element to other section - handled by parent (page-canvas).
    if ((event.previousContainer.data.pageIndex !== event.container.data.pageIndex) ||
        (event.previousContainer.data.sectionIndex !== event.container.data.sectionIndex)) {
      this.transferElement.emit({
        sourcePageIndex: event.previousContainer.data.pageIndex,
        sourceSectionIndex: event.previousContainer.data.sectionIndex,
        targetPageIndex: event.container.data.pageIndex,
        targetSectionIndex: event.container.data.sectionIndex
      });
    }
    if (dragItemData.dragType === 'move') {
      this.elementService.updateElementsPositionProperty(
        [dragItemData.element],
        'gridRow',
        event.container.data.gridCoordinates[0]
      );
      this.elementService.updateElementsPositionProperty(
        [event.item.data.element],
        'gridColumn',
        event.container.data.gridCoordinates[1]
      );
    } else {
      /* There used to be a 'resize' branch here, marked "TODO unused". It was: nothing in the
         editor ever sets that drag type - both overlays drag with 'move' - and it wrote
         'gridColumnEnd' and 'gridRowEnd', which are not properties of PositionProperties at all
         (the interface has gridColumn/gridColumnRange and gridRow/gridRowRange). So it would have
         put two stray keys on the position group and moved nothing. Removed rather than repaired,
         because there is no caller to repair it for; an unimplemented drag type now reaches the
         error below, which is what the spec already expects for unknown ones. */
      throw new Error('Unknown drop event');
    }
  }

  newElementDropped(event: DragEvent, gridX: number, gridY: number): void {
    event.preventDefault();
    this.elementService.addElementToSection(
      event.dataTransfer?.getData('elementType') as UIElementType,
      this.section,
      { x: gridX, y: gridY }
    );
  }
}

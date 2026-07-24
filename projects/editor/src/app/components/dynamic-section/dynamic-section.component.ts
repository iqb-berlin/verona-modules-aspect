import {
  Component, Input, Output, EventEmitter,
  ViewChildren, QueryList, ViewChild
} from '@angular/core';
import { Section } from 'common/models/section';
import { DragNDropService } from 'editor/src/app/services/drag-n-drop.service';
import { ElementOverlay } from 'editor/src/app/directives/element-overlay.directive';
import { DynamicSectionHelperGridComponent } from 'editor/src/app/components/dynamic-section-helper-grid/dynamic-section-helper-grid.component';

@Component({
  selector: 'aspect-editor-dynamic-section',
  standalone: false,
  templateUrl: './dynamic-section.component.html'
})
export class DynamicSectionComponent {
  @Input() section!: Section;
  @Input() sectionIndex!: number;
  @Input() pageIndex!: number;
  @Input() dropListList!: string[];
  @Input() isSelected!: boolean;
  @Output() elementSelected = new EventEmitter();
  @Output() transferElement = new EventEmitter<{
    sourcePageIndex: number,
    sourceSectionIndex: number,
    targetPageIndex: number,
    targetSectionIndex: number }>();

  @ViewChild(DynamicSectionHelperGridComponent) helperGrid!: DynamicSectionHelperGridComponent;
  @ViewChildren('elementComponent') childElementComponents!: QueryList<ElementOverlay>;

  constructor(protected dragNDropService: DragNDropService) { }
}

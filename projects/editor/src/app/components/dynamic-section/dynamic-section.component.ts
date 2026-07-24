import {
  Component, Input, Output, EventEmitter,
  ViewChildren, QueryList, ViewChild
} from '@angular/core';
import { NgForOf } from '@angular/common';
import { Section } from 'common/models/section';
import { DragNDropService } from 'editor/src/app/services/drag-n-drop.service';
import { ElementOverlay } from 'editor/src/app/directives/element-overlay.directive';
import {
  DynamicOverlayComponent
} from 'editor/src/app/components/unit-view/element-overlay/dynamic-overlay/dynamic-overlay.component';
import { CdkDropList } from '@angular/cdk/drag-drop';
import {
  ElementGridChangeListenerDirective
} from 'editor/src/app/directives/element-grid-change-listener.directive';
import { SharedModule } from 'common/shared.module';
import { DynamicSectionHelperGridComponent } from 'editor/src/app/components/unit-view/section/dynamic-section-helper-grid/dynamic-section-helper-grid.component';

@Component({
  selector: 'aspect-editor-dynamic-section',
  imports: [
    SharedModule,
    DynamicSectionHelperGridComponent,
    DynamicOverlayComponent,
    NgForOf,
    CdkDropList,
    ElementGridChangeListenerDirective
  ],
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

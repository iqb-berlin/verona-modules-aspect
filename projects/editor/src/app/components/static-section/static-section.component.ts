import {
  Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren
} from '@angular/core';
import { Section } from 'common/models/section';
import { UnitService } from 'editor/src/app/services/unit.service';
import { ElementOverlay } from 'editor/src/app/directives/element-overlay.directive';
import { ElementService } from 'editor/src/app/services/element.service';
import {
  StaticOverlayComponent
} from 'editor/src/app/components/unit-view/element-overlay/static-overlay/static-overlay.component';
import { NgForOf } from '@angular/common';
import { UIElementType } from 'common/models/ui-element-interfaces';

@Component({
  selector: 'aspect-editor-static-section',
  imports: [
    NgForOf,
    StaticOverlayComponent
  ],
  templateUrl: './static-section.component.html',
  styleUrls: ['./static-section.component.scss']
})
export class StaticSectionComponent {
  @Input() section!: Section;
  @Input() isSelected!: boolean;
  @Output() elementSelected = new EventEmitter<unknown>();
  @ViewChild('sectionElement') sectionElement!: ElementRef;
  @ViewChildren('elementComponent') childElementComponents!: QueryList<ElementOverlay>;

  constructor(public unitService: UnitService, private elementService: ElementService) { }

  newElementDropped(event: DragEvent): void {
    event.preventDefault();
    const sectionRect = this.sectionElement.nativeElement.getBoundingClientRect();
    this.elementService.addElementToSection(
      event.dataTransfer?.getData('elementType') as UIElementType,
      this.section,
      { x: event.clientX - Math.round(sectionRect.left), y: event.clientY - Math.round(sectionRect.top) }
    );
  }
}

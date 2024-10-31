import {
  Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren
} from '@angular/core';
import { Section } from 'common/models/section';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { ElementOverlay } from 'editor/src/app/components/unit-view/element-overlay/element-overlay.directive';
import { ElementService } from 'editor/src/app/services/unit-services/element.service';
import {
  StaticOverlayComponent
} from 'editor/src/app/components/unit-view/element-overlay/static-overlay.component';
import { NgForOf } from '@angular/common';
import { UIElementType } from 'common/interfaces';

@Component({
  selector: 'aspect-editor-static-section',
  standalone: true,
  imports: [
    NgForOf,
    StaticOverlayComponent
  ],
  template: `
    <div #sectionElement class="section-wrapper"
         [style.outline]="isSelected ? '2px solid #ff4081': '1px dotted'"
         [style.z-index]="isSelected ? 1 : 0"
         [style.height.px]="section.height"
         [style.background-color]="section.backgroundColor"
         (dragover)="$event.preventDefault()" (drop)="newElementDropped($event)">
      <aspect-editor-static-overlay #elementComponent
                                    *ngFor="let element of section.elements"
                                    [element]="$any(element)"
                                    (elementSelected)="elementSelected.emit($event)">
      </aspect-editor-static-overlay>
    </div>
  `,
  styles: [
    '.section-wrapper {position: relative; width: 100%; overflow: hidden;}'
  ]
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

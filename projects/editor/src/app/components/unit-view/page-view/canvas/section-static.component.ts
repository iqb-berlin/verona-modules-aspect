import {
  Component, ElementRef, Input, ViewChild
} from '@angular/core';
import { UnitService } from '../../../../services/unit.service';
import { Section } from '../../../../../../../common/models/section';
import { UIElementType } from '../../../../../../../common/models/uI-element';
import { SelectionService } from '../../../../services/selection.service';

@Component({
  selector: 'app-section-static',
  template: `
    <div #sectionElement class="section-wrapper"
         [style.outline]="isSelected ? '2px solid #ff4081': '1px dotted'"
         [style.z-index]="isSelected ? 1 : 0"
         [style.height.px]="section.height"
         [style.background-color]="section.backgroundColor"
         (dragover)="$event.preventDefault()" (drop)="newElementDropped($event)">
      <app-static-canvas-overlay
        *ngFor="let element of section.elements"
        [element]="$any(element)"
        (elementSelected)="selectionService.selectElement($event);
                           selectionService.selectedPageSectionIndex = sectionIndex">
      </app-static-canvas-overlay>
    </div>
  `,
  styles: [
    '.section-wrapper {position: relative; width: 100%; overflow: hidden;}'
  ]
})
export class SectionStaticComponent {
  @Input() section!: Section;
  @Input() sectionIndex!: number;
  @Input() isSelected!: boolean;
  @ViewChild('sectionElement') sectionElement!: ElementRef;

  constructor(public unitService: UnitService, public selectionService: SelectionService) { }

  newElementDropped(event: DragEvent): void {
    event.preventDefault();
    const sectionRect = this.sectionElement.nativeElement.getBoundingClientRect();
    this.unitService.addElementToSection(
      event.dataTransfer?.getData('elementType') as UIElementType,
      this.section,
      { x: event.clientX - Math.round(sectionRect.left), y: event.clientY - Math.round(sectionRect.top) }
    );
  }
}

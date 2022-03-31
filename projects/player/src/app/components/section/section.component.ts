import {
  Component, Inject, Input
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Section } from '../../../../../common/interfaces/unit';

@Component({
  selector: 'aspect-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.css']
})
export class SectionComponent {
  @Input() section!: Section;
  @Input() pageIndex!: number;

  constructor(@Inject(DOCUMENT) public document: Document) {}
}

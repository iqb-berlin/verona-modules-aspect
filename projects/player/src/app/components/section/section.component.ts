import { Component, Input } from '@angular/core';
import { Section } from 'common/classes/unit';

@Component({
  selector: 'aspect-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.css']
})
export class SectionComponent {
  @Input() section!: Section;
  @Input() pageIndex!: number;
}

import {
  Component, Inject, Input, OnInit
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { Section } from '../../../../../common/interfaces/unit';

@Component({
  selector: 'aspect-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.css']
})
export class SectionComponent {
  @Input() parentForm!: FormGroup;
  @Input() section!: Section;
  @Input() parentArrayIndex!: number;
  @Input() pageIndex!: number;

  constructor(@Inject(DOCUMENT) public document: Document) {}
}

import { Component, Input, OnInit } from '@angular/core';
import { Section } from 'common/models/section';
import { SectionCounter } from 'common/util/section-counter';

@Component({
  selector: 'aspect-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss']
})
export class SectionComponent implements OnInit {
  @Input() section!: Section;
  @Input() pageIndex!: number;
  @Input() sectionNumbering: {
    enableSectionNumbering: boolean, sectionNumberingPosition: 'left' | 'above'
  } | undefined;

  sectionCounter: number | undefined;

  ngOnInit(): void {
    if (this.sectionNumbering?.enableSectionNumbering && !this.section.ignoreNumbering) {
      this.sectionCounter = SectionCounter.getNext();
    }
  }
}

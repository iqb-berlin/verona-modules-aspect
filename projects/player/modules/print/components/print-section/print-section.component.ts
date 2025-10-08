import { Component, Input, OnInit } from '@angular/core';
import { Section } from 'common/models/section';
import { SectionCounter } from 'common/util/section-counter';
import { PrintMode } from 'player/modules/verona/models/verona';

@Component({
    selector: 'aspect-print-section',
    templateUrl: './print-section.component.html',
    styleUrls: ['./print-section.component.scss'],
    standalone: false
})
export class PrintSectionComponent implements OnInit {
  @Input() printMode!: PrintMode;
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

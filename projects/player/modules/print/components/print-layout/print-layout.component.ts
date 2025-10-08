import { Component, Input } from '@angular/core';
import { Page } from 'common/models/page';
import { PrintMode } from 'player/modules/verona/models/verona';

@Component({
    selector: 'aspect-print-layout',
    templateUrl: './print-layout.component.html',
    styleUrl: './print-layout.component.scss',
    standalone: false
})
export class PrintLayoutComponent {
  @Input() pages!: Page[];
  @Input() printMode!: PrintMode;
  @Input() sectionNumbering!: { enableSectionNumbering: boolean, sectionNumberingPosition: 'left' | 'above' };
}

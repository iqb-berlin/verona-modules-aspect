import { Component, Input } from '@angular/core';
import { UnitPage } from '../../../common/unit';

@Component({
  selector: 'app-page',
  template: `
    <app-section *ngFor="let section of page.sections; let i = index"
         [section]="section"
         [ngStyle]="{
                width: '100%',
                position: 'relative',
                display: 'inline-block',
                'height.px': section.height }">
      {{section.height}}
    </app-section>
  `
})

export class PageComponent {
  @Input() page!: UnitPage;
}

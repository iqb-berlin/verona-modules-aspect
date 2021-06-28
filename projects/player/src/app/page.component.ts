import { Component, Input } from '@angular/core';
import { UnitPage } from '../../../common/unit';

@Component({
  selector: 'app-page',
  template: `
    <app-section *ngFor="let section of page.sections; let i = index"
         [section]="section"
         [ngStyle]="{
                width: '100%',
                'height.px': section.height }">
    </app-section>
  `
})

export class PageComponent {
  @Input() page!: UnitPage;
}

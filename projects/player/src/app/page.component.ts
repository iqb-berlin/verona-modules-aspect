import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UnitPage } from '../../../common/unit';

@Component({
  selector: 'app-page',
  template: `
      <app-section *ngFor="let section of page.sections; let i = index"
                   [parentForm]="parentForm"
                   [section]="section"
                   [ngStyle]="{
                position: 'relative',
                display: 'inline-block',
                'background-color': section.backgroundColor,
                'height.px': section.height,
                'width.px': section.width }">
          {{section.height}}
      </app-section>
  `
})

export class PageComponent {
  @Input() page!: UnitPage;
  @Input() parentForm!: FormGroup;
}

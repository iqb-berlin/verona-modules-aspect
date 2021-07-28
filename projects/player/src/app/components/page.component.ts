import {
  Component, Input, OnInit
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UnitPage } from '../../../../common/unit';
import { FormService } from '../../../../common/form.service';

@Component({
  selector: 'app-page',
  template: `
      <app-section *ngFor="let section of page.sections; let i = index"
                   [parentForm]="pageForm"
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

export class PageComponent implements OnInit {
  @Input() page!: UnitPage;
  @Input() parentForm!: FormGroup;
  pageForm!: FormGroup;

  constructor(private formService: FormService) {}

  ngOnInit(): void {
    this.pageForm = new FormGroup({});
    this.formService.registerFormGroup({ id: this.page.id, formGroup: this.pageForm });
  }
}

import {
  Component, Input, OnInit
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UnitPage } from '../../../../common/unit';
import { FormService } from '../../../../common/form.service';

@Component({
  selector: 'app-page',
  template: `
    <app-section *ngFor="let section of page.sections; let i = index; let last = last"
                 [parentForm]="pageForm"
                 [pagesContainer]="pagesContainer"
                 [lastSection]="last"
                 (pagePresented)="onPagePresented($event)"
                 [parentArrayIndex]="i"
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
  @Input() parentArrayIndex!: number;
  @Input() pagesContainer!: HTMLElement;
  pageForm!: FormGroup;

  constructor(private formService: FormService,
              private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.pageForm = this.formBuilder.group({
      id: this.page.id,
      sections: this.formBuilder.array([])
    });
    this.formService.registerFormGroup({
      formGroup: this.pageForm,
      parentForm: this.parentForm,
      parentArray: 'pages',
      parentArrayIndex: this.parentArrayIndex
    });
  }

  onPagePresented(pagePresented: number): void {
    this.formService.setPresentedPage(pagePresented);
  }
}

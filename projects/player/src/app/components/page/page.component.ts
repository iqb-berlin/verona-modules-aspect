import {
  Component, Input, OnInit
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UnitPage } from '../../../../../common/unit';
import { FormService } from '../../../../../common/form.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html'
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

  onPagePresented(): void {
    this.formService.addPresentedPage(this.parentArrayIndex);
  }
}

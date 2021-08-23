import {
  Component, Input, OnInit, Output, EventEmitter
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
  @Input() isLastPage!: boolean;
  @Input() parentForm!: FormGroup;
  @Input() parentArrayIndex!: number;
  @Input() index!: number;
  @Input() pagesContainer!: HTMLElement;
  @Output() selectedIndexChange = new EventEmitter<number>();
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

  onIntersection(detectionType: 'top' | 'bottom'): void {
    if (detectionType === 'bottom') {
      this.formService.addPresentedPage(this.index);
    }
    if (detectionType === 'top' || this.isLastPage) {
      this.selectedIndexChange.emit(this.index);
    }
  }
}

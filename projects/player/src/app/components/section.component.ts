import {
  Component, Input, OnInit
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UnitPageSection } from '../../../../common/unit';
import { FormService } from '../../../../common/form.service';

@Component({
  selector: 'app-section',
  template: `
    <app-element-overlay
        *ngFor="let element of section.elements; let i = index"
        [elementModel]="element"
        [parentForm]="sectionForm"
        [parentArrayIndex]="i">
    </app-element-overlay>
  `
})
export class SectionComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Input() section!: UnitPageSection;
  @Input() sectionForm!: FormGroup;
  @Input() parentArrayIndex!: number;

  constructor(private formService: FormService, private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.sectionForm = new FormGroup({
      elements: this.formBuilder.array([])
    });
    this.formService.registerFormGroup({
      formGroup: this.sectionForm,
      parentForm: this.parentForm,
      parentArray: 'sections',
      parentArrayIndex: this.parentArrayIndex
    });
  }
}

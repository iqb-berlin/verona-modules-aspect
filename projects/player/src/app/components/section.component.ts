import {
  Component, Input, OnInit
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UnitPageSection } from '../../../../common/unit';
import { FormService } from '../../../../common/form.service';

@Component({
  selector: 'app-section',
  template: `
    <app-element-overlay
        *ngFor="let element of section.elements"
        [elementModel]="element"
        [parentForm]="sectionForm">
    </app-element-overlay>
  `
})
export class SectionComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Input() id!: string;
  @Input() section!: UnitPageSection;
  @Input() sectionForm!: FormGroup;

  constructor(private formService: FormService) {}

  ngOnInit(): void {
    this.sectionForm = new FormGroup({});
    this.formService.registerFormGroup({
      id: this.id,
      formGroup: this.sectionForm,
      parentForm: this.parentForm,
      parentArray: 'sections'
    });
  }
}

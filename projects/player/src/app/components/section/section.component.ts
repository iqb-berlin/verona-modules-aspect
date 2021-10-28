import {
  Component, Inject, Input, OnInit
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { FormService } from '../../services/form.service';
import { Section } from '../../../../../common/models/section';
import { UnitStateService } from '../../services/unit-state.service';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html'
})
export class SectionComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Input() section!: Section;
  @Input() parentArrayIndex!: number;

  sectionForm!: FormGroup;

  constructor(private formService: FormService,
              private formBuilder: FormBuilder,
              private unitStateService: UnitStateService,
              @Inject(DOCUMENT) public document: Document) {
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

  onIntersection(detection: { detectionType: 'top' | 'bottom' | 'full', id: string }): void {
    this.unitStateService.changeElementStatus({ id: detection.id, status: 'DISPLAYED' });
  }
}

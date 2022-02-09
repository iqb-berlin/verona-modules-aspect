import {
  Component, Inject, Input, OnInit
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { FormService } from '../../services/form.service';
import { Section } from '../../../../../common/models/section';

@Component({
  selector: 'aspect-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.css']
})
export class SectionComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Input() section!: Section;
  @Input() parentArrayIndex!: number;
  @Input() pageIndex!: number;

  sectionForm!: FormGroup;

  constructor(private formService: FormService,
              private formBuilder: FormBuilder,
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
}

import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UnitUIElement } from '../../../../../common/unit';
import { FormService } from '../../../../../common/form.service';

@Component({
  selector: 'app-element',
  templateUrl: './element.component.html',
  styleUrls: ['./element.component.css']
})
export class ElementComponent implements OnInit {
  @Input() elementModel!: UnitUIElement;
  @Input() parentForm!: FormGroup;
  @Input() parentArrayIndex!: number;

  isInputElement!: boolean;
  elementForm!: FormGroup;

  constructor(private formService: FormService,
              private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.isInputElement = Object.prototype.hasOwnProperty.call(this.elementModel, 'required');
    if (this.isInputElement) {
      this.registerFormGroup();
    }
  }

  private registerFormGroup(): void {
    this.elementForm = this.formBuilder.group({});
    this.formService.registerFormGroup({
      formGroup: this.elementForm,
      parentForm: this.parentForm,
      parentArray: 'elements',
      parentArrayIndex: this.parentArrayIndex
    });
  }
}

import {
  Directive, OnInit, ViewChild, ViewContainerRef
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { UnitUIElement } from './unit';
import { FormService } from './form.service';

@Directive()
export abstract class CanvasElementComponent implements OnInit {
  elementModel!: UnitUIElement;
  formControl!: FormControl;
  parentForm!: FormGroup;
  @ViewChild('inputElement', { read: ViewContainerRef, static: true }) inputElement!: ViewContainerRef;

  constructor(private formService: FormService) { }

  ngOnInit(): void {
    this.formService.controlAdded.next(this.elementModel.id);
    this.formControl = this.getFormControl(this.elementModel.id);
    this.formControl.valueChanges.subscribe(v => this.onModelChange(v)); // TODO besserer Variablenname
  }

  private getFormControl(id: string): FormControl {
    return (this.parentForm) ? this.parentForm.controls[id] as FormControl : new FormControl();
  }

  private onModelChange(value: any): void { // TODO any
    const element = this.elementModel.id;
    this.formService.elementValueChanged.next({ element, value }); // TODO subjects nach außen geben ist bad practice
  }
}

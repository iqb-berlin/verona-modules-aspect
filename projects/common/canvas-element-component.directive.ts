import {
  Directive, OnInit, ViewChild, ViewContainerRef
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { UnitUIElement } from './unit';
import { FormService } from './form.service';

@Directive()
export abstract class CanvasElementComponent implements OnInit {
  @ViewChild('inputElement', { read: ViewContainerRef, static: true }) public inputElement!: ViewContainerRef;
  elementModel!: UnitUIElement;
  formControl!: FormControl;
  style!: Record<string, string>;
  parentForm!: FormGroup;

  constructor(private formService: FormService) { }

  ngOnInit(): void {
    this.formService.controlAdded.next(this.elementModel.id);
    this.formControl = this.getFormControl(this.elementModel.id);
    this.formControl.valueChanges.subscribe(v => this.onModelChange(v));
    this.updateStyle();
  }

  private getFormControl(id: string){
    return (this.parentForm) ? this.parentForm.controls[id] as FormControl : new FormControl();
  }

  private onModelChange(value: any): void {
    const element = this.elementModel.id;
    this.formService.elementValueChanged.next({ element, value });
  }

  updateStyle(newProperties: Record<string, string> = {}): void {
    this.style = {
      width: `${this.elementModel.width}px`,
      height: `${this.elementModel.height}px`,
      'background-color': this.elementModel.backgroundColor,
      color: this.elementModel.fontColor,
      'font-family': this.elementModel.font,
      'font-size': `${this.elementModel.fontSize}px`,
      'font-weight': this.elementModel.bold ? 'bold' : '',
      'font-style': this.elementModel.italic ? 'italic' : '',
      'text-decoration': this.elementModel.underline ? 'underline' : '',
      ...this.style,
      ...newProperties
    };
  }
}

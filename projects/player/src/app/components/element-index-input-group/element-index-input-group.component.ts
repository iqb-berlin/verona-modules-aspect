import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  DropListElement,
  RadioButtonGroupComplexElement,
  RadioButtonGroupElement, ToggleButtonElement,
  UIElement
} from '../../../../../common/interfaces/elements';

@Component({
  selector: 'aspect-element-index-input-group',
  templateUrl: './element-index-input-group.component.html',
  styleUrls: ['./element-index-input-group.component.scss']
})
export class ElementIndexInputGroupComponent implements OnInit {
  @Input() elementModel!: UIElement;
  RadioButtonGroupElement!: RadioButtonGroupElement;
  RadioButtonGroupComplexElement!: RadioButtonGroupComplexElement;
  ToggleButtonElement!: ToggleButtonElement;
  DropListElement!: DropListElement;


  form!: FormGroup;


  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({});
  }

}

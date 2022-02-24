import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  CheckboxElement, DropListElement,
  SliderElement,
  SpellCorrectElement,
  UIElement
} from '../../../../../common/interfaces/elements';

@Component({
  selector: 'aspect-element-input-group',
  templateUrl: './element-input-group.component.html',
  styleUrls: ['./element-input-group.component.scss']
})
export class ElementInputGroupComponent implements OnInit {
  @Input() elementModel!: UIElement;
  CheckboxElement!: CheckboxElement;
  SpellCorrectElement!: SpellCorrectElement;
  SliderElement!: SliderElement;
  DropListElement!: DropListElement;

  form!: FormGroup;


  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({});
  }

}

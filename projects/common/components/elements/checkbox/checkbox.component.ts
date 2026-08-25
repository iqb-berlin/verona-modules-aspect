import { Component, Input, OnInit } from '@angular/core';
import { CheckboxElement } from 'common/models/elements/checkbox';
import { FormElementComponent } from 'common/directives/form-element-component.directive';

@Component({
  selector: 'aspect-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  standalone: false
})
export class CheckboxComponent extends FormElementComponent implements OnInit {
  @Input() elementModel!: CheckboxElement;
  @Input() tableMode: boolean = false;
  @Input() clozeContext: boolean = false;
}

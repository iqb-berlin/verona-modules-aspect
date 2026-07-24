import { Component, Input } from '@angular/core';
import { DropdownElement } from 'common/models/elements/input-elements/dropdown';
import { FormElementComponent } from 'common/directives/form-element-component.directive';

@Component({
  selector: 'aspect-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  standalone: false
})
export class DropdownComponent extends FormElementComponent {
  @Input() elementModel!: DropdownElement;
  @Input() clozeContext: boolean = false;
}

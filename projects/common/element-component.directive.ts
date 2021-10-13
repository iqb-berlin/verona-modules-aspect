import {
  Directive
} from '@angular/core';
import { UIElement } from './classes/uIElement';

@Directive()
export abstract class ElementComponent {
  abstract elementModel: UIElement;
}

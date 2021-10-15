import {
  Directive
} from '@angular/core';
import { UIElement } from './classes/uI-element';

@Directive()
export abstract class ElementComponent {
  abstract elementModel: UIElement;
}

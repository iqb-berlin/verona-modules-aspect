import {
  Directive
} from '@angular/core';
import { UIElement } from './models/uI-element';

@Directive()
export abstract class ElementComponent {
  abstract elementModel: UIElement;
}

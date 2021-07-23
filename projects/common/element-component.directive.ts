import {
  Directive
} from '@angular/core';
import { UnitUIElement } from './unit';

@Directive()
export abstract class ElementComponent {
  abstract elementModel: UnitUIElement;
}

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import {
  ButtonElement, LabelElement, TextFieldElement, Unit, UnitPage, UnitUIElement
} from './model/unit';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  activeUnit: Unit;
  activePageIndex: number;
  newElement = new Subject<UnitUIElement>();
  elementSelected = new Subject<UnitUIElement | undefined>();
  pageSelected = new Subject<UnitPage>();
  propertyChanged = new Subject();

  constructor() {
    this.activeUnit = new Unit();
    this.activeUnit.pages.push(new UnitPage());
    this.activePageIndex = 0;
  }

  addPage(): void {
    this.activeUnit.pages.push(new UnitPage());
  }

  addPageElement(elementType: string): void {
    let newElement: UnitUIElement;
    switch (elementType) {
      case 'label':
        newElement = new LabelElement('dummyID', 'GGG');
        break;
      case 'button':
        newElement = new ButtonElement('dummyID', 'GGG');
        break;
      case 'text-field':
        newElement = new TextFieldElement('dummyID', 'GGG');
        break;
    }
    this.activeUnit.pages[this.activePageIndex].elements.push(newElement!);
    this.newElement.next(newElement!);
  }

  switchPage(selectedIndex: number): void {
    this.activePageIndex = selectedIndex;
    this.pageSelected.next(this.activeUnit.pages[this.activePageIndex]);
  }

  propertyChange(): void {
    this.propertyChanged.next();
  }
}

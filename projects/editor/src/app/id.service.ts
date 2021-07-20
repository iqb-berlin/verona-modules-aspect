import { Injectable } from '@angular/core';
import {
  Unit, UnitPage, UnitPageSection, UnitUIElement
} from '../../../common/unit';

@Injectable({
  providedIn: 'root'
})
export class IdService {
  private givenIDs: string[] = [];
  private idCounter: Record<string, number> = {
    text: 0,
    button: 0,
    'text-field': 0,
    'text-area': 0,
    checkbox: 0,
    dropdown: 0,
    radio: 0,
    image: 0,
    audio: 0,
    video: 0,
    correction: 0
  };

  getNewID(type: string): string {
    do {
      this.idCounter[type] += 1;
    }
    while (!this.isIdAvailable(`${type}_${this.idCounter[type]}`));
    this.givenIDs.push(`${type}_${this.idCounter[type]}`);
    return `${type}_${this.idCounter[type]}`;
  }

  readExistingIDs(unit: Unit): void {
    unit.pages.forEach((page: UnitPage) => {
      page.sections.forEach((section: UnitPageSection) => {
        section.elements.forEach((element: UnitUIElement) => {
          this.givenIDs.push(element.id);
        });
      });
    });
  }

  isIdAvailable(value: string): boolean {
    return !this.givenIDs.includes(value);
  }

  addId(id: string): void {
    this.givenIDs.push(id);
  }

  removeId(id: string): void {
    const index = this.givenIDs.indexOf(id, 0);
    if (index > -1) {
      this.givenIDs.splice(index, 1);
    }
  }
}

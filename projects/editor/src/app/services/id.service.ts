import { Injectable } from '@angular/core';
import { Unit } from 'common/models/unit';
import { UIElement } from 'common/models/elements/element';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { MessageService } from 'common/services/message.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class IDService {
  maxIDLength = 20;
  givenIDs: string[] = [];
  private idCounter: Record<string, number> = {
    text: 0,
    button: 0,
    'text-field': 0,
    'text-field-simple': 0,
    'number-field': 0,
    'text-area': 0,
    checkbox: 0,
    dropdown: 0,
    radio: 0,
    'hotspot-image': 0,
    image: 0,
    audio: 0,
    video: 0,
    likert: 0,
    'likert-row': 0,
    slider: 0,
    'spell-correct': 0,
    'radio-group-images': 0,
    'drop-list': 0,
    cloze: 0,
    frame: 0,
    'toggle-button': 0,
    geometry: 0,
    'math-field': 0,
    'math-table': 0,
    value: 0,
    'state-variable': 0,
    'text-area-math': 0,
    trigger: 0
  };

  constructor(private messageService: MessageService, private translateService: TranslateService) { }

  validateAndAddNewID(newId: string, oldId: string): boolean {
    if (!this.isIdAvailable(newId)) { // prohibit existing IDs
      this.messageService.showError(this.translateService.instant('idTaken'));
    } else if (newId.length > this.maxIDLength) {
      this.messageService.showError('ID länger als 20 Zeichen');
    } else if (newId.includes(' ')) {
      this.messageService.showError('ID enthält unerlaubtes Leerzeichen');
    } else {
      this.removeId(oldId);
      this.addID(newId as string);
      return true;
    }
    return false;
  }

  getNewID(type: string): string {
    if (!type) {
      throw Error('ID-Service: No type given!');
    }
    if (Object.keys(this.idCounter).indexOf(type) === -1) {
      throw Error(`Invalid Type: ${type}`);
    }
    do {
      this.idCounter[type] += 1;
    } while (!this.isIdAvailable(`${type}_${this.idCounter[type]}`));
    return `${type}_${this.idCounter[type]}`;
  }

  getAndRegisterNewID(elementType: string): string {
    const newID = this.getNewID(elementType);
    this.addID(newID);
    return newID;
  }

  addID(id: string): void {
    if (this.givenIDs.includes(id)) throw Error(`ID already given: ${id}`);
    this.givenIDs.push(id);
  }

  isIdAvailable(value: string): boolean {
    return !this.givenIDs.includes(value);
  }

  /* Remove ID from givenIDs, so it can be used again. */
  removeId(id: string): void {
    this.givenIDs.splice(this.givenIDs.indexOf(id, 0), 1);
  }

  reset(): void {
    Object.keys(this.idCounter).forEach(counter => {
      this.idCounter[counter] = 0;
    });
    this.givenIDs = [];
  }

  registerUnitIds(unit: Unit) {
    unit.getAllElements().forEach(element => {
      this.addID(element.id);
      if (['drop-list', 'drop-list-simple'].includes((element as UIElement).type as string)) {
        (element as DropListElement).value.forEach(value => this.addID(value.id));
      }
    });
  }
}

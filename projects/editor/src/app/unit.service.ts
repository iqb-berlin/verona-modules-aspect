import { Injectable } from '@angular/core';
import {
  BehaviorSubject, Observable
} from 'rxjs';
import {
  Unit, UnitPage, UnitPageSection, UnitUIElement
} from '../../../common/unit';
import { FileService } from '../../../common/file.service';
import * as UnitFactory from './model/UnitFactory';
import { MessageService } from '../../../common/message.service';
import { IdService } from './id.service';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private _unit: BehaviorSubject<Unit>;
  private _selectedPageIndex: BehaviorSubject<number>;
  private _pages: BehaviorSubject<UnitPage>[];

  private _selectedPageSectionIndex: BehaviorSubject<number>;

  private _selectedElements: BehaviorSubject<UnitUIElement[]>;

  constructor(private messageService: MessageService, private idService: IdService) {
    const initialUnit = UnitFactory.createUnit();
    const initialPage = UnitFactory.createUnitPage();
    const initialSection = UnitFactory.createUnitPageSection();
    initialPage.sections.push(initialSection);
    initialUnit.pages.push(initialPage);

    this._unit = new BehaviorSubject(initialUnit);
    this._pages = [new BehaviorSubject(initialPage as UnitPage)];
    this._selectedPageIndex = new BehaviorSubject(0);

    this._selectedPageSectionIndex = new BehaviorSubject<number>(0);
    this._selectedElements = new BehaviorSubject<UnitUIElement[]>([]);
  }

  get unit(): Observable<Unit> {
    return this._unit.asObservable();
  }

  get selectedPageIndex(): Observable<number> {
    return this._selectedPageIndex.asObservable();
  }

  get selectedPageSectionIndex(): Observable<number> {
    return this._selectedPageSectionIndex.asObservable();
  }

  getPageObservable(index: number): Observable<UnitPage> {
    return this._pages[index].asObservable();
  }

  get selectedElements(): Observable<UnitUIElement[]> {
    return this._selectedElements.asObservable();
  }

  getSelectedElements(): UnitUIElement[] {
    return this._selectedElements.value;
  }

  getSelectedPageSection(): UnitPageSection {
    return this._unit.value.pages[this._selectedPageIndex.value].sections[this._selectedPageSectionIndex.value];
  }

  addPage(): void {
    const newPage = UnitFactory.createUnitPage();
    newPage.sections.push(UnitFactory.createUnitPageSection());
    this._unit.value.pages.push(newPage);
    this._pages.push(new BehaviorSubject(newPage as UnitPage));

    this._unit.next(this._unit.value);
    this._selectedPageIndex.next(this._unit.value.pages.length - 1);
  }

  deletePage(index: number = this._selectedPageIndex.value): void {
    this._unit.value.pages.splice(index, 1);
    this._pages.splice(index, 1);

    this._unit.next(this._unit.value);
    if (index === this._selectedPageIndex.value) {
      this._selectedPageIndex.next(this._selectedPageIndex.value - 1);
    }
  }

  addSection(): void {
    const newSection = UnitFactory.createUnitPageSection();
    this._unit.value.pages[this._selectedPageIndex.value].sections.push(newSection);
    this._unit.next(this._unit.value);
    this._pages[this._selectedPageIndex.value].next(this._unit.value.pages[this._selectedPageIndex.value]); // TODO auslagern?
  }

  deleteSection(): void {
    if (this._unit.value.pages[this._selectedPageIndex.value].sections.length < 2) {
      this.messageService.showWarning('cant delete last section');
    } else {
      const index = this._selectedPageSectionIndex.value;
      this._unit.value.pages[this._selectedPageIndex.value].sections.splice(index, 1);
      this._unit.next(this._unit.value);

      this._pages[this._selectedPageIndex.value].next(this._unit.value.pages[this._selectedPageIndex.value]);
      if (this._selectedPageSectionIndex.value > 0) {
        this._selectedPageSectionIndex.next(this._selectedPageSectionIndex.value - 1);
      }
    }
  }

  async addPageElement(elementType: string): Promise<void> {
    let newElement: UnitUIElement;
    switch (elementType) {
      case 'text':
        newElement = UnitFactory.createTextElement();
        break;
      case 'button':
        newElement = UnitFactory.createButtonElement();
        break;
      case 'text-field':
        newElement = UnitFactory.createTextfieldElement();
        break;
      case 'checkbox':
        newElement = UnitFactory.createCheckboxElement();
        break;
      case 'dropdown':
        newElement = UnitFactory.createDropdownElement();
        break;
      case 'radio':
        newElement = UnitFactory.createRadioButtonGroupElement();
        break;
      case 'image':
        newElement = UnitFactory.createImageElement(await FileService.loadImage());
        break;
      case 'audio':
        newElement = UnitFactory.createAudioElement(await FileService.loadAudio());
        break;
      case 'video':
        newElement = UnitFactory.createVideoElement(await FileService.loadVideo());
        break;
      case 'correction':
        newElement = UnitFactory.createCorrectionElement();
        break;
      default:
        throw new Error(`ElementType ${elementType} not found!`);
    }
    newElement.id = this.idService.getNewID(elementType);
    this._unit.value.pages[this._selectedPageIndex.value]
      .sections[this._selectedPageSectionIndex.value].elements.push(newElement!);

    this._pages[this._selectedPageIndex.value].next(this._unit.value.pages[this._selectedPageIndex.value]);
  }

  clearSelectedElements(): void {
    this._selectedElements.next([]);
  }

  selectElement(elementModel: UnitUIElement): void {
    this._selectedElements.next([...this._selectedElements.getValue(), elementModel]);
  }

  updateSelectedElementProperty(property: string, value: string | number | boolean): boolean {
    // eslint-disable-next-line no-restricted-syntax
    for (const element of this._selectedElements.value) {
      if (['string', 'number', 'boolean'].indexOf(typeof element[property]) > -1) {
        if (property === 'id') {
          if (!this.idService.isIdAvailable((value as string))) { // prohibit existing IDs
            this.messageService.showError('ID ist bereits vergeben');
            return false;
          }
          this.idService.removeId(element[property]);
          this.idService.addId(<string>value);
        }
        element[property] = value;
      } else if (Array.isArray(element[property])) {
        (element[property] as string[]).push(value as string);
      }
    }
    this._selectedElements.next(this._selectedElements.value); // hack to notify properties panel about change
    return true;
  }

  deleteSelectedElements(): void {
    const oldElements = this._unit.value.pages[this._selectedPageIndex.value]
      .sections[this._selectedPageSectionIndex.value].elements;
    this._unit.value.pages[this._selectedPageIndex.value]
      .sections[this._selectedPageSectionIndex.value].elements =
      oldElements.filter(element => !this._selectedElements.value.includes(element));
    this._pages[this._selectedPageIndex.value].next(this._unit.value.pages[this._selectedPageIndex.value]);
  }

  saveUnit(): void {
    const unitJSON = JSON.stringify(this._unit.value);
    FileService.saveUnitToFile(unitJSON);
  }

  async loadUnit(): Promise<void> {
    const newUnit = JSON.parse(await FileService.loadFile(['.json']));
    this._selectedPageIndex.next(0);
    this._unit.next(newUnit);
    this._pages = [];
    this._unit.value.pages.forEach((page: UnitPage) => {
      this._pages.push(new BehaviorSubject(page));
    });

    this.idService.readExistingIDs(this._unit.value);
  }

  selectPageSection(index: number): void {
    this._selectedPageSectionIndex.next(index);
  }
}

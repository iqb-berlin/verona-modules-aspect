import { Injectable } from '@angular/core';
import {
  BehaviorSubject, Observable, Subject
} from 'rxjs';
import {
  Unit, UnitPage, UnitUIElement
} from '../../../common/unit';
import { FileService } from './file.service';
import * as UnitFactory from './model/UnitFactory';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private _unit: BehaviorSubject<Unit>;
  private _pages: BehaviorSubject<UnitPage>[];
  private _selectedPageIndex: BehaviorSubject<number>;
  private _selectedPageSectionIndex: BehaviorSubject<number>;

  private _selectedElements: BehaviorSubject<UnitUIElement[]>;
  pageSwitch = new Subject();
  elementUpdated = new Subject();

  constructor() {
    this._unit = new BehaviorSubject(UnitFactory.createUnit());
    const initialPage = UnitFactory.createUnitPage();
    const initialSection = UnitFactory.createUnitPageSection();
    initialPage.sections.push(initialSection);
    this._unit.getValue().pages.push(initialPage);
    this._pages = [new BehaviorSubject(initialPage as UnitPage)];
    this._selectedPageIndex = new BehaviorSubject<number>(0);
    this._selectedPageSectionIndex = new BehaviorSubject<number>(0);

    this._selectedElements = new BehaviorSubject<UnitUIElement[]>([]);
    this._unit.next(this._unit.value);
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

  addPage(): void {
    const newPage = UnitFactory.createUnitPage();
    this._unit.value.pages.push(newPage);
    this._pages.push(new BehaviorSubject(newPage as UnitPage));
    this._unit.next(this._unit.value);
    this._selectedPageIndex.next(this._unit.value.pages.length - 1);
  }

  deletePage(index: number):void {
    this._unit.value.pages.splice(index, 1);
    this._unit.next(this._unit.value);
    this._pages.splice(index, 1);
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
      // TODO show toast
      console.log('cant delete last section');
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
      case 'label':
        newElement = UnitFactory.createLabelElement();
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
      // no default
    }
    this._unit.value.pages[this._selectedPageIndex.value]
      .sections[this._selectedPageSectionIndex.value].elements.push(newElement!);

    this._pages[this._selectedPageIndex.value].next(this._unit.value.pages[this._selectedPageIndex.value]);
  }

  switchPage(selectedIndex: number): void {
    this._selectedPageIndex.next(selectedIndex);
    this.clearSelectedElements();
    this.pageSwitch.next(selectedIndex);
  }

  clearSelectedElements(): void {
    this._selectedElements.next([]);
  }

  selectElement(elementModel: UnitUIElement): void {
    this._selectedElements.next([...this._selectedElements.getValue(), elementModel]);
  }

  updateElement(): void { // TODO weg damit
    this.elementUpdated.next();
  }

  updateSelectedElementProperty(property: string, value: string | number | boolean): void {
    this._selectedElements.value.forEach((element: UnitUIElement) => {
      if (['string', 'number', 'boolean'].indexOf(typeof element[property]) > -1) {
        element[property] = value;
      } else if (Array.isArray(element[property])) {
        (element[property] as string[]).push(value as string);
      }
    });
    this.elementUpdated.next();
  }

  deleteSelectedElements(): void {
    const oldElements = this._unit.value.pages[this._selectedPageIndex.value]
      .sections[this._selectedPageSectionIndex.value].elements;
    this._unit.value.pages[this._selectedPageIndex.value]
      .sections[this._selectedPageSectionIndex.value].elements =
      oldElements.filter(element => !this._selectedElements.value.includes(element));
    this._pages[this._selectedPageIndex.value].next(this._unit.value.pages[this._selectedPageIndex.value]);
  }

  getUnitAsJSON(): string {
    return JSON.stringify(this._unit.value);
  }

  saveUnit(): void {
    const unitJSON = this.getUnitAsJSON();
    FileService.saveUnitToFile(unitJSON);
  }

  async loadUnit(): Promise<void> {
    const unitJSON = await FileService.loadFile(['.json']);
    const newUnit = JSON.parse(unitJSON);
    this._selectedPageIndex.next(0);
    this._unit.next(newUnit);
    this._pages = [];
    this._unit.value.pages.forEach((page: UnitPage) => {
      this._pages.push(new BehaviorSubject(page));
    });
  }

  selectPageSection(index: number): void {
    this._selectedPageSectionIndex.next(index);
  }
}

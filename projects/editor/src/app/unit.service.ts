import { Injectable } from '@angular/core';
import {
  BehaviorSubject, Observable, Subject
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
  private selectedPageIndex: number = 0;

  private _unit: BehaviorSubject<Unit>;
  private _pages: BehaviorSubject<UnitPage>[];
  private _selectedPageSectionIndex: BehaviorSubject<number>;

  private _selectedElements: BehaviorSubject<UnitUIElement[]>;
  pageSwitch = new Subject();
  elementUpdated = new Subject();

  constructor(private messageService: MessageService, private idService: IdService) {
    this._unit = new BehaviorSubject(UnitFactory.createUnit());
    const initialPage = UnitFactory.createUnitPage();
    const initialSection = UnitFactory.createUnitPageSection();
    initialPage.sections.push(initialSection);
    this._unit.getValue().pages.push(initialPage);
    this._pages = [new BehaviorSubject(initialPage as UnitPage)];
    this._selectedPageSectionIndex = new BehaviorSubject<number>(0);

    this._selectedElements = new BehaviorSubject<UnitUIElement[]>([]);
    this._unit.next(this._unit.value);
  }

  get unit(): Observable<Unit> {
    return this._unit.asObservable();
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
    return this._unit.value.pages[this.selectedPageIndex].sections[this._selectedPageSectionIndex.value];
  }

  /** returns new last index */
  addPage(): number {
    const newPage = UnitFactory.createUnitPage();
    newPage.sections.push(UnitFactory.createUnitPageSection());
    this._unit.value.pages.push(newPage);
    this._pages.push(new BehaviorSubject(newPage as UnitPage));
    this._unit.next(this._unit.value);
    return this._unit.value.pages.length - 1;
  }

  /** returns active/new index */
  deletePage(index: number): number {
    this._unit.value.pages.splice(index, 1);
    this._unit.next(this._unit.value);
    this._pages.splice(index, 1);
    if (index === this.selectedPageIndex) {
      return this.selectedPageIndex - 1;
    }
    return this.selectedPageIndex;
  }

  addSection(): void {
    const newSection = UnitFactory.createUnitPageSection();
    this._unit.value.pages[this.selectedPageIndex].sections.push(newSection);
    this._unit.next(this._unit.value);
    this._pages[this.selectedPageIndex].next(this._unit.value.pages[this.selectedPageIndex]); // TODO auslagern?
  }

  deleteSection(): void {
    if (this._unit.value.pages[this.selectedPageIndex].sections.length < 2) {
      this.messageService.showWarning('cant delete last section');
    } else {
      const index = this._selectedPageSectionIndex.value;
      this._unit.value.pages[this.selectedPageIndex].sections.splice(index, 1);
      this._unit.next(this._unit.value);

      this._pages[this.selectedPageIndex].next(this._unit.value.pages[this.selectedPageIndex]);
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
      default:
        throw new Error(`ElementType ${elementType} not found!`);
    }
    newElement.id = this.idService.getNewID(elementType);
    this._unit.value.pages[this.selectedPageIndex]
      .sections[this._selectedPageSectionIndex.value].elements.push(newElement!);

    this._pages[this.selectedPageIndex].next(this._unit.value.pages[this.selectedPageIndex]);
  }

  switchPage(selectedIndex: number): void {
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

  updateSelectedElementProperty(property: string, value: string | number | boolean): boolean {
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
    this.elementUpdated.next();
    return true;
  }

  deleteSelectedElements(): void {
    const oldElements = this._unit.value.pages[this.selectedPageIndex]
      .sections[this._selectedPageSectionIndex.value].elements;
    this._unit.value.pages[this.selectedPageIndex]
      .sections[this._selectedPageSectionIndex.value].elements =
      oldElements.filter(element => !this._selectedElements.value.includes(element));
    this._pages[this.selectedPageIndex].next(this._unit.value.pages[this.selectedPageIndex]);
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
    this.selectedPageIndex = 0;
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

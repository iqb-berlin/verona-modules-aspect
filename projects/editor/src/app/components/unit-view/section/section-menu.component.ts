import {
  Component, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgForOf, NgIf } from '@angular/common';
import { SizeInputPanelComponent } from 'editor/src/app/components/util/size-input-panel.component';
import { Section } from 'common/models/section';
import { CompoundElement, UIElement } from 'common/models/elements/element';
import { VisibilityRule } from 'common/models/visibility-rule';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { DragNDropValueObject } from 'common/interfaces';
import { MessageService } from 'editor/src/app/services/message.service';
import { IDService } from 'editor/src/app/services/id.service';
import { SectionService } from 'editor/src/app/services/unit-services/section.service';
import { UnitService } from '../../../services/unit-services/unit.service';
import { DialogService } from '../../../services/dialog.service';
import { SelectionService } from '../../../services/selection.service';

@Component({
  selector: 'aspect-section-menu',
  standalone: true,
  imports: [
    MatMenuModule,
    MatIconModule,
    MatTooltipModule,
    MatListModule,
    MatButtonModule,
    TranslateModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    NgForOf,
    NgIf,
    SizeInputPanelComponent
  ],
  templateUrl: './section-menu.component.html',
  styles: [
    '.layoutMenu {padding: 5px; width: 250px;}',
    'aspect-size-input-panel {max-width: 100%;}',
    '.layoutMenu fieldset {display: flex; flex-direction: column; align-items: flex-start;}',
    '.menuItem {margin-bottom: 5px;}',
    '::ng-deep .activeAfterID-menu .mat-mdc-form-field {width:90%; margin-left: 10px;}'
  ]
})
export class SectionMenuComponent implements OnDestroy {
  @Input() section!: Section;
  @Input() sectionIndex!: number;
  @Input() lastSectionIndex!: number;
  @Input() pageIndex!: number;
  @Output() elementSelected = new EventEmitter<string>();
  @Output() elementHovered = new EventEmitter<string>();
  @Output() elementHoverEnd = new EventEmitter();

  @ViewChild('colorPicker') colorPicker!: ElementRef;
  private ngUnsubscribe = new Subject<void>();

  sectionElements: UIElement[] = [];

  constructor(public unitService: UnitService,
              private sectionService: SectionService,
              private selectionService: SelectionService,
              private dialogService: DialogService,
              private messageService: MessageService,
              private idService: IDService,
              private clipboard: Clipboard) { }

  updateModel(
    property: string, value: string | number | boolean | VisibilityRule[] | { value: number; unit: string }[]
  ): void {
    this.sectionService.updateSectionProperty(this.section, property, value);
  }

  updateElementList() {
    this.sectionElements = this.section.getAllElements();
  }

  onUnitListElClick(element: UIElement): void {
    this.elementHoverEnd.emit();
    this.elementSelected.emit(element.id);
  }

  onUnitListElHover(element: UIElement): void {
    /* compound children have no position and finding the correct
    * component to hightlight is too complicated right now. */
    if (element.position) this.elementHovered.emit(element.id);
  }

  onUnitListElLeave(): void {
    this.elementHoverEnd.emit();
  }

  deleteSection(): void {
    this.sectionService.deleteSection(this.selectionService.selectedPageIndex, this.sectionIndex);
  }

  /* Add or remove elements to size array. Default value 1fr. */
  modifySizeArray(property: 'gridColumnSizes' | 'gridRowSizes', newLength: number): void {
    const sizeArray: { value: number; unit: string }[] = property === 'gridColumnSizes' ?
      this.section.gridColumnSizes : this.section.gridRowSizes;

    let newArray = [];
    if (newLength < sizeArray.length) {
      newArray = sizeArray.slice(0, newLength);
    } else {
      newArray.push(
        ...sizeArray,
        ...Array(newLength - sizeArray.length).fill({ value: 1, unit: 'fr' })
      );
    }
    this.updateModel(property, newArray);
  }

  changeGridSize(property: string, index: number, newValue: { value: number; unit: string }): void {
    const sizeArray: { value: number; unit: string }[] = property === 'gridColumnSizes' ?
      this.section.gridColumnSizes : this.section.gridRowSizes;
    sizeArray[index] = newValue;
    this.updateModel(property, [...sizeArray]);
  }

  openColorPicker(): void {
    this.colorPicker.nativeElement.click();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  copySection() {
    this.copySectionToClipboard();
    this.unitService.savedSectionCode = JSON.stringify(this.section);
  }

  copySectionToClipboard() {
    this.clipboard.copy(JSON.stringify(this.section, (key, value) => {
      if (key === 'idService') {
        return undefined;
      }
      return value;
    }));
    this.messageService.showSuccess('Abschnitt in Zwischenablage kopiert');
  }

  showSectionInsertDialog(): void {
    this.dialogService.showSectionInsertDialog(this.section.elements.length === 0)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data: { newSection: Section, replaceSection: boolean }) => {
        if (data.newSection) {
          this.fixElementIDs(data.newSection.getAllElements());
          this.fixValueIDs(data.newSection.getAllElements()
            .filter(el => el.type === 'drop-list')
            .map(el => (el as DropListElement).value)
            .flat());
          if (data.replaceSection) {
            this.sectionService.replaceSection(
              this.selectionService.selectedPageIndex, this.sectionIndex, data.newSection);
          } else {
            this.sectionService.insertSection(
              this.selectionService.selectedPageIndex, this.sectionIndex, data.newSection);
          }
        }
      });
  }

  private fixElementIDs(elements: UIElement[]): void {
    elements
      .filter(element => !this.idService.isIDAvailable(element.id))
      .forEach(el => {
        el.id = this.idService.getAndRegisterNewID(el.type);
      });

    elements
      .filter(element => !this.idService.isAliasAvailable(element.alias))
      .forEach(el => {
        el.alias = this.idService.getAndRegisterNewID(el.type, true);
      });
  }

  private fixValueIDs(values: DragNDropValueObject[]): void {
    values
      .filter(value => !this.idService.isIDAvailable(value.id))
      .forEach(val => {
        val.id = this.idService.getAndRegisterNewID('value');
      });
    values
      .filter(value => !this.idService.isAliasAvailable(value.alias))
      .forEach(val => {
        val.alias = this.idService.getAndRegisterNewID('value', true);
      });
  }

  showVisibilityRulesDialog(): void {
    this.dialogService
      .showVisibilityRulesDialog(
        this.section.visibilityRules,
        this.section.logicalConnectiveOfRules,
        this.getControlIds(),
        this.section.visibilityDelay,
        this.section.animatedVisibility,
        this.section.enableReHide
      )
      .subscribe(visibilityConfig => {
        if (visibilityConfig) {
          this.updateModel('visibilityRules', visibilityConfig.visibilityRules);
          this.updateModel('logicalConnectiveOfRules', visibilityConfig.logicalConnectiveOfRules);
          this.updateModel('visibilityDelay', visibilityConfig.visibilityDelay);
          this.updateModel('animatedVisibility', visibilityConfig.animatedVisibility);
          this.updateModel('enableReHide', visibilityConfig.enableReHide);
        }
      });
  }

  private getControlIds(): { id: string, alias: string }[] {
    return this.unitService.unit.getAllElements()
      .filter(element => !(element instanceof CompoundElement))
      .map(element => ({ id: element.id, alias: element.alias }))
      .concat(this.unitService.unit.stateVariables
        .map(element => ({ id: element.id, alias: element.alias })));
  }

  ignoreNumbering() {
    this.updateModel('ignoreNumbering', !this.section.ignoreNumbering);
  }

  moveSection(direction: 'up' | 'down') {
    if ((direction === 'up' && this.sectionIndex > 0) ||
        (direction === 'down' && this.sectionIndex < this.lastSectionIndex)) {
      this.sectionService.moveSection(this.section, direction);
    } else {
      this.sectionService.transferSection(this.pageIndex, this.sectionIndex, direction);
    }
  }

  duplicateSection() {
    this.sectionService.duplicateSection(this.sectionIndex);
  }
}

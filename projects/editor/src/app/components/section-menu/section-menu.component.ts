import {
  Component, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateService } from '@ngx-translate/core';
import { CompoundElement, UIElement } from 'common/models/elements/element';
import { VisibilityRule } from 'common/models/visibility-rule';
import { MessageService } from 'editor/src/app/services/message.service';
import { IDService } from 'editor/src/app/services/id.service';
import { SectionService } from 'editor/src/app/services/section.service';
import { EditorSection } from 'editor/src/app/models/editor-section';
import { UnitService } from 'editor/src/app/services/unit.service';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { SelectionService } from 'editor/src/app/services/selection.service';

@Component({
  selector: 'aspect-section-menu',
  standalone: false,
  templateUrl: './section-menu.component.html',
  styleUrls: ['./section-menu.component.scss']
})
export class SectionMenuComponent implements OnDestroy {
  @Input() section!: EditorSection;
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
              private translateService: TranslateService,
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

  /**
   * What `aspectNumberField` worked out for the section height.
   *
   * The four number boxes in this menu passed `$event.target.value` straight on - a string, into
   * `height`, which is declared `number` - and `|| 0` turned an emptied box into a 0, which
   * collapses the section. Neither `min` nor anything else was enforced anywhere (#1164).
   */
  commitHeight(update: { value: number | null; isInputValid: boolean }): void {
    if (!update.isInputValid || update.value === null) {
      this.messageService.showWarning(this.translateService.instant('inputInvalid'));
      return;
    }
    this.updateModel('height', update.value);
  }

  /**
   * The same for the two grid track counts, where an emptied box did more than write a wrong
   * number: `|| 0` cut the size array to nothing, so a section lost every row or column definition
   * at once. `min="1"` because a grid with no tracks is not a grid.
   *
   * Unlike the table, this has no floor tied to the elements inside it - shrinking the grid past an
   * element leaves that element with a track that no longer exists. That was so before and is left
   * alone here; #1164 is about the boxes.
   */
  commitCount(property: 'gridColumnSizes' | 'gridRowSizes',
              update: { value: number | null; isInputValid: boolean }): void {
    if (!update.isInputValid || update.value === null) {
      this.messageService.showWarning(this.translateService.instant('inputInvalid'));
      return;
    }
    this.modifySizeArray(property, update.value);
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
      .subscribe((data: { newSection: EditorSection, replaceSection: boolean }) => {
        if (data.newSection) {
          const finalizedSection = new EditorSection(
            JSON.parse(JSON.stringify(data.newSection)),
            this.idService
          );
          if (data.replaceSection) {
            this.sectionService.replaceSection(
              this.selectionService.selectedPageIndex, this.sectionIndex, finalizedSection);
          } else {
            this.sectionService.insertSection(
              this.selectionService.selectedPageIndex, this.sectionIndex, finalizedSection);
          }
        }
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

import {
  AfterViewInit, Component, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { ElementComponent } from 'common/directives/element-component.directive';
import { MarkingPanelElement } from 'common/models/elements/marking-panel';
import { ImageElement } from 'common/models/elements/image';
import { UIElement } from 'common/models/elements/element';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import {
  MathTableCell, MathTableElement, MathTableRow
} from 'common/models/elements/math-table';
import { KeypadService } from 'player/src/app/services/keypad.service';
import { KeyboardService } from 'player/src/app/services/keyboard.service';
import { DeviceService } from 'player/src/app/services/device.service';
import { Subject, Subscription } from 'rxjs';
import { MathTableComponent } from 'common/components/elements/math-table/math-table.component';
import { MarkingPanelService } from 'player/src/app/services/marking-panel.service';
import { filter, takeUntil } from 'rxjs/operators';
import { ValueChangeElement } from 'common/models/input-element-interfaces';
import { UnitStateService } from '../../../services/unit-state.service';
import { ElementGroupDirective } from '../../../directives/element-group.directive';
import { ElementModelElementCodeMappingService } from '../../../services/element-model-element-code-mapping.service';
import { NavigationService } from '../../../services/navigation.service';

/** A cell of a math table that takes the keys, with where it sits in the table. */
type KeyInputCell = { inputElement: HTMLElement; row: MathTableRow; cell: MathTableCell };

@Component({
  selector: 'aspect-interactive-group-element',
  templateUrl: './interactive-group-element.component.html',
  styleUrls: ['./interactive-group-element.component.scss'],
  standalone: false
})
export class InteractiveGroupElementComponent
  extends ElementGroupDirective implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('elementComponent') elementComponent!: ElementComponent;
  MarkingPanelElement!: MarkingPanelElement;
  ImageElement!: ImageElement;
  MathTableElement!: MathTableElement;

  tableModel: MathTableRow[] = [];

  isKeypadOpen: boolean = false;
  keypadEnterKeySubscription!: Subscription;
  keypadDeleteCharactersSubscription!: Subscription;
  keypadSelectSubscription!: Subscription;

  keyboardEnterKeySubscription!: Subscription;
  keyboardDeleteCharactersSubscription!: Subscription;
  /** Counts the toggles of keyboard and keypad; only the latest one decides on the subscriptions, as in
      `TextInputGroupDirective.keyToggles` (#1710). */
  private keyToggles: number = 0;

  selectedColor: string | undefined;
  markingMode: 'selection' | 'word' | 'range' = 'selection';
  showHint: boolean = false;
  private ngUnsubscribe: Subject<void> = new Subject();

  constructor(
    public unitStateService: UnitStateService,
    public navigationService: NavigationService,
    private elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
    private stateVariableStateService: StateVariableStateService,
    public keypadService: KeypadService,
    private keyboardService: KeyboardService,
    private deviceService: DeviceService,
    public markingPanelService: MarkingPanelService
  ) {
    super();
    this.subscribeToMarkingColorChanged();
    this.subscribeToMarkingRangeChanged();
  }

  ngOnInit(): void {
    if (this.elementModel.type === 'math-table') {
      this.tableModel = this.elementModelElementCodeMappingService.mapToElementModelValue(
        this.unitStateService.getElementCodeById(this.elementModel.id)?.value, this.elementModel
      ) as MathTableRow[];
    }
    if (this.elementModel.type === 'marking-panel') {
      this.navigationService.currentPageIndexChanged
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.markingPanelService.broadcastMarkingData({
            id: this.elementModel.id,
            markingData: {
              active: false,
              mode: 'mark',
              color: '',
              colorName: ''
            }
          });
        });
    }
  }

  ngAfterViewInit(): void {
    let initialValue;
    switch (this.elementModel.type) {
      case 'image':
        initialValue = ElementModelElementCodeMappingService.mapToElementCodeValue(
          (this.elementModel as ImageElement).magnifierUsed, this.elementModel.type);
        break;
      case 'math-table':
        initialValue = ElementModelElementCodeMappingService.mapToElementCodeValue(
          [], this.elementModel.type);
        break;
      default:
        initialValue = null;
    }
    this.registerAtUnitStateService(
      this.elementModel.id,
      this.elementModel.alias,
      initialValue,
      this.elementComponent,
      this.pageIndex);
  }

  private subscribeToMarkingColorChanged() {
    this.markingPanelService.markingColorChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(markingColor => {
        if (markingColor.markingPanels.includes(this.elementModel.id)) {
          this.selectedColor = markingColor.color;
          this.markingMode = markingColor.markingMode;
        }
      });
  }

  private subscribeToMarkingRangeChanged() {
    this.markingPanelService.markingRangeChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(markingRangeData => {
        this.showHint = markingRangeData.markingPanels.includes(this.elementModel.id) &&
          !!markingRangeData.markingRange && markingRangeData.markingRange.second === null;
      });
  }

  changeElementCodeValue(value: ValueChangeElement): void {
    this.unitStateService.changeElementCodeValue({
      id: value.id,
      value: ElementModelElementCodeMappingService
        .mapToElementCodeValue(value.value, this.elementModel.type)
    });
  }

  async toggleKeyInput(focusedTextInput: KeyInputCell & { focused: boolean }): Promise<void> {
    const promises: Promise<boolean>[] = [];
    const usesKeyboard = !!this.elementModel.showSoftwareKeyboard && !this.elementModel.readOnly;
    const usesKeypad = this.shallOpenKeypad(this.elementModel);
    if (focusedTextInput.focused) this.takeKeys(focusedTextInput, usesKeyboard, usesKeypad);
    if (usesKeyboard) {
      promises.push(this.keyboardService
        .toggleAsync(focusedTextInput,
                     this.elementComponent as MathTableComponent,
                     this.deviceService.isMobileWithoutHardwareKeyboard));
    }
    if (usesKeypad) {
      promises.push(this.keypadService
        .toggleAsync(focusedTextInput, this.elementComponent as MathTableComponent));
    }
    if (promises.length) {
      this.keyToggles += 1;
      const toggle = this.keyToggles;
      await Promise.all(promises).then(() => {
        if (toggle !== this.keyToggles) return;
        if (!this.keyboardService.isOpen) {
          this.unsubscribeFromKeyboardEvents();
        } else if (focusedTextInput.focused) {
          this.subscribeForKeyboardEvents(focusedTextInput);
        }
        if (!this.keypadService.isOpen) {
          this.unsubscribeFromKeypadEvents();
        } else if (focusedTextInput.focused) {
          this.subscribeForKeypadEvents(focusedTextInput);
        }
        this.isKeypadOpen = this.keypadService.isOpen;
      });
    }
  }

  /**
   * Hands the keys to a cell the moment it takes the focus, as `TextInputGroupDirective.takeKeys` does for a
   * text field: the keys are meant for it from now on, and an aid that is open already passes them on at once
   * rather than to the cell or field before, until it has opened again after its pause (#1710).
   */
  private takeKeys(cellInput: KeyInputCell, usesKeyboard: boolean, usesKeypad: boolean): void {
    this.keyboardService.keyTarget = cellInput.inputElement;
    this.keypadService.keyTarget = cellInput.inputElement;
    if (usesKeyboard && this.keyboardService.isOpen) this.subscribeForKeyboardEvents(cellInput);
    if (usesKeypad && this.keypadService.isOpen) this.subscribeForKeypadEvents(cellInput);
  }

  private shallOpenKeypad(elementModel: UIElement): boolean {
    return !!elementModel.inputAssistancePreset &&
      !(elementModel.showSoftwareKeyboard &&
        elementModel.addInputAssistanceToKeyboard &&
        this.deviceService.isMobileWithoutHardwareKeyboard);
  }

  /** Hands the keys of the keypad to the cell: only those meant for it, and once, a subscription still
      standing being dropped first (`TextInputGroupDirective.subscribeForKeypadEvents`, #1710). */
  private subscribeForKeypadEvents({ inputElement, row, cell }: KeyInputCell): void {
    this.unsubscribeFromKeypadEvents();
    this.keypadEnterKeySubscription = this.keypadService.enterKey
      .pipe(filter(() => this.keypadService.keyTarget === inputElement), takeUntil(this.ngUnsubscribe))
      .subscribe(key => this.enterKey(key, row, cell));
    this.keypadDeleteCharactersSubscription = this.keypadService.deleteCharacters
      .pipe(filter(() => this.keypadService.keyTarget === inputElement), takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.enterKey('Delete', row, cell));
    this.keypadSelectSubscription = this.keypadService.select
      .pipe(filter(() => this.keypadService.keyTarget === inputElement), takeUntil(this.ngUnsubscribe))
      .subscribe(key => this.enterKey(key, row, cell));
  }

  private unsubscribeFromKeypadEvents(): void {
    if (this.keypadEnterKeySubscription) this.keypadEnterKeySubscription.unsubscribe();
    if (this.keypadDeleteCharactersSubscription) this.keypadDeleteCharactersSubscription.unsubscribe();
    if (this.keypadSelectSubscription) this.keypadSelectSubscription.unsubscribe();
  }

  /** Hands the keys of the on-screen keyboard to the cell, as `subscribeForKeypadEvents` does. */
  private subscribeForKeyboardEvents({ inputElement, row, cell }: KeyInputCell): void {
    this.unsubscribeFromKeyboardEvents();
    this.keyboardEnterKeySubscription = this.keyboardService.enterKey
      .pipe(filter(() => this.keyboardService.keyTarget === inputElement), takeUntil(this.ngUnsubscribe))
      .subscribe(key => this.enterKey(key, row, cell));
    this.keyboardDeleteCharactersSubscription = this.keyboardService.deleteCharacters
      .pipe(filter(() => this.keyboardService.keyTarget === inputElement), takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.enterKey('Delete', row, cell));
  }

  private unsubscribeFromKeyboardEvents(): void {
    if (this.keyboardEnterKeySubscription) this.keyboardEnterKeySubscription.unsubscribe();
    if (this.keyboardDeleteCharactersSubscription) this.keyboardDeleteCharactersSubscription.unsubscribe();
  }

  private enterKey(
    key: string,
    row: MathTableRow,
    cell: MathTableCell
  ): void {
    const char = key === '·' ? '*' : key;
    (this.elementComponent as MathTableComponent).setCellValue(char, cell, row);
  }

  detectHardwareKeyboard(): void {
    if (this.elementModel.showSoftwareKeyboard) {
      this.deviceService.hasHardwareKeyboard = true;
      this.keyboardService.close();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.unsubscribeFromKeypadEvents();
    this.unsubscribeFromKeyboardEvents();
  }
}

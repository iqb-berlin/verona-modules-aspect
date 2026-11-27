/* eslint-disable max-classes-per-file */
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import {
  ComponentFixture, TestBed, fakeAsync, flushMicrotasks
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ElementComponent } from 'common/directives/element-component.directive';
import { UIElement } from 'common/models/elements/element';
import { ImageElement } from 'common/models/elements/image';
import {
  MathTableCell, MathTableElement, MathTableRow
} from 'common/models/elements/math-table';
import { MarkingPanelElement } from 'common/models/elements/marking-panel';
import { MarkingPanelMarkingData } from 'common/models/marking-data';
import { ValueChangeElement } from 'common/models/input-element-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { DeviceService } from 'player/src/app/services/device.service';
import { KeyboardService } from 'player/src/app/services/keyboard.service';
import { KeypadService } from 'player/src/app/services/keypad.service';
import { MarkingPanelService } from 'player/src/app/services/marking-panel.service';
import { NavigationService } from 'player/src/app/services/navigation.service';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { InteractiveGroupElementComponent } from './interactive-group-element.component';

@Component({
  selector: 'aspect-image',
  template: '',
  standalone: false
})
class ImageStubComponent extends ElementComponent {
  @Input() elementModel!: ImageElement;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
}

@Component({
  selector: 'aspect-math-table',
  template: '',
  standalone: false
})
class MathTableStubComponent extends ElementComponent {
  @Input() elementModel!: MathTableElement;
  @Input() tableModel!: MathTableRow[];
  @Output() onKeyDown = new EventEmitter<unknown>();
  @Output() focusChanged = new EventEmitter<unknown>();
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  setCellValue = vi.fn();
}

@Component({
  selector: 'aspect-marking-panel',
  template: '',
  standalone: false
})
class MarkingPanelStubComponent extends ElementComponent {
  @Input() elementModel!: MarkingPanelElement;
  @Input() showHint!: boolean;
  @Input() markingMode!: 'selection' | 'word' | 'range';
  @Input() selectedColor!: string | undefined;
  @Output() markingPanelMarkingDataChanged = new EventEmitter<MarkingPanelMarkingData>();
}

@Component({
  selector: 'aspect-floating-keypad',
  template: '',
  standalone: false
})
class MockFloatingKeyPadComponent {
  @Input() isKeypadOpen!: boolean;
}

describe('InteractiveGroupElementComponent', () => {
  let component: InteractiveGroupElementComponent;
  let fixture: ComponentFixture<InteractiveGroupElementComponent>;
  let unitStateService: SpyObj<UnitStateService>;
  let markingPanelService: MarkingPanelService;
  let navigationService: NavigationService;
  let keyboardService: SpyObj<KeyboardService>;
  let deviceService: DeviceService;

  const initComponent = (elementModel: UIElement): void => {
    fixture = TestBed.createComponent(InteractiveGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = elementModel;
    component.pageIndex = 1;
    fixture.detectChanges();
  };

  const createMarkingPanel = (): MarkingPanelElement => {
    const element = new MarkingPanelElement({ id: 'marking-panel_1', alias: 'marking-panel_1' });
    element.type = 'marking-panel';
    element.isRelevantForPresentationComplete = false;
    return element;
  };

  beforeEach(async () => {
    unitStateService = createSpyObj<UnitStateService>([
      'getElementCodeById', 'changeElementCodeValue', 'registerElementCode'
    ]);
    keyboardService = createSpyObj<KeyboardService>(['close', 'toggleAsync']);
    deviceService = { hasHardwareKeyboard: false } as DeviceService;

    await TestBed.configureTestingModule({
      declarations: [
        InteractiveGroupElementComponent,
        ImageStubComponent,
        MathTableStubComponent,
        MarkingPanelStubComponent,
        MockFloatingKeyPadComponent,
        CastPipe
      ],
      providers: [
        { provide: UnitStateService, useValue: unitStateService },
        { provide: KeyboardService, useValue: keyboardService },
        { provide: DeviceService, useValue: deviceService }
      ]
    })
      .compileComponents();

    markingPanelService = TestBed.inject(MarkingPanelService);
    navigationService = TestBed.inject(NavigationService);
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should show the component matching the element type', () => {
    initComponent(new ImageElement({ id: 'image_1', alias: 'image_1' }));
    expect(fixture.debugElement.query(By.directive(ImageStubComponent))).toBeTruthy();

    initComponent(new MathTableElement({ id: 'math-table_1', alias: 'math-table_1' }));
    expect(fixture.debugElement.query(By.directive(MathTableStubComponent))).toBeTruthy();

    initComponent(createMarkingPanel());
    expect(fixture.debugElement.query(By.directive(MarkingPanelStubComponent))).toBeTruthy();
  });

  it('should register an image with its magnifier state', () => {
    const elementModel = new ImageElement({ id: 'image_1', alias: 'image_1' });
    elementModel.magnifierUsed = true;
    elementModel.isRelevantForPresentationComplete = true;

    initComponent(elementModel);

    expect(unitStateService.registerElementCode)
      .toHaveBeenCalledWith('image_1', 'image_1', true, component.elementComponent.domElement, 1);
  });

  it('should register a marking panel without a value', () => {
    initComponent(createMarkingPanel());

    expect(unitStateService.registerElementCode)
      .toHaveBeenCalledWith(
        'marking-panel_1', 'marking-panel_1', null, component.elementComponent.domElement, null
      );
  });

  it('should take over the stored table model of a math table', () => {
    const tableModel = [{ cells: [{ value: '1' }] }] as MathTableRow[];
    unitStateService.getElementCodeById
      .mockReturnValue({ id: 'math-table_1', alias: 'math-table_1', value: JSON.stringify(tableModel) });

    initComponent(new MathTableElement({ id: 'math-table_1', alias: 'math-table_1' }));

    expect(component.tableModel).toEqual(tableModel);
    expect((fixture.debugElement.query(By.directive(MathTableStubComponent))
      .componentInstance as MathTableStubComponent).tableModel).toEqual(tableModel);
  });

  it('should report changed element values to the unit state service', () => {
    initComponent(new ImageElement({ id: 'image_1', alias: 'image_1' }));

    (fixture.debugElement.query(By.directive(ImageStubComponent))
      .componentInstance as ImageStubComponent).elementValueChanged.emit({ id: 'image_1', value: true });

    expect(unitStateService.changeElementCodeValue).toHaveBeenCalledWith({ id: 'image_1', value: true });
  });

  it('should take over the marking colour of its own marking panel', () => {
    initComponent(createMarkingPanel());

    markingPanelService.broadcastMarkingColorData({
      id: 'text_1', color: 'yellow', markingMode: 'word', markingPanels: ['marking-panel_1']
    });

    expect(component.selectedColor).toBe('yellow');
    expect(component.markingMode).toBe('word');
  });

  it('should ignore the marking colour of another marking panel', () => {
    initComponent(createMarkingPanel());

    markingPanelService.broadcastMarkingColorData({
      id: 'text_1', color: 'yellow', markingMode: 'word', markingPanels: ['marking-panel_2']
    });

    expect(component.selectedColor).toBeUndefined();
    expect(component.markingMode).toBe('selection');
  });

  it('should show a hint while a marking range is being selected', () => {
    initComponent(createMarkingPanel());

    markingPanelService.broadcastRangeClicks({
      id: 'text_1', markingPanels: ['marking-panel_1'], markingRange: { first: 1, second: null }
    });

    expect(component.showHint).toBe(true);
  });

  it('should hide the hint for a completed marking range', () => {
    initComponent(createMarkingPanel());

    markingPanelService.broadcastRangeClicks({
      id: 'text_1', markingPanels: ['marking-panel_1'], markingRange: { first: 1, second: 3 }
    });

    expect(component.showHint).toBe(false);
  });

  it('should switch off its marking panel when the page changed', () => {
    initComponent(createMarkingPanel());
    const broadcastMarkingData = vi.spyOn(markingPanelService, 'broadcastMarkingData');

    navigationService.currentPageIndexChanged.emit(2);

    expect(broadcastMarkingData).toHaveBeenCalledWith({
      id: 'marking-panel_1',
      markingData: {
        active: false, mode: 'mark', color: '', colorName: ''
      }
    });
  });

  it('should forward the marking data of its marking panel', () => {
    initComponent(createMarkingPanel());
    const broadcastMarkingData = vi.spyOn(markingPanelService, 'broadcastMarkingData');
    const markingPanelMarkingData = {
      id: 'marking-panel_1',
      markingData: {
        active: true, mode: 'mark', color: '#f9f871', colorName: 'yellow'
      }
    } as MarkingPanelMarkingData;

    (fixture.debugElement.query(By.directive(MarkingPanelStubComponent))
      .componentInstance as MarkingPanelStubComponent)
      .markingPanelMarkingDataChanged.emit(markingPanelMarkingData);

    expect(broadcastMarkingData).toHaveBeenCalledWith(markingPanelMarkingData);
  });

  it('should detect a hardware keyboard on key input in a math table', () => {
    const elementModel = new MathTableElement({ id: 'math-table_1', alias: 'math-table_1' });
    elementModel.showSoftwareKeyboard = true;
    initComponent(elementModel);

    (fixture.debugElement.query(By.directive(MathTableStubComponent))
      .componentInstance as MathTableStubComponent).onKeyDown.emit({});

    expect(deviceService.hasHardwareKeyboard).toBe(true);
    expect(keyboardService.close).toHaveBeenCalled();
  });

  it('should ignore a hardware keyboard without software keyboard', () => {
    const elementModel = new MathTableElement({ id: 'math-table_1', alias: 'math-table_1' });
    elementModel.showSoftwareKeyboard = false;
    initComponent(elementModel);

    component.detectHardwareKeyboard();

    expect(deviceService.hasHardwareKeyboard).toBe(false);
    expect(keyboardService.close).not.toHaveBeenCalled();
  });

  /* The keypad stays open from one cell to the next and passed its keys to the cell before until it had opened
     again after its pause, so a digit typed right after moving on replaced the one before (#1710). */
  it('should hand a key of the keypad to the cell that has just taken the focus', fakeAsync(() => {
    const elementModel = new MathTableElement({ id: 'math-table_1', alias: 'math-table_1' });
    elementModel.showSoftwareKeyboard = false;
    elementModel.inputAssistancePreset = 'numbers';
    initComponent(elementModel);
    const enterKey = new EventEmitter<string>();
    component.keypadService = {
      enterKey,
      deleteCharacters: new EventEmitter<boolean>(),
      select: new EventEmitter<string>(),
      isOpen: true,
      toggleAsync: vi.fn().mockResolvedValue(true),
      close: vi.fn()
    } as unknown as KeypadService;
    const row = { cells: [] } as unknown as MathTableRow;
    const [first, second] = [{ value: '' }, { value: '' }] as unknown as MathTableCell[];
    const mathTable = fixture.debugElement.query(By.directive(MathTableStubComponent))
      .componentInstance as MathTableStubComponent;
    component.toggleKeyInput({
      inputElement: document.createElement('td'), row, cell: first, focused: true
    });
    flushMicrotasks();

    component.toggleKeyInput({
      inputElement: document.createElement('td'), row, cell: second, focused: true
    });
    enterKey.emit('2');
    flushMicrotasks();

    expect(mathTable.setCellValue).toHaveBeenCalledExactlyOnceWith('2', second, row);
  }));

  /* Tapping a cell and right away the cell that had the focus before ends four pauses in a row; each decided
     on the keys for the cell of its own focus or blur, and the cell tapped again lost them (#1710). */
  it('should leave the keys with the cell tapped last while the pauses of the taps before end', fakeAsync(() => {
    const elementModel = new MathTableElement({ id: 'math-table_1', alias: 'math-table_1' });
    elementModel.showSoftwareKeyboard = false;
    elementModel.inputAssistancePreset = 'numbers';
    initComponent(elementModel);
    const enterKey = new EventEmitter<string>();
    const pauses: (() => void)[] = [];
    const keypad = {
      enterKey,
      deleteCharacters: new EventEmitter<boolean>(),
      select: new EventEmitter<string>(),
      isOpen: true,
      close: vi.fn()
    } as unknown as KeypadService;
    keypad.toggleAsync = ({ focused }) => new Promise<boolean>(resolve => {
      pauses.push(() => {
        keypad.isOpen = focused;
        resolve(focused);
      });
    });
    component.keypadService = keypad;
    const row = { cells: [] } as unknown as MathTableRow;
    const [first, second] = [{ value: '' }, { value: '' }] as unknown as MathTableCell[];
    const [firstInput, secondInput] = [document.createElement('td'), document.createElement('td')];
    const mathTable = fixture.debugElement.query(By.directive(MathTableStubComponent))
      .componentInstance as MathTableStubComponent;
    component.toggleKeyInput({
      inputElement: secondInput, row, cell: second, focused: false
    });
    component.toggleKeyInput({
      inputElement: firstInput, row, cell: first, focused: true
    });
    component.toggleKeyInput({
      inputElement: firstInput, row, cell: first, focused: false
    });
    component.toggleKeyInput({
      inputElement: secondInput, row, cell: second, focused: true
    });

    pauses[0]();
    flushMicrotasks();
    pauses[1]();
    flushMicrotasks();
    enterKey.emit('2');

    expect(mathTable.setCellValue).toHaveBeenCalledExactlyOnceWith('2', second, row);
  }));

  it('should not subscribe the keys once destroyed during the pause of a focus', fakeAsync(() => {
    const elementModel = new MathTableElement({ id: 'math-table_1', alias: 'math-table_1' });
    elementModel.showSoftwareKeyboard = false;
    elementModel.inputAssistancePreset = 'numbers';
    initComponent(elementModel);
    const enterKey = new EventEmitter<string>();
    const pauses: ((isOpen: boolean) => void)[] = [];
    const keypad = {
      enterKey,
      deleteCharacters: new EventEmitter<boolean>(),
      select: new EventEmitter<string>(),
      isOpen: false,
      toggleAsync: () => new Promise<boolean>(resolve => { pauses.push(resolve); }),
      close: vi.fn()
    } as unknown as KeypadService;
    component.keypadService = keypad;
    component.toggleKeyInput({
      inputElement: document.createElement('td'),
      row: { cells: [] } as unknown as MathTableRow,
      cell: { value: '' } as unknown as MathTableCell,
      focused: true
    });
    fixture.destroy();

    keypad.isOpen = true;
    pauses[0](true);
    flushMicrotasks();

    expect(enterKey.observed).toBe(false);
  }));

  it('should leave a key of the keypad to a field elsewhere that has taken the focus', fakeAsync(() => {
    const elementModel = new MathTableElement({ id: 'math-table_1', alias: 'math-table_1' });
    elementModel.showSoftwareKeyboard = false;
    elementModel.inputAssistancePreset = 'numbers';
    initComponent(elementModel);
    const enterKey = new EventEmitter<string>();
    component.keypadService = {
      enterKey,
      deleteCharacters: new EventEmitter<boolean>(),
      select: new EventEmitter<string>(),
      isOpen: true,
      toggleAsync: vi.fn().mockResolvedValue(true),
      close: vi.fn()
    } as unknown as KeypadService;
    const mathTable = fixture.debugElement.query(By.directive(MathTableStubComponent))
      .componentInstance as MathTableStubComponent;
    component.toggleKeyInput({
      inputElement: document.createElement('td'),
      row: { cells: [] } as unknown as MathTableRow,
      cell: { value: '' } as unknown as MathTableCell,
      focused: true
    });
    flushMicrotasks();

    component.keypadService.keyTarget = document.createElement('input');
    enterKey.emit('2');

    expect(mathTable.setCellValue).not.toHaveBeenCalled();
  }));

  it('should stop reacting on marking changes after destruction', () => {
    initComponent(createMarkingPanel());

    fixture.destroy();
    markingPanelService.broadcastMarkingColorData({
      id: 'text_1', color: 'yellow', markingMode: 'word', markingPanels: ['marking-panel_1']
    });

    expect(component.selectedColor).toBeUndefined();
  });
});

/* eslint-disable max-classes-per-file */
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ElementComponent } from 'common/directives/element-component.directive';
import { UIElement } from 'common/models/elements/element';
import { ImageElement } from 'common/models/elements/image';
import {
  MathTableElement, MathTableRow
} from 'common/models/elements/math-table';
import { MarkingPanelElement } from 'common/models/elements/marking-panel';
import { MarkingPanelMarkingData } from 'common/models/marking-data';
import { ValueChangeElement } from 'common/models/input-element-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { DeviceService } from 'player/src/app/services/device.service';
import { KeyboardService } from 'player/src/app/services/keyboard.service';
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

  it('should create', () => {
    initComponent(new ImageElement({ id: 'image_1', alias: 'image_1' }));

    expect(component).toBeTruthy();
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

  it('should stop reacting on marking changes after destruction', () => {
    initComponent(createMarkingPanel());

    fixture.destroy();
    markingPanelService.broadcastMarkingColorData({
      id: 'text_1', color: 'yellow', markingMode: 'word', markingPanels: ['marking-panel_1']
    });

    expect(component.selectedColor).toBeUndefined();
  });
});

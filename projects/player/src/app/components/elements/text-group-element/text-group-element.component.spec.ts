/* eslint-disable max-classes-per-file */
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subject } from 'rxjs';
import { ElementComponent } from 'common/directives/element-component.directive';
import { TextElement } from 'common/models/elements/text-group-elements/text';
import { MarkingData, MarkingPanelMarkingData } from 'common/models/marking-data';
import { ValueChangeElement } from 'common/models/input-element-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { MarkingPanelService } from 'player/src/app/services/marking-panel.service';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { TextGroupElementComponent } from './text-group-element.component';

@Component({
  selector: 'aspect-text',
  template: '',
  standalone: false
})
class TextStubComponent extends ElementComponent {
  @Input() elementModel!: TextElement;
  @Input() savedText!: string;
  @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
  @Output() textSelectionStart = new EventEmitter<PointerEvent>();
  @Output() selectedColorChanged = new EventEmitter<string | undefined>();
  @Output() markingDataChanged = new EventEmitter<MarkingData>();
  selectedColor = new BehaviorSubject<string | undefined>(undefined);
}

@Component({
  selector: 'aspect-floating-marking-bar',
  template: '',
  standalone: false
})
class MockFloatingMarkingBarComponent {
  @Input() elementComponent!: ElementComponent;
  @Input() isMarkingBarOpen!: boolean;
  @Input() textComponentRect!: DOMRect;
  @Input() textComponentContainerScrollTop!: number;
  @Input() markingBarPosition!: { top: number, left: number };
  @Output() markingDataChanged = new EventEmitter<MarkingData>();
}

describe('TextGroupElementComponent', () => {
  let component: TextGroupElementComponent;
  let fixture: ComponentFixture<TextGroupElementComponent>;
  let unitStateService: SpyObj<UnitStateService>;
  let markingPanelService: MarkingPanelService;

  const createText = (properties: Partial<TextElement> = {}): TextElement => {
    const element = new TextElement({ id: 'text_1', alias: 'text_1' });
    Object.assign(element, properties);
    return element;
  };

  const initComponent = (elementModel: TextElement): void => {
    component.elementModel = elementModel;
    component.pageIndex = 1;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    unitStateService = createSpyObj<UnitStateService>([
      'getElementCodeById', 'changeElementCodeValue', 'registerElementCode'
    ]);

    await TestBed.configureTestingModule({
      declarations: [
        TextGroupElementComponent,
        TextStubComponent,
        MockFloatingMarkingBarComponent,
        CastPipe
      ],
      providers: [
        { provide: UnitStateService, useValue: unitStateService }
      ]
    })
      .compileComponents();

    markingPanelService = TestBed.inject(MarkingPanelService);
    fixture = TestBed.createComponent(TextGroupElementComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    initComponent(createText());

    expect(component).toBeTruthy();
  });

  it('should take over the stored markings', () => {
    unitStateService.getElementCodeById
      .mockReturnValue({ id: 'text_1', alias: 'text_1', value: ['1-3-yellow'] });

    initComponent(createText({ markingMode: 'selection' }));

    expect(component.savedMarks).toEqual(['1-3-yellow']);
  });

  it('should start without markings when nothing is stored', () => {
    initComponent(createText({ markingMode: 'selection' }));

    expect(component.savedMarks).toEqual([]);
  });

  it('should register the element at the unit state service', () => {
    const elementModel = createText({ markingMode: 'selection' });
    elementModel.isRelevantForPresentationComplete = true;

    initComponent(elementModel);

    expect(unitStateService.registerElementCode)
      .toHaveBeenCalledWith('text_1', 'text_1', [], component.elementComponent.domElement, 1);
  });

  it('should register the stored markings of a word marking element', () => {
    unitStateService.getElementCodeById
      .mockReturnValue({ id: 'text_1', alias: 'text_1', value: ['1-3-yellow'] });
    const createMarkables = vi.spyOn(component.markableSupport, 'createMarkables').mockImplementation(() => {});
    vi.spyOn(component.markableSupport, 'registerRangeClicks').mockImplementation(() => {});

    initComponent(createText({ markingMode: 'word' }));

    expect(createMarkables).toHaveBeenCalledWith(['1-3-yellow'], component.elementComponent);
  });

  it('should not create markables for a selection marking element', () => {
    const createMarkables = vi.spyOn(component.markableSupport, 'createMarkables').mockImplementation(() => {});

    initComponent(createText({ markingMode: 'selection' }));

    expect(createMarkables).not.toHaveBeenCalled();
  });

  it('should report changed element values to the unit state service', () => {
    initComponent(createText({ markingMode: 'selection' }));

    component.changeElementCodeValue({
      id: 'text_1',
      value: 'Lorem <aspect-marked style="background-color: rgb(249, 248, 113);">ipsum</aspect-marked> dolor'
    });

    expect(unitStateService.changeElementCodeValue).toHaveBeenCalledWith({
      id: 'text_1',
      value: ['6-11-#f9f871']
    });
  });

  /* The initial announcement is scheduled in ngAfterViewInit through the NgZone, so the
     fixture is awaited instead of using tick(). */
  it('should announce its marking colour to the marking panels', async () => {
    const broadcastMarkingColorData = vi.spyOn(markingPanelService, 'broadcastMarkingColorData');
    initComponent(createText({ markingMode: 'selection', markingPanels: ['marking-panel_1'] }));

    await fixture.whenStable();

    expect(broadcastMarkingColorData).toHaveBeenCalledWith({
      color: undefined,
      id: 'text_1',
      markingMode: 'selection',
      markingPanels: ['marking-panel_1']
    });

    component.broadcastMarkingColorChange('yellow');

    expect(broadcastMarkingColorData).toHaveBeenCalledWith({
      color: 'yellow',
      id: 'text_1',
      markingMode: 'selection',
      markingPanels: ['marking-panel_1']
    });
  });

  it('should apply the marking data of a connected marking panel', () => {
    initComponent(createText({ markingMode: 'selection', markingPanels: ['marking-panel_1'] }));
    const applyMarkingData = vi.spyOn(component.textMarkingSupport, 'applyMarkingData');
    const markingData = {
      active: true, mode: 'mark', color: '#f9f871', colorName: 'yellow'
    } as MarkingData;

    markingPanelService.broadcastMarkingData({ id: 'marking-panel_1', markingData } as MarkingPanelMarkingData);

    expect(component.elementComponent.selectedColor.value).toBe('yellow');
    expect(applyMarkingData).toHaveBeenCalledWith(markingData, component.elementComponent);
  });

  it('should ignore the marking data of an unconnected marking panel', () => {
    initComponent(createText({ markingMode: 'selection', markingPanels: ['marking-panel_1'] }));
    const applyMarkingData = vi.spyOn(component.textMarkingSupport, 'applyMarkingData');

    markingPanelService.broadcastMarkingData({
      id: 'marking-panel_2',
      markingData: { active: true, mode: 'mark', color: '#f9f871', colorName: 'yellow' }
    } as MarkingPanelMarkingData);

    expect(applyMarkingData).not.toHaveBeenCalled();
  });

  it('should reset the selected colour when the marking panel is switched off', () => {
    initComponent(createText({ markingMode: 'selection', markingPanels: ['marking-panel_1'] }));

    markingPanelService.broadcastMarkingData({
      id: 'marking-panel_1',
      markingData: { active: false, mode: 'mark', color: '#f9f871', colorName: 'yellow' }
    } as MarkingPanelMarkingData);

    expect(component.elementComponent.selectedColor.value).toBeUndefined();
  });

  it('should read the selected colour out of the marking data', () => {
    expect(TextGroupElementComponent.getSelectedColorValue({
      active: true, mode: 'mark', color: '#f9f871', colorName: 'yellow'
    } as MarkingData)).toBe('yellow');
    expect(TextGroupElementComponent.getSelectedColorValue({
      active: false, mode: 'mark', color: '#f9f871', colorName: 'yellow'
    } as MarkingData)).toBeUndefined();
  });

  it('should show the marking bar only for elements with a selection popup', () => {
    initComponent(createText({ markingMode: 'selection', hasSelectionPopup: false }));
    expect(fixture.nativeElement.querySelector('aspect-floating-marking-bar')).toBeNull();

    component.elementModel = createText({ markingMode: 'selection', hasSelectionPopup: true });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('aspect-floating-marking-bar')).toBeTruthy();
  });

  it('should stop reacting on marking panel data after destruction', () => {
    initComponent(createText({ markingMode: 'selection', markingPanels: ['marking-panel_1'] }));
    const applyMarkingData = vi.spyOn(component.textMarkingSupport, 'applyMarkingData');

    fixture.destroy();
    markingPanelService.broadcastMarkingData({
      id: 'marking-panel_1',
      markingData: { active: true, mode: 'mark', color: '#f9f871', colorName: 'yellow' }
    } as MarkingPanelMarkingData);

    expect(applyMarkingData).not.toHaveBeenCalled();
  });

  it('should use the stored word markings as element value', () => {
    unitStateService.getElementCodeById
      .mockReturnValue({ id: 'text_1', alias: 'text_1', value: ['0-1-yellow'] });
    vi.spyOn(component.markableSupport, 'createMarkables').mockImplementation(() => {});
    vi.spyOn(component.markableSupport, 'registerRangeClicks').mockImplementation(() => {});

    initComponent(createText({ markingMode: 'word' }));

    expect(component.savedMarks).toEqual(['0-1-yellow']);
  });
});

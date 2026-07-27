/* eslint-disable max-classes-per-file */
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { ElementComponent } from 'common/directives/element-component.directive';
import { ButtonElement } from 'common/models/elements/action-group-elements/button';
import { ClozeElement } from 'common/models/elements/compound-group-elements/cloze/cloze';
import { LikertElement } from 'common/models/elements/compound-group-elements/likert/likert';
import { TableElement, TableProperties } from 'common/models/elements/compound-group-elements/table/table';
import { UIElement } from 'common/models/elements/element';
import { ImageElement } from 'common/models/elements/interactive-group-elements/image';
import { AudioElement } from 'common/models/elements/media-player-group-elements/audio';
import { PropertyGroupGenerators } from 'common/models/elements/property-group-interfaces';
import { TextElement } from 'common/models/elements/text-group-elements/text';
import { TextFieldElement } from 'common/models/elements/text-input-group-elements/text-field';
import { MarkingPanelMarkingData } from 'common/models/marking-data';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { VeronaPostService } from 'player/modules/verona/services/verona-post.service';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { AnchorService } from 'player/src/app/services/anchor.service';
import { MarkingPanelService } from 'player/src/app/services/marking-panel.service';
import { MediaPlayerService } from 'player/src/app/services/media-player.service';
import { NavigationService } from 'player/src/app/services/navigation.service';
import { StateVariableStateService } from 'player/src/app/services/state-variable-state.service';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import {
  CompoundGroupElementComponent
} from './compound-group-element.component';

@Component({
  selector: 'aspect-likert',
  template: '',
  standalone: false
})
class LikertStubComponent extends ElementComponent {
  @Input() elementModel!: LikertElement;
  @Input() parentForm!: UntypedFormGroup;
  @Output() childrenAdded = new EventEmitter<ElementComponent[]>();
}

@Component({
  selector: 'aspect-cloze',
  template: '',
  standalone: false
})
class ClozeStubComponent extends ElementComponent {
  @Input() elementModel!: ClozeElement;
  @Input() parentForm!: UntypedFormGroup;
  @Output() childrenAdded = new EventEmitter<ElementComponent[]>();
}

@Component({
  selector: 'aspect-table',
  template: '',
  standalone: false
})
class TableStubComponent extends ElementComponent {
  @Input() elementModel!: TableElement;
  @Input() parentForm!: UntypedFormGroup;
  @Input() savedTexts!: { [key: string]: string };
  @Input() savedPlaybackTimes!: { [key: string]: number };
  @Input() actualPlayingId!: unknown;
  @Input() mediaStatusChanged!: unknown;
  @Output() childrenAdded = new EventEmitter<ElementComponent[]>();
}

@Component({
  selector: 'aspect-floating-keypad',
  template: '',
  standalone: false
})
class MockFloatingKeypadComponent {
  @Input() isKeypadOpen!: boolean;
}

describe('CompoundGroupElementComponent', () => {
  let component: CompoundGroupElementComponent;
  let fixture: ComponentFixture<CompoundGroupElementComponent>;
  let unitStateService: SpyObj<UnitStateService>;
  let mediaPlayerService: SpyObj<MediaPlayerService>;
  let veronaPostService: SpyObj<VeronaPostService>;
  let navigationService: SpyObj<NavigationService> & {
    enabledNavigationTargets: BehaviorSubject<string[] | undefined>;
  };
  let anchorService: SpyObj<AnchorService>;
  let stateVariableStateService: SpyObj<StateVariableStateService>;
  let markingPanelService: MarkingPanelService;

  const createTable = (elements: UIElement[]): TableElement => {
    const table = new TableElement({
      type: 'table', id: 'table_1', alias: 'table_1', elements: []
    } as Partial<TableProperties>);
    table.elements = elements;
    return table;
  };

  const createAudio = (id: string, minRuns: number = 0): AudioElement => {
    const audio = new AudioElement({ type: 'audio', id, alias: id });
    audio.player = { ...PropertyGroupGenerators.generatePlayerProps({}), minRuns };
    return audio;
  };

  const createText = (id: string, properties: Partial<TextElement> = {}): TextElement => {
    const text = new TextElement({ type: 'text', id, alias: id });
    Object.assign(text, properties);
    return text;
  };

  const createChild = (elementModel: UIElement, extras: Record<string, unknown> = {}): ElementComponent => ({
    domElement: document.createElement('div'),
    elementModel,
    ...extras
  } as unknown as ElementComponent);

  const initComponent = (elementModel: UIElement): void => {
    fixture = TestBed.createComponent(CompoundGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = elementModel;
    component.pageIndex = 1;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    unitStateService = createSpyObj<UnitStateService>([
      'getElementCodeById', 'changeElementCodeValue', 'registerElementCode'
    ]);
    mediaPlayerService = createSpyObj<MediaPlayerService>([
      'registerMediaElement', 'setActualPlayingId', 'setValidStatusChanged'
    ]);
    veronaPostService = createSpyObj<VeronaPostService>(['sendVopUnitNavigationRequestedNotification']);
    navigationService = Object.assign(
      createSpyObj<NavigationService>(['setPage']),
      { enabledNavigationTargets: new BehaviorSubject<string[] | undefined>(undefined) }
    );
    anchorService = createSpyObj<AnchorService>(['toggleAnchor', 'showAnchor', 'hideAllAnchors', 'reset']);
    stateVariableStateService = createSpyObj<StateVariableStateService>(['changeElementCodeValue']);

    await TestBed.configureTestingModule({
      declarations: [
        CompoundGroupElementComponent,
        LikertStubComponent,
        ClozeStubComponent,
        TableStubComponent,
        MockFloatingKeypadComponent,
        CastPipe
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: UnitStateService, useValue: unitStateService },
        { provide: MediaPlayerService, useValue: mediaPlayerService },
        { provide: VeronaPostService, useValue: veronaPostService },
        { provide: NavigationService, useValue: navigationService },
        { provide: AnchorService, useValue: anchorService },
        { provide: StateVariableStateService, useValue: stateVariableStateService }
      ]
    })
      .compileComponents();

    markingPanelService = TestBed.inject(MarkingPanelService);
  });

  it('should create', () => {
    initComponent(new LikertElement({ id: 'likert_1', alias: 'likert_1' }));

    expect(component).toBeTruthy();
  });

  it('should show the component matching the element type', () => {
    initComponent(new LikertElement({ id: 'likert_1', alias: 'likert_1' }));
    expect(fixture.debugElement.query(By.directive(LikertStubComponent))).toBeTruthy();

    initComponent(new ClozeElement({ id: 'cloze_1', alias: 'cloze_1' }));
    expect(fixture.debugElement.query(By.directive(ClozeStubComponent))).toBeTruthy();

    initComponent(createTable([]));
    expect(fixture.debugElement.query(By.directive(TableStubComponent))).toBeTruthy();
  });

  it('should register itself at the unit state service', () => {
    const elementModel = new LikertElement({ id: 'likert_1', alias: 'likert_1' });
    elementModel.isRelevantForPresentationComplete = true;

    initComponent(elementModel);

    expect(unitStateService.registerElementCode)
      .toHaveBeenCalledWith('likert_1', 'likert_1', null, component.elementComponent.domElement, 1);
  });

  it('should add a form control for every input child', () => {
    const table = createTable([
      new TextFieldElement({ type: 'text-field', id: 'text-field_1', alias: 'text-field_1' }),
      new TextFieldElement({ type: 'text-field', id: 'text-field_2', alias: 'text-field_2' })
    ]);

    initComponent(table);

    expect(Object.keys(component.form.controls)).toEqual(['text-field_1', 'text-field_2']);
  });

  it('should register audio children at the media player service', () => {
    initComponent(createTable([createAudio('audio_1', 0), createAudio('audio_2', 1)]));

    expect(mediaPlayerService.registerMediaElement).toHaveBeenCalledWith('audio_1', true);
    expect(mediaPlayerService.registerMediaElement).toHaveBeenCalledWith('audio_2', false);
  });

  it('should take over the stored playback time of audio children', () => {
    unitStateService.getElementCodeById
      .mockImplementation((id: string) => (id === 'audio_1' ?
        { id, alias: id, value: 12 } :
        undefined));

    initComponent(createTable([createAudio('audio_1')]));

    expect(component.savedPlaybackTimes.audio_1).toBe(12);
  });

  it('should prepare the marking support of text children', () => {
    unitStateService.getElementCodeById
      .mockImplementation((id: string) => (id === 'text_1' ?
        { id, alias: id, value: ['1-3-yellow'] } :
        undefined));

    initComponent(createTable([createText('text_1', { markingMode: 'selection' })]));

    expect(component.textMarkingSupports.text_1).toBeTruthy();
    expect(component.markableSupports.text_1).toBeTruthy();
    expect(component.savedMarks.text_1).toEqual(['1-3-yellow']);
  });

  it('should mark the children with their id and alias', () => {
    initComponent(createTable([]));
    const child = createChild(new TextFieldElement({
      type: 'text-field', id: 'text-field_1', alias: 'alias_1'
    }), { onKeyDown: new EventEmitter(), onPaste: new EventEmitter(), focusChanged: new EventEmitter() });

    component.registerCompoundChildren([child]);

    expect(child.domElement.getAttribute('data-element-id')).toBe('text-field_1');
    expect(child.domElement.getAttribute('data-element-alias')).toBe('alias_1');
  });

  it('should register an input child with its value', () => {
    initComponent(createTable([]));
    const elementModel = new TextFieldElement({ type: 'text-field', id: 'text-field_1', alias: 'text-field_1' });
    elementModel.value = 'stored';
    const child = createChild(elementModel, {
      onKeyDown: new EventEmitter(), onPaste: new EventEmitter(), focusChanged: new EventEmitter()
    });

    component.registerCompoundChildren([child]);

    expect(unitStateService.registerElementCode)
      .toHaveBeenCalledWith('text-field_1', 'text-field_1', 'stored', child.domElement, 1);
  });

  it('should register a button child without a value', () => {
    initComponent(createTable([]));
    const child = createChild(new ButtonElement({ id: 'button_1', alias: 'button_1' }), {
      buttonActionEvent: new EventEmitter()
    });

    component.registerCompoundChildren([child]);

    expect(unitStateService.registerElementCode)
      .toHaveBeenCalledWith('button_1', 'button_1', null, child.domElement, 1);
  });

  /*
   * Documents current behaviour: for an image child the initial value is read from the
   * magnifierUsed property of the compound element itself, which a table does not have,
   * so the registered value stays undefined.
   */
  it('should register an image child without a magnifier state', () => {
    initComponent(createTable([]));
    const child = createChild(
      new ImageElement({ type: 'image', id: 'image_1', alias: 'image_1' }),
      { elementValueChanged: new EventEmitter() }
    );

    component.registerCompoundChildren([child]);

    expect(unitStateService.registerElementCode)
      .toHaveBeenCalledWith('image_1', 'image_1', undefined, child.domElement, 1);
  });

  it('should report a changed audio playback time of a child', () => {
    initComponent(createTable([createAudio('audio_1')]));
    const elementValueChanged = new EventEmitter<{ id: string, value: number }>();
    const child = createChild(createAudio('audio_1'), {
      elementValueChanged,
      mediaValidStatusChanged: new EventEmitter(),
      mediaPlayStatusChanged: new EventEmitter()
    });
    component.registerCompoundChildren([child]);

    elementValueChanged.emit({ id: 'audio_1', value: 20 });

    expect(unitStateService.changeElementCodeValue).toHaveBeenCalledWith({ id: 'audio_1', value: 20 });
  });

  it('should report the media status of an audio child', () => {
    initComponent(createTable([createAudio('audio_1')]));
    const mediaValidStatusChanged = new EventEmitter<string>();
    const mediaPlayStatusChanged = new EventEmitter<string | null>();
    component.registerCompoundChildren([createChild(createAudio('audio_1'), {
      elementValueChanged: new EventEmitter(), mediaValidStatusChanged, mediaPlayStatusChanged
    })]);

    mediaValidStatusChanged.emit('audio_1');
    mediaPlayStatusChanged.emit('audio_1');

    expect(mediaPlayerService.setValidStatusChanged).toHaveBeenCalledWith('audio_1');
    expect(mediaPlayerService.setActualPlayingId).toHaveBeenCalledWith('audio_1');
  });

  it('should apply the button actions of a button child', () => {
    initComponent(createTable([]));
    const buttonActionEvent = new EventEmitter<{ action: string, param: unknown }>();
    const buttonModel = new ButtonElement({ id: 'button_1', alias: 'button_1' });
    buttonModel.action = 'unitNav';
    component.registerCompoundChildren([createChild(buttonModel, { buttonActionEvent })]);

    buttonActionEvent.emit({ action: 'unitNav', param: 'next' });
    expect(veronaPostService.sendVopUnitNavigationRequestedNotification).toHaveBeenCalledWith('next');

    buttonActionEvent.emit({ action: 'pageNav', param: 2 });
    expect(navigationService.setPage).toHaveBeenCalledWith(2);

    buttonActionEvent.emit({ action: 'highlightText', param: 'anchor_1' });
    expect(anchorService.toggleAnchor).toHaveBeenCalledWith('anchor_1');

    buttonActionEvent.emit({ action: 'stateVariableChange', param: { id: 'state_1', value: '1' } });
    expect(stateVariableStateService.changeElementCodeValue)
      .toHaveBeenCalledWith({ id: 'state_1', value: '1' });
  });

  it('should announce the marking colour of a text child', fakeAsync(() => {
    const textModel = createText('text_1', { markingMode: 'selection', markingPanels: ['marking-panel_1'] });
    initComponent(createTable([textModel]));
    const broadcastMarkingColorData = vi.spyOn(markingPanelService, 'broadcastMarkingColorData');
    const selectedColorChanged = new EventEmitter<string | undefined>();
    component.registerCompoundChildren([createChild(textModel, {
      selectedColorChanged,
      selectedColor: new BehaviorSubject<string | undefined>(undefined),
      textSelectionStart: new EventEmitter(),
      markingDataChanged: new EventEmitter(),
      elementValueChanged: new EventEmitter()
    })]);

    tick();
    expect(broadcastMarkingColorData).toHaveBeenCalledWith({
      color: undefined, id: 'text_1', markingMode: 'selection', markingPanels: ['marking-panel_1']
    });

    selectedColorChanged.emit('yellow');

    expect(broadcastMarkingColorData).toHaveBeenCalledWith({
      color: 'yellow', id: 'text_1', markingMode: 'selection', markingPanels: ['marking-panel_1']
    });
  }));

  it('should apply the marking data of a connected marking panel to a text child', fakeAsync(() => {
    const textModel = createText('text_1', { markingMode: 'selection', markingPanels: ['marking-panel_1'] });
    initComponent(createTable([textModel]));
    const selectedColor = new BehaviorSubject<string | undefined>(undefined);
    const child = createChild(textModel, {
      selectedColorChanged: new EventEmitter(),
      selectedColor,
      textSelectionStart: new EventEmitter(),
      markingDataChanged: new EventEmitter(),
      elementValueChanged: new EventEmitter()
    });
    component.registerCompoundChildren([child]);
    tick();
    const applyMarkingData = vi.spyOn(component.textMarkingSupports.text_1, 'applyMarkingData');
    const markingData = {
      active: true, mode: 'mark', color: '#f9f871', colorName: 'yellow'
    };

    markingPanelService.broadcastMarkingData({
      id: 'marking-panel_1', markingData
    } as MarkingPanelMarkingData);

    expect(selectedColor.value).toBe('yellow');
    expect(applyMarkingData).toHaveBeenCalledWith(markingData, child);
  }));

  it('should show a unit navigation button only for enabled navigation targets', () => {
    initComponent(createTable([]));
    const buttonModel = new ButtonElement({ id: 'button_1', alias: 'button_1' });
    buttonModel.action = 'unitNav';
    buttonModel.actionParam = 'next';
    const child = createChild(buttonModel, { buttonActionEvent: new EventEmitter() });
    component.registerCompoundChildren([child]);

    navigationService.enabledNavigationTargets.next(['next']);
    expect(child.domElement.classList).toContain('hide-navigation');

    navigationService.enabledNavigationTargets.next([]);
    expect(child.domElement.classList).not.toContain('hide-navigation');
  });

  it('should stop reacting on child events after destruction', () => {
    initComponent(createTable([]));
    const buttonActionEvent = new EventEmitter<{ action: string, param: unknown }>();
    const buttonModel = new ButtonElement({ id: 'button_1', alias: 'button_1' });
    buttonModel.action = 'pageNav';
    component.registerCompoundChildren([createChild(buttonModel, { buttonActionEvent })]);

    fixture.destroy();
    buttonActionEvent.emit({ action: 'pageNav', param: 2 });

    expect(navigationService.setPage).not.toHaveBeenCalled();
  });
});

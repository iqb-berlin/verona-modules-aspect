import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { PlayerTranslateLoader } from 'player/src/app/classes/player-translate-loader';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Response } from '@iqb/responses';
import { FileService } from 'common/services/file.service';
import {
  VopPageNavigationCommand, VopPlayerConfigChangedNotification, VopStartCommand
} from 'player/modules/verona/models/verona';
import { UnitMenuComponent } from './unit-menu.component';

describe('UnitMenuComponent', () => {
  let component: UnitMenuComponent;
  let fixture: ComponentFixture<UnitMenuComponent>;
  let postMessage: ReturnType<typeof vi.spyOn>;

  const createResponse = (alias: string, value: string): Response & { alias: string } => ({
    id: `element_${alias}`, alias, status: 'VALUE_CHANGED', value
  });

  const lastMessage = <T>(): T => {
    const calls = postMessage.mock.calls;
    return calls[calls.length - 1][0] as T;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        UnitMenuComponent
      ],
      imports: [
        MatFormFieldModule,
        MatDividerModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatIconModule,
        MatMenuModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: PlayerTranslateLoader
          }
        })
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitMenuComponent);
    component = fixture.componentInstance;
    component.elementCodes = [createResponse('alias_1', 'a')];
    component.stateVariableCodes = [createResponse('state_1', '1')];
    component.geometryVariableCodes = [createResponse('geometry_1', 'g')];
    postMessage = vi.spyOn(window, 'postMessage');
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load a unit definition and start it in the given paging mode', async () => {
    vi.spyOn(FileService, 'loadFile').mockResolvedValue({ name: 'unit.json', content: '{"type":"aspect-unit"}' });

    await component.load('concat-scroll', 'off');

    const message = lastMessage<VopStartCommand>();
    expect(message.type).toBe('vopStartCommand');
    expect(message.unitDefinition).toBe('{"type":"aspect-unit"}');
    expect(message.playerConfig?.pagingMode).toBe('concat-scroll');
    expect(message.playerConfig?.printMode).toBe('off');
  });

  it('should start the loaded unit in print mode', async () => {
    vi.spyOn(FileService, 'loadFile').mockResolvedValue({ name: 'unit.json', content: '{}' });

    await component.load('separate', 'on');

    expect(lastMessage<VopStartCommand>().playerConfig?.printMode).toBe('on');
  });

  it('should hand the entered start page over to the player', async () => {
    vi.spyOn(FileService, 'loadFile').mockResolvedValue({ name: 'unit.json', content: '{}' });
    component.formControl.setValue('2');

    await component.load('separate', 'off');

    expect(lastMessage<VopStartCommand>().playerConfig?.startPage).toBe('2');
  });

  it('should reload the unit with the collected responses under their alias', () => {
    component.reloadUnit();

    const message = lastMessage<VopStartCommand>();
    expect(message.type).toBe('vopStartCommand');
    expect(message.unitState?.dataParts?.elementCodes)
      .toBe(JSON.stringify([{ id: 'alias_1', status: 'VALUE_CHANGED', value: 'a' }]));
    expect(message.unitState?.dataParts?.stateVariableCodes)
      .toBe(JSON.stringify([{ id: 'state_1', status: 'VALUE_CHANGED', value: '1' }]));
    expect(message.unitState?.dataParts?.geometryVariableCodes)
      .toBe(JSON.stringify([{ id: 'geometry_1', status: 'VALUE_CHANGED', value: 'g' }]));
  });

  it('should navigate to a page', () => {
    component.goToPage(3);

    const message = lastMessage<VopPageNavigationCommand>();
    expect(message.type).toBe('vopPageNavigationCommand');
    expect(message.target).toBe('3');
  });

  it('should change the paging mode', () => {
    component.changePagingMode('buttons');

    const message = lastMessage<VopPlayerConfigChangedNotification>();
    expect(message.type).toBe('vopPlayerConfigChangedNotification');
    expect(message.playerConfig.pagingMode).toBe('buttons');
  });

  it('should enable navigation targets', () => {
    component.enableNavigationTargets(['next', 'previous']);

    expect(lastMessage<VopPlayerConfigChangedNotification>().playerConfig.enabledNavigationTargets)
      .toEqual(['next', 'previous']);
  });

  it('should disable all navigation targets', () => {
    component.enableNavigationTargets(undefined);

    expect(lastMessage<VopPlayerConfigChangedNotification>().playerConfig.enabledNavigationTargets)
      .toBeUndefined();
  });
});

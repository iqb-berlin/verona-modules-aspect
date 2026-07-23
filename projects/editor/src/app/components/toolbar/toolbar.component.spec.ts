import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TranslateModule } from '@ngx-translate/core';
import { FileService } from 'common/services/file.service';
import { ToolbarComponent } from './toolbar.component';
import { UnitService } from '../../services/unit.service';
import { VeronaAPIService } from '../../services/verona-api.service';

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;
  let unitServiceSpy: jasmine.SpyObj<UnitService>;
  let mockVeronaApiService: Pick<VeronaAPIService, 'sessionID' | 'resourceURL'>;

  beforeEach(async () => {
    unitServiceSpy = jasmine.createSpyObj<UnitService>('UnitService', ['saveUnit']);
    mockVeronaApiService = {
      sessionID: 'session-1',
      resourceURL: 'https://example.test/assets'
    };

    await TestBed.configureTestingModule({
      declarations: [ToolbarComponent],
      imports: [
        MatButtonModule,
        MatIconModule,
        MatToolbarModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: UnitService, useValue: unitServiceSpy },
        { provide: VeronaAPIService, useValue: mockVeronaApiService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delegate save to UnitService', () => {
    component.save();

    expect(unitServiceSpy.saveUnit.mock.calls.length).toBe(1);
  });

  it('should load a unit file and post a voeStartCommand message', async () => {
    const postMessageSpy = vi.spyOn(window, 'postMessage');
    const loadFileSpy = vi.spyOn(FileService, 'loadFile').mockReturnValue(
      Promise.resolve({ name: 'unit.json', content: '{"type":"unit"}' })
    );

    await component.load();

    expect(loadFileSpy.mock.calls.length).toBe(1);
    expect(loadFileSpy.calls.mostRecent().args).toEqual([['.json', '.voud']]);
    expect(postMessageSpy.mock.calls.length).toBe(1);
    expect(postMessageSpy.calls.mostRecent().args).toEqual([
      {
        type: 'voeStartCommand',
        sessionId: 'session-1',
        unitDefinition: '{"type":"unit"}',
        unitDefinitionType: 'aspect-unit-definition',
        editorConfig: {
          directDownloadUrl: 'https://example.test/assets',
          role: 'maintainer'
        }
      }, '*'
    ]);
  });

  it('should fall back to dev and assets when VeronaAPIService has no values', async () => {
    mockVeronaApiService.sessionID = undefined;
    mockVeronaApiService.resourceURL = undefined;

    const postMessageSpy = vi.spyOn(window, 'postMessage');
    vi.spyOn(FileService, 'loadFile').mockReturnValue(
      Promise.resolve({ name: 'unit.json', content: '{"type":"unit"}' })
    );

    await component.load();

    expect(postMessageSpy.mock.calls.length).toBe(1);
    expect(postMessageSpy.calls.mostRecent().args).toEqual([
      {
        type: 'voeStartCommand',
        sessionId: 'dev',
        unitDefinition: '{"type":"unit"}',
        unitDefinitionType: 'aspect-unit-definition',
        editorConfig: {
          directDownloadUrl: 'assets',
          role: 'maintainer'
        }
      }, '*'
    ]);
  });
});

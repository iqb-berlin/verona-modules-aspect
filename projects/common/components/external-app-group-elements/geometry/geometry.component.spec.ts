import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { PageChangeService } from 'common/services/page-change.service';
import { ExternalResourceService } from 'common/services/external-resource.service';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { GeometryElement } from 'common/models/elements/external-app-group-elements/geometry';
import { GeometryComponent } from './geometry.component';

describe('GeometryComponent', () => {
  let component: GeometryComponent;
  let fixture: ComponentFixture<GeometryComponent>;
  let mockPageChangeService: Partial<PageChangeService>;
  let mockExternalResourceService: Partial<ExternalResourceService>;
  let mockGeoGebraAPI: any;

  beforeEach(async () => {
    mockPageChangeService = {
      pageChanged: new EventEmitter<void>()
    };

    mockExternalResourceService = {
      initializeGeoGebra: vi.fn(),
      isGeoGebraLoaded: vi.fn().mockReturnValue(of(true)),
      getGeoGebraHTML5URL: vi.fn().mockReturnValue('http://geogebra.url')
    };

    mockGeoGebraAPI = {
      getBase64: vi.fn().mockReturnValue('mockBase64'),
      getAllObjectNames: vi.fn().mockReturnValue([]),
      getValueString: vi.fn(),
      registerAddListener: vi.fn(),
      registerRemoveListener: vi.fn(),
      registerUpdateListener: vi.fn(),
      registerRenameListener: vi.fn(),
      registerClearListener: vi.fn(),
      registerClientListener: vi.fn()
    };

    // Global Mock for GGBApplet with named function to satisfy ESLint and constructor requirements
    (window as any).GGBApplet = vi.fn()
      .mockImplementation(function GGBAppletMock(this: any, params: any) {
        this.setHTML5Codebase = vi.fn();
        this.inject = vi.fn().mockImplementation(() => {
          if (params.appletOnLoad) {
            params.appletOnLoad(mockGeoGebraAPI);
          }
        });
      });

    await TestBed.configureTestingModule({
      declarations: [GeometryComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: PageChangeService, useValue: mockPageChangeService },
        { provide: ExternalResourceService, useValue: mockExternalResourceService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(GeometryComponent);
    component = fixture.componentInstance;
    component.elementModel = new GeometryElement({
      id: 'test-id',
      type: 'geometry',
      appDefinition: 'initial-def',
      trackedExpectedVariables: [],
      dimensions: {
        width: 200, height: 200
      }
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not emit valuechanged on initial load (no user interaction)', fakeAsync(() => {
    vi.spyOn(component.elementValueChanged, 'emit');

    // Simulate GeoGebra update without user interaction
    (component as any).geometryUpdated.next();
    tick(200);

    expect(component.elementValueChanged.emit).not.toHaveBeenCalled();
  }));

  it('should emit valuechanged after pointerdown interaction', fakeAsync(() => {
    vi.spyOn(component.elementValueChanged, 'emit');

    // Simulate user interaction
    const event = new PointerEvent('pointerdown');
    fixture.nativeElement.dispatchEvent(event);

    component.geoGebraAPI = mockGeoGebraAPI;

    // Simulate GeoGebra update
    (component as any).geometryUpdated.next();
    tick(200);

    expect(component.elementValueChanged.emit).toHaveBeenCalledWith(expect.objectContaining({
      id: 'test-id',
      value: expect.objectContaining({
        appDefinition: 'mockBase64'
      })
    }));
  }));

  it('should emit valuechanged after reset() is called', fakeAsync(() => {
    vi.spyOn(component.elementValueChanged, 'emit');

    component.reset();
    tick(200);

    expect(component.elementValueChanged.emit).toHaveBeenCalled();
  }));
});

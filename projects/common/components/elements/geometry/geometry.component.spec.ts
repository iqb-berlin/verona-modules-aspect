import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { PageChangeService } from 'common/services/page-change.service';
import { ExternalResourceService } from 'common/services/external-resource.service';
import { of, Subject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { Mock, MockInstance } from 'vitest';
import { GeometryElement } from 'common/models/elements/geometry';
import {
  GeoGebraApi, GeoGebraApplet, GeoGebraAppletConstructor, GeoGebraAppletParameters
} from 'common/models/geogebra-interfaces';
import { GeometryComponent } from './geometry.component';

describe('GeometryComponent', () => {
  let component: GeometryComponent;
  let fixture: ComponentFixture<GeometryComponent>;
  let mockPageChangeService: Partial<PageChangeService>;
  let mockExternalResourceService: Partial<ExternalResourceService>;
  let mockGeoGebraAPI: GeoGebraApi;
  let ggbApplet: Mock;

  /* The subject is private; the tests drive it directly to stand in for a GeoGebra event. */
  const geometryUpdated = (): Subject<void> => (
    component as unknown as { geometryUpdated: Subject<void> }
  ).geometryUpdated;

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
    ggbApplet = vi.fn()
      .mockImplementation(function GGBAppletMock(this: GeoGebraApplet, params: GeoGebraAppletParameters) {
        this.setHTML5Codebase = vi.fn();
        this.inject = vi.fn().mockImplementation(() => {
          if (params.appletOnLoad) {
            params.appletOnLoad(mockGeoGebraAPI);
          }
        });
      });
    (window as Window & { GGBApplet?: GeoGebraAppletConstructor }).GGBApplet =
      ggbApplet as unknown as GeoGebraAppletConstructor;

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

  it('should keep GeoGebra\'s keyboard inside the applet (#1549)', () => {
    component.refresh();

    expect(ggbApplet).toHaveBeenCalledWith(expect.objectContaining({ detachKeyboard: false }), '5.0');
  });

  it('should not emit valuechanged on initial load (no user interaction)', fakeAsync(() => {
    vi.spyOn(component.elementValueChanged, 'emit');

    // Simulate GeoGebra update without user interaction
    geometryUpdated().next();
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
    geometryUpdated().next();
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

  describe('recomputed tracked variables', () => {
    /* The listener the component hands GeoGebra; calling it stands in for GeoGebra recomputing an object. */
    let reportUpdate: (objectName: string) => void;

    beforeEach(() => {
      component.elementModel.trackedVariables = [{ id: 'A', value: 'A = false' }, { id: 'B', value: 'B = 1' }];
      component.elementModel.recomputedCountsAsChanged = true;
      component.refresh();
      expect(mockGeoGebraAPI.registerUpdateListener).toHaveBeenCalled();
      reportUpdate = objectName => vi.mocked(mockGeoGebraAPI.registerUpdateListener)
        .mock.lastCall?.[0](objectName);
      vi.spyOn(component.elementValueChanged, 'emit');
    });

    const emittedVariables = (): unknown => vi.mocked(component.elementValueChanged.emit).mock.lastCall?.[0]?.value;

    it('should mark the variables GeoGebra recomputed, and only those', fakeAsync(() => {
      fixture.nativeElement.dispatchEvent(new PointerEvent('pointerdown'));

      reportUpdate('A');
      tick(200);

      expect(emittedVariables()).toEqual(expect.objectContaining({
        variables: [
          expect.objectContaining({ id: 'A', wasUpdated: true }),
          expect.objectContaining({ id: 'B', wasUpdated: false })
        ]
      }));
    }));

    it('should mark no recomputed variable while the element has the switch off', fakeAsync(() => {
      component.elementModel.recomputedCountsAsChanged = false;
      fixture.nativeElement.dispatchEvent(new PointerEvent('pointerdown'));

      reportUpdate('A');
      tick(200);

      expect(emittedVariables()).toEqual(expect.objectContaining({
        variables: [
          expect.objectContaining({ id: 'A', wasUpdated: false }),
          expect.objectContaining({ id: 'B', wasUpdated: false })
        ]
      }));
    }));

    it('should forget a recomputation once it has been reported', fakeAsync(() => {
      fixture.nativeElement.dispatchEvent(new PointerEvent('pointerdown'));
      reportUpdate('A');
      tick(200);

      geometryUpdated().next();
      tick(200);

      expect(emittedVariables()).toEqual(expect.objectContaining({
        variables: [
          expect.objectContaining({ id: 'A', wasUpdated: false }),
          expect.objectContaining({ id: 'B', wasUpdated: false })
        ]
      }));
    }));

    it('should not count a recomputation from before the first interaction', fakeAsync(() => {
      reportUpdate('A');
      fixture.nativeElement.dispatchEvent(new PointerEvent('pointerdown'));

      geometryUpdated().next();
      tick(200);

      expect(emittedVariables()).toEqual(expect.objectContaining({
        variables: [
          expect.objectContaining({ id: 'A', wasUpdated: false }),
          expect.objectContaining({ id: 'B', wasUpdated: false })
        ]
      }));
    }));
  });

  describe('focus inside the applet (#971)', () => {
    let canvas: HTMLCanvasElement;
    let announcement: HTMLDivElement;

    beforeEach(() => {
      /* Builds what GeoGebra builds before it reports the applet as loaded: its canvas and the element
         it focuses for screen reader announcements. */
      ggbApplet.mockImplementationOnce(function GGBAppletMock(
        this: GeoGebraApplet, params: GeoGebraAppletParameters
      ) {
        this.setHTML5Codebase = vi.fn();
        this.inject = vi.fn().mockImplementation(() => {
          const container = fixture.nativeElement.querySelector('.geogebra-applet') as HTMLElement;
          canvas = document.createElement('canvas');
          announcement = document.createElement('div');
          announcement.classList.add('screenReaderStyle');
          container.replaceChildren(canvas, announcement);
          params.appletOnLoad(mockGeoGebraAPI);
        });
      });
      component.refresh();
    });

    let focus: MockInstance<HTMLElement['focus']>;
    beforeEach(() => {
      focus = vi.spyOn(HTMLElement.prototype, 'focus');
    });
    afterEach(() => {
      focus.mockRestore();
    });

    it.each([
      ['canvas', () => canvas],
      ['screen reader announcement', () => announcement]
    ])('should focus the %s without scrolling', (_, element) => {
      element().focus();

      expect(focus).toHaveBeenCalledWith({ preventScroll: true });
      expect(focus.mock.contexts[0]).toBe(element());
    });

    it('should keep the options GeoGebra passes', () => {
      // A browser option the DOM typings of this TypeScript version do not know yet.
      canvas.focus({ focusVisible: true } as FocusOptions);

      expect(focus).toHaveBeenCalledWith({ focusVisible: true, preventScroll: true });
    });

    it('should cover a view GeoGebra adds after loading, once it is tapped', () => {
      const laterCanvas = document.createElement('canvas');
      canvas.after(laterCanvas);

      fixture.nativeElement.dispatchEvent(new PointerEvent('pointerdown'));
      laterCanvas.focus();

      expect(focus).toHaveBeenCalledWith({ preventScroll: true });
      expect(focus.mock.contexts[0]).toBe(laterCanvas);
    });
  });

  it.each([true, false])('should hand showAlgebraInput %s to GeoGebra', showAlgebraInput => {
    ggbApplet.mockClear();
    component.elementModel.showAlgebraInput = showAlgebraInput;

    component.refresh();

    expect(ggbApplet).toHaveBeenCalledWith(expect.objectContaining({ showAlgebraInput }), '5.0');
  });
});

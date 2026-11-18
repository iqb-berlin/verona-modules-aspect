import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { PageChangeService } from 'common/services/page-change.service';
import { ExternalResourceService } from 'common/services/external-resource.service';
import { of, Subject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { Mock, MockInstance } from 'vitest';
// 'fflate/browser', not 'fflate': the bare specifier resolves to the Node ESM build under
// Vitest browser mode and crashes at import time on createRequire.
import {
  strFromU8, strToU8, unzipSync, zipSync
} from 'fflate/browser';
import { GeometryElement } from 'common/models/elements/geometry';
import {
  GeoGebraApi, GeoGebraApplet, GeoGebraAppletConstructor, GeoGebraAppletParameters
} from 'common/models/geogebra-interfaces';
import { GeometryValue } from 'common/models/geometry-interfaces';
import { GeometryComponent } from './geometry.component';

describe('GeometryComponent', () => {
  let component: GeometryComponent;
  let fixture: ComponentFixture<GeometryComponent>;
  let mockPageChangeService: Partial<PageChangeService>;
  let mockExternalResourceService: Partial<ExternalResourceService>;
  let mockGeoGebraAPI: GeoGebraApi;
  let ggbApplet: Mock;
  /* While set, injecting an applet does not load it: the test loads it, by calling its `appletOnLoad`. */
  let heldBackLoads: GeoGebraAppletParameters[] | undefined;

  /* The subject is private; the tests drive it directly to stand in for a GeoGebra event. */
  const geometryUpdated = (): Subject<void> => (
    component as unknown as { geometryUpdated: Subject<void> }
  ).geometryUpdated;

  /* The flag is private; the tests that build anew right after loading set it, standing in for the
     round of timers after loading in which the applet starts up. */
  const startUp = (): void => {
    (component as unknown as { isAppletStartedUp: boolean }).isAppletStartedUp = true;
  };

  /** Each applet shows a construction of its own, named, so that a test can tell whose answer it got. */
  const constructionOfApplet = (name: string): string => `<geogebra applet="${name}"/>`;

  /** The construction an answer holds. */
  const constructionOf = (answer: string): string => strFromU8(
    unzipSync(Uint8Array.from(atob(answer), character => character.charCodeAt(0)))['geogebra.xml']
  );

  const createGeoGebraApi = (name: string): GeoGebraApi => ({
    getXML: vi.fn().mockReturnValue(constructionOfApplet(name)),
    setSize: vi.fn(),
    getPerspectiveXML: vi.fn().mockReturnValue('<perspective><toolbar show="true" items="0 | 1 , 5"/></perspective>'),
    setCustomToolBar: vi.fn(),
    getAllObjectNames: vi.fn().mockReturnValue([]),
    getValueString: vi.fn(),
    isMoveable: vi.fn().mockReturnValue(true),
    registerAddListener: vi.fn(),
    registerRemoveListener: vi.fn(),
    registerUpdateListener: vi.fn(),
    registerRenameListener: vi.fn(),
    registerClearListener: vi.fn(),
    registerClientListener: vi.fn()
  });

  beforeEach(async () => {
    mockPageChangeService = {
      pageChanged: new EventEmitter<void>()
    };

    mockExternalResourceService = {
      initializeGeoGebra: vi.fn(),
      isGeoGebraLoaded: vi.fn().mockReturnValue(of(true)),
      getGeoGebraHTML5URL: vi.fn().mockReturnValue('http://geogebra.url')
    };

    mockGeoGebraAPI = createGeoGebraApi('mock');
    heldBackLoads = undefined;

    // Global Mock for GGBApplet with named function to satisfy ESLint and constructor requirements
    ggbApplet = vi.fn()
      .mockImplementation(function GGBAppletMock(this: GeoGebraApplet, params: GeoGebraAppletParameters) {
        this.setHTML5Codebase = vi.fn();
        this.inject = vi.fn().mockImplementation(() => {
          if (heldBackLoads) {
            heldBackLoads.push(params);
          } else if (params.appletOnLoad) {
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

    component.refresh();

    // Simulate GeoGebra update
    geometryUpdated().next();
    tick(200);

    expect(component.elementValueChanged.emit).toHaveBeenCalledWith(expect.objectContaining({ id: 'test-id' }));
  }));

  it('should emit valuechanged after reset() is called', fakeAsync(() => {
    vi.spyOn(component.elementValueChanged, 'emit');

    component.reset();
    tick(200);

    expect(component.elementValueChanged.emit).toHaveBeenCalled();
  }));

  describe('edits', () => {
    /* The listeners the component hands GeoGebra; calling one stands in for GeoGebra reporting. */
    const listener = (register: keyof GeoGebraApi): ((...args: string[]) => void) => (...args) => (
      vi.mocked(mockGeoGebraAPI[register]).mock.lastCall?.[0] as (...a: string[]) => void
    )(...args);
    const reportUpdate = listener('registerUpdateListener');

    beforeEach(() => {
      component.elementModel.trackedVariables = [{ id: 'A', value: 'A = false' }, { id: 'B', value: 'B = 1' }];
      vi.mocked(mockGeoGebraAPI.getValueString).mockImplementation(name => `${name} = 0`);
      component.refresh();
      startUp();
      vi.spyOn(component.elementValueChanged, 'emit');
    });

    const reported = (): unknown => vi.mocked(component.elementValueChanged.emit).mock.lastCall?.[0]?.value;
    const interact = (): void => { fixture.nativeElement.dispatchEvent(new PointerEvent('pointerdown')); };

    it('should report an edit when GeoGebra recomputes an object the user can change', fakeAsync(() => {
      interact();

      reportUpdate('A');
      tick(200);

      expect(reported()).toEqual(expect.objectContaining({ edited: true }));
    }));

    it('should report no edit when GeoGebra recomputes only what follows the view, as on zooming', fakeAsync(() => {
      vi.mocked(mockGeoGebraAPI.isMoveable).mockReturnValue(false);
      interact();

      reportUpdate('cornerText');
      tick(200);

      expect(reported()).toEqual(expect.objectContaining({ edited: false }));
    }));

    it.each([
      ['an object added', 'registerAddListener'],
      ['an object removed', 'registerRemoveListener'],
      ['an object renamed', 'registerRenameListener']
    ] as const)('should report %s as an edit', fakeAsync((_: string, register: keyof GeoGebraApi) => {
      interact();

      listener(register)('P');
      tick(200);

      expect(reported()).toEqual(expect.objectContaining({ edited: true }));
    }));

    it('should report a click as no edit, but report it', fakeAsync(() => {
      interact();

      listener('registerClientListener')();
      tick(200);

      expect(reported()).toEqual(expect.objectContaining({ response: expect.any(String), edited: false }));
    }));

    it('should report a reset as no edit', fakeAsync(() => {
      component.reset();
      tick(200);

      expect(reported()).toEqual(expect.objectContaining({ edited: false }));
    }));

    it('should forget an edit once it has been reported', fakeAsync(() => {
      interact();
      reportUpdate('A');
      tick(200);

      geometryUpdated().next();
      tick(200);

      expect(reported()).toEqual(expect.objectContaining({ edited: false }));
    }));

    it('should not count an edit from before the first interaction', fakeAsync(() => {
      reportUpdate('A');
      interact();

      geometryUpdated().next();
      tick(200);

      expect(reported()).toEqual(expect.objectContaining({ edited: false }));
    }));

    it('should report the values of the tracked variables as soon as the applet has loaded', () => {
      const loaded = vi.spyOn(component.appletLoaded, 'emit');

      component.reset();

      expect(loaded).toHaveBeenCalledWith([{ id: 'A', value: 'A = 0' }, { id: 'B', value: 'B = 0' }]);
    });

    it('should report the values of the tracked variables', fakeAsync(() => {
      interact();

      geometryUpdated().next();
      tick(200);

      expect(reported()).toEqual(expect.objectContaining({
        variables: [{ id: 'A', value: 'A = 0' }, { id: 'B', value: 'B = 0' }]
      }));
    }));
  });

  describe('pictures from the person\'s device (#1700)', () => {
    const showToolbar = (items: string): void => {
      vi.mocked(mockGeoGebraAPI.getPerspectiveXML)
        .mockReturnValue(`<perspective><toolbar show="true" items="${items}" position="1"/></perspective>`);
    };
    /** A new applet, which reads the toolbar anew as it loads. */
    // The element of the outer setup leaves the switch unset, which a unit's element never does.
    beforeEach(() => {
      component.elementModel.showToolbar = true;
    });

    const buildApplet = (): void => {
      vi.mocked(mockGeoGebraAPI.setCustomToolBar).mockClear();
      vi.mocked(mockGeoGebraAPI.registerAddListener).mockClear();
      startUp();
      component.reset();
    };

    it('should take the tool "Bild" out of the toolbar the applet shows', () => {
      showToolbar('0 | 26 | 1');

      buildApplet();

      expect(mockGeoGebraAPI.setCustomToolBar).toHaveBeenCalledWith('0 | 1');
    });

    it('should leave a toolbar without the tool as it is', () => {
      showToolbar('0 | 126');

      buildApplet();

      expect(mockGeoGebraAPI.setCustomToolBar).not.toHaveBeenCalled();
    });

    it('should leave a hidden toolbar alone', () => {
      showToolbar('0 | 26');
      component.elementModel.showToolbar = false;

      buildApplet();

      expect(mockGeoGebraAPI.setCustomToolBar).not.toHaveBeenCalled();
    });

    it('should change the toolbar before GeoGebra can report anything', () => {
      showToolbar('0 | 26');

      buildApplet();

      expect(vi.mocked(mockGeoGebraAPI.setCustomToolBar).mock.invocationCallOrder[0])
        .toBeLessThan(vi.mocked(mockGeoGebraAPI.registerAddListener).mock.invocationCallOrder[0]);
    });

    describe('dropped or pasted', () => {
      /** Stands in for GeoGebra's drawing: what reaches it, GeoGebra would take. */
      let drawing: HTMLElement;
      let reachedGeoGebra: string[];

      beforeEach(() => {
        drawing = document.createElement('canvas');
        fixture.nativeElement.appendChild(drawing);
        reachedGeoGebra = [];
        ['dragenter', 'dragover', 'drop', 'paste'].forEach(type => drawing
          .addEventListener(type, () => reachedGeoGebra.push(type)));
      });

      const transferOf = (content: File | string): DataTransfer => {
        const transfer = new DataTransfer();
        if (typeof content === 'string') transfer.setData('text/plain', content);
        else transfer.items.add(content);
        return transfer;
      };
      const picture = (): File => new File(['png'], 'picture.png', { type: 'image/png' });

      it('should keep a picture from the drawing', () => {
        const init = { bubbles: true, cancelable: true };
        const dragenter = new DragEvent('dragenter', { ...init, dataTransfer: transferOf(picture()) });
        const dragover = new DragEvent('dragover', { ...init, dataTransfer: transferOf(picture()) });
        const drop = new DragEvent('drop', { ...init, dataTransfer: transferOf(picture()) });
        const paste = new ClipboardEvent('paste', { ...init, clipboardData: transferOf(picture()) });

        [dragenter, dragover, drop, paste].forEach(event => drawing.dispatchEvent(event));

        expect(reachedGeoGebra).toEqual([]);
        expect(dragenter.defaultPrevented).toBe(true);
        // Otherwise the browser opens the dropped file in place of the unit.
        expect(drop.defaultPrevented).toBe(true);
      });

      it('should let text pasted into an input through', () => {
        drawing.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, clipboardData: transferOf('Q=(2,3)') }));

        expect(reachedGeoGebra).toEqual(['paste']);
      });

      /* An office program puts a picture of what was copied beside the text. Into a text field GeoGebra
         pastes only the text. */
      it('should let a paste into a text field through, also with a picture beside the text', () => {
        const inputBar = document.createElement('textarea');
        fixture.nativeElement.appendChild(inputBar);
        const pasted: string[] = [];
        inputBar.addEventListener('paste', () => pasted.push('paste'));
        const clipboard = transferOf('Q=(2,3)');
        clipboard.items.add(picture());

        inputBar.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, clipboardData: clipboard }));

        expect(pasted).toEqual(['paste']);
      });
    });
  });

  describe('the answer (#1650)', () => {
    const archiveOf = (files: Record<string, string>): string => btoa(String.fromCharCode(...zipSync(
      Object.fromEntries(Object.entries(files).map(([name, content]) => [name, strToU8(content)]))
    )));
    const builtFrom = (): string => vi.mocked(ggbApplet).mock.lastCall?.[0].ggbBase64;
    const restored = '<geogebra><construction><element type="point" label="A"/></construction></geogebra>';

    it('should report the construction alone', fakeAsync(() => {
      vi.spyOn(component.elementValueChanged, 'emit');
      component.refresh();
      fixture.nativeElement.dispatchEvent(new PointerEvent('pointerdown'));

      geometryUpdated().next();
      tick(200);

      const { response } = vi.mocked(component.elementValueChanged.emit).mock.lastCall?.[0]?.value as GeometryValue;
      expect(constructionOf(response)).toBe(constructionOfApplet('mock'));
    }));

    it('should build the applet from the unit\'s file with the answer\'s construction put in', () => {
      component.elementModel.appDefinition = archiveOf({ 'geogebra.xml': '<geogebra/>', 'unit.png': 'picture' });
      component.response = archiveOf({ 'geogebra.xml': restored });

      component.refresh();

      expect(Object.keys(unzipSync(Uint8Array.from(atob(builtFrom()), c => c.charCodeAt(0)))).sort())
        .toEqual(['geogebra.xml', 'unit.png']);
      expect(constructionOf(builtFrom())).toBe(restored);
    });

    it('should show the unit\'s file after a reset, without the answer', () => {
      component.response = archiveOf({ 'geogebra.xml': restored });
      component.refresh();
      startUp();

      component.reset();

      expect(builtFrom()).toBe('initial-def');
    });

    it('should show the unit\'s file for an answer that cannot be read', () => {
      component.response = 'no answer';

      component.refresh();

      expect(builtFrom()).toBe('initial-def');
    });
  });

  describe('replacing the applet (#1625)', () => {
    const container = (): HTMLElement => fixture.nativeElement.querySelector('.geogebra-applet');
    const toggleToolbar = (): void => {
      component.elementModel.showToolbar = !component.elementModel.showToolbar;
    };

    beforeEach(() => {
      component.refresh();
      startUp();
      ggbApplet.mockClear();
    });

    it('should resize the running applet when only the size has changed', () => {
      // What deployggb.js puts around the applet, sized as the applet when it was built.
      const scaler = document.createElement('div');
      scaler.classList.add('applet_scaler');
      container().append(scaler);
      component.elementModel.dimensions.height = 300;
      const dispatch = vi.spyOn(window, 'dispatchEvent');

      component.refresh();

      expect(ggbApplet).not.toHaveBeenCalled();
      expect(mockGeoGebraAPI.setSize).toHaveBeenCalledWith(196, 296);
      expect([container().style.height, scaler.style.height]).toEqual(['296px', '296px']);
      // For GeoGebra to scale the applet to the window anew, as it does on building it.
      const resize = dispatch.mock.calls.findIndex(([event]) => event.type === 'resize');
      expect(resize).toBeGreaterThan(-1);
      expect(dispatch.mock.invocationCallOrder[resize])
        .toBeGreaterThan(vi.mocked(mockGeoGebraAPI.setSize).mock.invocationCallOrder[0]);
      dispatch.mockRestore();
    });

    it('should build a new applet when anything else has changed', () => {
      toggleToolbar();

      component.refresh();

      expect(ggbApplet).toHaveBeenCalledTimes(1);
      expect(mockGeoGebraAPI.setSize).not.toHaveBeenCalled();
    });

    it('should leave the applet alone when nothing it was built with has changed', () => {
      component.elementModel.alias = 'renamed';

      component.refresh();

      expect(ggbApplet).not.toHaveBeenCalled();
      expect(mockGeoGebraAPI.setSize).not.toHaveBeenCalled();
    });

    it('should give an applet the size set while it was loading', () => {
      const loads: GeoGebraAppletParameters[] = [];
      heldBackLoads = loads;
      toggleToolbar();
      component.refresh();
      component.elementModel.dimensions.width = 300;
      component.refresh();
      const loaded = createGeoGebraApi('loaded');

      loads[0].appletOnLoad(loaded);

      expect(ggbApplet).toHaveBeenCalledTimes(1);
      expect(loaded.setSize).toHaveBeenCalledWith(296, 196);
    });

    it('should take nothing from an applet that loads after it was replaced', () => {
      const loads: GeoGebraAppletParameters[] = [];
      heldBackLoads = loads;
      const appletLoaded = vi.spyOn(component.appletLoaded, 'emit');
      toggleToolbar();
      component.refresh();
      toggleToolbar();
      component.refresh();
      const replaced = createGeoGebraApi('replaced');
      const current = createGeoGebraApi('current');

      loads[1].appletOnLoad(current);
      loads[0].appletOnLoad(replaced);

      expect(component.geoGebraAPI).toBe(current);
      expect(replaced.registerUpdateListener).not.toHaveBeenCalled();
      expect(appletLoaded).toHaveBeenCalledTimes(1);
    });

    it('should ask the new applet, not the one it replaces, for a report due while it loads', fakeAsync(() => {
      fixture.nativeElement.dispatchEvent(new PointerEvent('pointerdown'));
      vi.spyOn(component.elementValueChanged, 'emit');
      const loads: GeoGebraAppletParameters[] = [];
      heldBackLoads = loads;
      component.reset();

      geometryUpdated().next();
      tick(200);

      expect(mockGeoGebraAPI.getXML).not.toHaveBeenCalled();
      expect(component.elementValueChanged.emit).not.toHaveBeenCalled();

      loads[0].appletOnLoad(createGeoGebraApi('after reset'));
      tick(200);

      const { response } = vi.mocked(component.elementValueChanged.emit).mock.lastCall?.[0]?.value as GeometryValue;
      expect(constructionOf(response)).toBe(constructionOfApplet('after reset'));
    }));
  });

  describe('replacing an applet that has just loaded (#1627)', () => {
    /* Loads an applet as GeoGebra does: the construction's ggbOnInit queues work before the load is
       reported. Returns what that work finds when it runs: how many applets were built meanwhile. */
    const loadWithScript = (): { appletsBuiltMeanwhile?: number } => {
      const loads: GeoGebraAppletParameters[] = [];
      heldBackLoads = loads;
      component.refresh();
      ggbApplet.mockClear();
      const script: { appletsBuiltMeanwhile?: number } = {};
      setTimeout(() => { script.appletsBuiltMeanwhile = ggbApplet.mock.calls.length; });
      loads[0].appletOnLoad(createGeoGebraApi('loaded'));
      return script;
    };

    it('should build a new applet only after that work has run', fakeAsync(() => {
      const script = loadWithScript();
      component.elementModel.showToolbar = !component.elementModel.showToolbar;

      component.refresh();

      expect(ggbApplet).not.toHaveBeenCalled();
      tick();
      expect(script.appletsBuiltMeanwhile).toBe(0);
      expect(ggbApplet).toHaveBeenCalledTimes(1);
    }));

    it('should reset only after that work has run', fakeAsync(() => {
      const script = loadWithScript();

      component.reset();

      expect(ggbApplet).not.toHaveBeenCalled();
      tick();
      expect(script.appletsBuiltMeanwhile).toBe(0);
      expect(ggbApplet).toHaveBeenCalledTimes(1);
    }));

    it('should build one applet for everything asked for meanwhile, as the element is then', fakeAsync(() => {
      loadWithScript();
      component.elementModel.showToolbar = !component.elementModel.showToolbar;
      component.refresh();
      component.elementModel.showZoomButtons = !component.elementModel.showZoomButtons;
      component.refresh();

      tick();

      expect(ggbApplet).toHaveBeenCalledTimes(1);
      expect(ggbApplet).toHaveBeenCalledWith(expect.objectContaining({
        showToolBar: component.elementModel.showToolbar,
        showZoomButtons: component.elementModel.showZoomButtons
      }), '5.0');
    }));

    it('should build nothing once the element is gone', fakeAsync(() => {
      loadWithScript();
      component.reset();

      fixture.destroy();
      tick();

      expect(ggbApplet).not.toHaveBeenCalled();
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

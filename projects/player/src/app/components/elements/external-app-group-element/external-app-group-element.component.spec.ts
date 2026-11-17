import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { By } from '@angular/platform-browser';
import { GeometryVariable } from 'common/models/geometry-interfaces';
import { ResponseStatusType } from '@iqbspecs/response/response.interface';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import {
  ExternalAppGroupElementComponent
} from 'player/src/app/components/elements/external-app-group-element/external-app-group-element.component';
import { GeometryElement } from 'common/models/elements/geometry';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { GeometryVariableStateService } from 'player/src/app/services/geometry-variable-state.service';
// 'fflate/browser', not 'fflate': the bare specifier resolves to the Node ESM build under
// Vitest browser mode and crashes at import time on createRequire.
import {
  strFromU8, strToU8, unzipSync, zipSync
} from 'fflate/browser';

describe('ExternalAppGroupElementComponent', () => {
  let component: ExternalAppGroupElementComponent;
  let fixture: ComponentFixture<ExternalAppGroupElementComponent>;

  @Component({
    selector: 'aspect-geometry',
    template: '',
    standalone: false
  })
  class GeometryStubComponent {
    @Input() elementModel!: GeometryElement;
    @Input() response: string | undefined;
    @Output() appletLoaded = new EventEmitter<GeometryVariable[]>();
    domElement = document.createElement('div');
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ExternalAppGroupElementComponent,
        GeometryStubComponent,
        CastPipe
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalAppGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = new GeometryElement({
      type: 'geometry',
      id: 'id',
      alias: 'alias',
      appDefinition: '',
      trackedVariables: [],
      trackedExpectedVariables: []
    });
    fixture.detectChanges();
  });

  it('should initialize geometry variables with parent status NOT_REACHED', () => {
    const unitStateService = TestBed.inject(UnitStateService);
    const geometryVariableStateService = TestBed.inject(GeometryVariableStateService);

    unitStateService.reset();
    geometryVariableStateService.reset();

    const testFixture = TestBed.createComponent(ExternalAppGroupElementComponent);
    const testComponent = testFixture.componentInstance;
    testComponent.elementModel = new GeometryElement({
      type: 'geometry',
      id: 'geogebra_test',
      alias: 'alias_test',
      appDefinition: '',
      trackedVariables: [{ id: 'var_a', value: '1' }],
      trackedExpectedVariables: []
    });

    testFixture.detectChanges();

    const parentCode = unitStateService.getElementCodeById('geogebra_test');
    expect(parentCode).toBeTruthy();
    expect(parentCode?.status).toBe('NOT_REACHED');

    const varId = (testComponent.elementModel as GeometryElement).getGeometryVariableId('var_a');
    const varCode = geometryVariableStateService.getElementCodeById(varId);
    expect(varCode).toBeTruthy();
    expect(varCode?.status).toBe('NOT_REACHED');
  });

  it('should change geometry variables status to DISPLAYED when parent changes to DISPLAYED', () => {
    const unitStateService = TestBed.inject(UnitStateService);
    const geometryVariableStateService = TestBed.inject(GeometryVariableStateService);

    unitStateService.reset();
    geometryVariableStateService.reset();

    const testFixture = TestBed.createComponent(ExternalAppGroupElementComponent);
    const testComponent = testFixture.componentInstance;
    testComponent.elementModel = new GeometryElement({
      type: 'geometry',
      id: 'geogebra_test2',
      alias: 'alias_test2',
      appDefinition: '',
      trackedVariables: [{ id: 'var_b', value: '2' }],
      trackedExpectedVariables: []
    });

    testFixture.detectChanges();

    const varId = (testComponent.elementModel as GeometryElement).getGeometryVariableId('var_b');
    let varCode = geometryVariableStateService.getElementCodeById(varId);
    expect(varCode?.status).toBe('NOT_REACHED');

    unitStateService.changeElementCodeStatus({ id: 'geogebra_test2', status: 'DISPLAYED' });

    varCode = geometryVariableStateService.getElementCodeById(varId);
    expect(varCode?.status).toBe('DISPLAYED');
  });

  it('should initialize runtime geometry variables with the current parent status', () => {
    const unitStateService = TestBed.inject(UnitStateService);
    const geometryVariableStateService = TestBed.inject(GeometryVariableStateService);

    unitStateService.reset();
    geometryVariableStateService.reset();

    const testFixture = TestBed.createComponent(ExternalAppGroupElementComponent);
    const testComponent = testFixture.componentInstance;
    testComponent.elementModel = new GeometryElement({
      type: 'geometry',
      id: 'geogebra_test3',
      alias: 'alias_test3',
      appDefinition: '',
      trackedVariables: [{ id: 'var_c', value: '3' }],
      trackedExpectedVariables: []
    });

    testFixture.detectChanges();

    unitStateService.changeElementCodeValue({ id: 'geogebra_test3', value: 'new_def' });

    testComponent.changeElementCodeValue({
      id: 'geogebra_test3',
      value: {
        response: 'new_def',
        variables: [
          { id: 'var_c', value: '3' },
          { id: 'var_new', value: '4' }
        ],
        edited: false
      }
    });

    const newVarId = (testComponent.elementModel as GeometryElement).getGeometryVariableId('var_new');
    const newVarCode = geometryVariableStateService.getElementCodeById(newVarId);
    expect(newVarCode).toBeTruthy();
    expect(newVarCode?.status).toBe('VALUE_CHANGED');
  });

  describe('reports of the applet', () => {
    let unitStateService: UnitStateService;
    let geometryVariableStateService: GeometryVariableStateService;
    let applet: ExternalAppGroupElementComponent;
    let appletFixture: ComponentFixture<ExternalAppGroupElementComponent>;

    /** A displayed applet with two truth values, `correct` and `other`, both `false` -- or stored with
     * the value given, as variables chosen with an editor before 2.11.0 are stored with an empty one. */
    const createApplet = (recomputedCountsAsChanged: boolean, storedValue?: string): void => {
      unitStateService = TestBed.inject(UnitStateService);
      geometryVariableStateService = TestBed.inject(GeometryVariableStateService);
      unitStateService.reset();
      geometryVariableStateService.reset();
      appletFixture = TestBed.createComponent(ExternalAppGroupElementComponent);
      applet = appletFixture.componentInstance;
      applet.elementModel = new GeometryElement({
        type: 'geometry',
        id: 'applet',
        alias: 'applet',
        appDefinition: 'start',
        trackedVariables: [
          { id: 'correct', value: storedValue ?? 'correct = false' },
          { id: 'other', value: storedValue ?? 'other = false' }
        ],
        trackedExpectedVariables: [],
        recomputedCountsAsChanged
      });
      appletFixture.detectChanges();
      unitStateService.changeElementCodeStatus({ id: 'applet', status: 'DISPLAYED' });
    };

    const report = (edited: boolean, response: string, correct = 'correct = false'): void => {
      const variables = [{ id: 'correct', value: correct }, { id: 'other', value: 'other = false' }];
      applet.changeElementCodeValue({ id: 'applet', value: { response, variables, edited } });
    };
    const element = () => unitStateService.getElementCodeById('applet');
    const variable = (id: string) => geometryVariableStateService.getElementCodeById(`applet_${id}`);

    it('should compare with the values GeoGebra starts with, not with the empty ones a unit stores', () => {
      createApplet(false, '');
      const geometry = appletFixture.debugElement.query(By.directive(GeometryStubComponent))
        .componentInstance as GeometryStubComponent;
      const startValues = [{ id: 'correct', value: 'correct = false' }, { id: 'other', value: 'other = false' }];
      geometry.appletLoaded.emit(startValues);

      report(true, 'edited', 'correct = true');

      expect(variable('correct')?.status).toBe('VALUE_CHANGED');
      expect(variable('other')).toEqual(expect.objectContaining({ status: 'DISPLAYED', value: 'other = false' }));
    });

    it('should take over nothing before the first edit, as after a click or a zoom', () => {
      createApplet(true);
      const startValue = element()?.value;

      report(false, 'zoomed', 'correct = true');

      expect(element()).toEqual(expect.objectContaining({ status: 'DISPLAYED', value: startValue }));
      expect(variable('correct')).toEqual(expect.objectContaining({ status: 'DISPLAYED', value: 'correct = false' }));
    });

    it('should mark the element as worked on with the first edit', () => {
      createApplet(false);

      report(true, 'edited');

      expect(element()).toEqual(expect.objectContaining({ status: 'VALUE_CHANGED', value: 'edited' }));
    });

    it('should take over every report once the element is worked on, as one after an undo', () => {
      createApplet(false);
      report(true, 'edited');

      report(false, 'undone');

      expect(element()).toEqual(expect.objectContaining({ status: 'VALUE_CHANGED', value: 'undone' }));
    });

    it('should leave each variable to its own value without the switch', () => {
      createApplet(false);

      report(true, 'edited', 'correct = true');

      expect(variable('correct')?.status).toBe('VALUE_CHANGED');
      expect(variable('other')?.status).toBe('DISPLAYED');
    });

    it('should hand VALUE_CHANGED down to every variable with the switch, also one whose value stayed', () => {
      createApplet(true);

      report(true, 'edited');

      const changed = (value: string) => expect.objectContaining({ status: 'VALUE_CHANGED', value });
      expect(variable('correct')).toEqual(changed('correct = false'));
      expect(variable('other')).toEqual(changed('other = false'));
    });

    it('should announce a variable handed VALUE_CHANGED with its new value only', () => {
      createApplet(true);
      const announced: string[] = [];
      geometryVariableStateService.elementCodeChanged
        .subscribe(code => { if (code.id === 'applet_correct') announced.push(`${code.status} ${code.value}`); });

      report(true, 'edited', 'correct = true');

      expect(announced).toEqual(['VALUE_CHANGED correct = true']);
    });
  });

  describe('the answer (#1650)', () => {
    const construction = '<geogebra><construction/></geogebra>';
    const unitFile = btoa(String.fromCharCode(...zipSync({
      'geogebra.xml': strToU8(construction),
      'geogebra_javascript.js': strToU8('function ggbOnInit() {}'),
      'xx/picture.png': strToU8('picture')
    })));

    let unitStateService: UnitStateService;

    /** An applet of the unit, with the answer the host restored, if any. */
    const createApplet = (stored?: { status: ResponseStatusType; value: string }): GeometryStubComponent => {
      unitStateService = TestBed.inject(UnitStateService);
      unitStateService.reset();
      TestBed.inject(GeometryVariableStateService).reset();
      if (stored) unitStateService.setElementCodes([{ id: 'alias', ...stored }], [{ id: 'applet', alias: 'alias' }]);
      const appletFixture = TestBed.createComponent(ExternalAppGroupElementComponent);
      appletFixture.componentInstance.elementModel = new GeometryElement({
        type: 'geometry',
        id: 'applet',
        alias: 'alias',
        appDefinition: unitFile,
        trackedVariables: [],
        trackedExpectedVariables: []
      });
      appletFixture.detectChanges();
      return appletFixture.debugElement.query(By.directive(GeometryStubComponent))
        .componentInstance as GeometryStubComponent;
    };

    it('should start out with the construction of the unit\'s file, not with the whole file', () => {
      createApplet();

      const answer = unitStateService.getElementCodeById('applet')?.value as string;
      const files = unzipSync(Uint8Array.from(atob(answer), character => character.charCodeAt(0)));
      expect(Object.keys(files)).toEqual(['geogebra.xml']);
      expect(strFromU8(files['geogebra.xml'])).toBe(construction);
    });

    it('should keep the answer the host restored and hand it to the applet', () => {
      const geometry = createApplet({ status: 'VALUE_CHANGED', value: 'stored' });

      expect(unitStateService.getElementCodeById('applet')?.value).toBe('stored');
      expect(geometry.response).toBe('stored');
    });

    /* An element nobody has worked on holds the unit's own construction, which shows the same. The replay
       of coding-box hands the statuses over as the numbers it stores them as, `VALUE_CHANGED` as 3. */
    it('should hand the applet the answer the host gave back, whatever its status', () => {
      ['NOT_REACHED', 'DISPLAYED', 'VALUE_CHANGED', 3, 2].forEach(status => {
        const geometry = createApplet({ status: status as ResponseStatusType, value: 'stored' });

        expect(geometry.response).toBe('stored');
      });
    });

    it('should hand the applet no answer to restore when the host gave none back', () => {
      expect(createApplet().response).toBeUndefined();
      expect(createApplet({ status: 'VALUE_CHANGED', value: null as unknown as string }).response).toBeUndefined();
    });
  });
});

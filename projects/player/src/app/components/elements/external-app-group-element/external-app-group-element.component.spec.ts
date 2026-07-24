import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import {
  ExternalAppGroupElementComponent
} from 'player/src/app/components/elements/external-app-group-element/external-app-group-element.component';
import { GeometryElement } from 'common/models/elements/external-app-group-elements/geometry';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { GeometryVariableStateService } from 'player/src/app/services/geometry-variable-state.service';

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
    @Input() appDefinition!: string;
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

  it('should create', () => {
    expect(component).toBeTruthy();
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
        appDefinition: 'new_def',
        variables: [
          { id: 'var_c', value: '3' },
          { id: 'var_new', value: '4' }
        ]
      }
    });

    const newVarId = (testComponent.elementModel as GeometryElement).getGeometryVariableId('var_new');
    const newVarCode = geometryVariableStateService.getElementCodeById(newVarId);
    expect(newVarCode).toBeTruthy();
    expect(newVarCode?.status).toBe('VALUE_CHANGED');
  });
});

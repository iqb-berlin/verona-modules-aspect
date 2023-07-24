import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import {
  ExternalAppGroupElementComponent
} from 'player/src/app/components/elements/external-app-group-element/external-app-group-element.component';
import { GeometryElement } from 'common/models/elements/geometry/geometry';

describe('ExternalAppGroupElementComponent', () => {
  let component: ExternalAppGroupElementComponent;
  let fixture: ComponentFixture<ExternalAppGroupElementComponent>;
  let mockUnitStateService: UnitStateService;

  @Component({ selector: 'aspect-geometry', template: '' })
  class GeometryStubComponent {
    @Input() elementModel!: GeometryElement;
    @Input() appDefinition!: string;
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
    mockUnitStateService = TestBed.inject(UnitStateService);
    fixture = TestBed.createComponent(ExternalAppGroupElementComponent);
    spyOn(mockUnitStateService, 'registerElement');
    spyOn(mockUnitStateService, 'getElementCodeById').withArgs('test').and
      .returnValue({ id: 'test', status: 'NOT_REACHED', value: 0 });
    component = fixture.componentInstance;
    component.elementModel = new GeometryElement();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

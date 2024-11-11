import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import {
  ExternalAppGroupElementComponent
} from 'player/src/app/components/elements/external-app-group-element/external-app-group-element.component';
import { GeometryElement } from 'common/models/elements/geometry/geometry';

describe('ExternalAppGroupElementComponent', () => {
  let component: ExternalAppGroupElementComponent;
  let fixture: ComponentFixture<ExternalAppGroupElementComponent>;

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
    fixture = TestBed.createComponent(ExternalAppGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = new GeometryElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

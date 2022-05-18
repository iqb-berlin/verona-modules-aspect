import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementInteractiveGroupComponent } from './element-interactive-group.component';
import { Component, Input } from '@angular/core';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { ButtonElement } from 'common/models/elements/button/button';

describe('ElementInteractiveGroupComponent', () => {
  let component: ElementInteractiveGroupComponent;
  let fixture: ComponentFixture<ElementInteractiveGroupComponent>;
  let mockUnitStateService: UnitStateService;

  @Component({ selector: 'aspect-button', template: '' })
  class ButtonStubComponent {
    @Input() elementModel!: ButtonElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ElementInteractiveGroupComponent,
        ButtonStubComponent,
        CastPipe
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    mockUnitStateService = TestBed.inject(UnitStateService);
    fixture = TestBed.createComponent(ElementInteractiveGroupComponent);
    spyOn(mockUnitStateService, 'registerElement')
      .withArgs('test', 0, document.createElement('div'), 1);
    spyOn(mockUnitStateService, 'getElementCodeById').withArgs('test').and
      .returnValue({ id: 'test', status: 'NOT_REACHED', value: 0 });
    component = fixture.componentInstance;
    component.elementModel = new ButtonElement({
      type: 'button',
      id: 'test',
      width: 0,
      height: 0
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});

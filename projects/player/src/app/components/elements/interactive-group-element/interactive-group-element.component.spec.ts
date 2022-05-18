import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InteractiveGroupElementComponent } from './interactive-group-element.component';
import { Component, Input } from '@angular/core';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { ButtonElement } from 'common/models/elements/button/button';

describe('InteractiveGroupElementComponent', () => {
  let component: InteractiveGroupElementComponent;
  let fixture: ComponentFixture<InteractiveGroupElementComponent>;
  let mockUnitStateService: UnitStateService;

  @Component({ selector: 'aspect-button', template: '' })
  class ButtonStubComponent {
    @Input() elementModel!: ButtonElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        InteractiveGroupElementComponent,
        ButtonStubComponent,
        CastPipe
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    mockUnitStateService = TestBed.inject(UnitStateService);
    fixture = TestBed.createComponent(InteractiveGroupElementComponent);
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

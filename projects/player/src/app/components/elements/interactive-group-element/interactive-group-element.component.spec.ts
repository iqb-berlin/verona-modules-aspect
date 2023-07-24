import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import { ButtonElement } from 'common/models/elements/button/button';
import { InteractiveGroupElementComponent } from './interactive-group-element.component';

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
    spyOn(mockUnitStateService, 'registerElement');
    spyOn(mockUnitStateService, 'getElementCodeById').withArgs('test').and
      .returnValue({ id: 'test', status: 'NOT_REACHED', value: 0 });
    component = fixture.componentInstance;
    component.elementModel = new ButtonElement();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

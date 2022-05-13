import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementTextGroupComponent } from './element-text-group.component';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UIElement, ValueChangeElement } from 'common/interfaces/elements';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import {
  FloatingMarkingBarComponent
} from 'player/src/app/components/floating-marking-bar/floating-marking-bar.component';

describe('ElementTextGroupComponent', () => {
  let component: ElementTextGroupComponent;
  let fixture: ComponentFixture<ElementTextGroupComponent>;
  let mockUnitStateService: UnitStateService;

  @Component({ selector: 'aspect-text', template: '' })
  class TextStubComponent {
    @Input() elementModel!: UIElement;
    @Input() savedText!: string;
    @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
    @Output() startSelection = new EventEmitter<PointerEvent>();
    @Output() applySelection = new EventEmitter<{
      active: boolean,
      mode: 'mark' | 'delete',
      color: string,
      colorName: string | undefined
    }>();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ElementTextGroupComponent,
        TextStubComponent,
        FloatingMarkingBarComponent,
        CastPipe
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    mockUnitStateService = TestBed.inject(UnitStateService);
    fixture = TestBed.createComponent(ElementTextGroupComponent);
    spyOn(mockUnitStateService, 'registerElement')
      .withArgs('test', 0, document.createElement('div'), 1);
    spyOn(mockUnitStateService, 'getElementCodeById').withArgs('test').and
      .returnValue({ id: 'test', status: 'NOT_REACHED', value: [] });
    component = fixture.componentInstance;
    component.elementModel = {
      type: 'audio',
      id: 'test',
      width: 0,
      height: 0
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextGroupElementComponent } from './text-group-element.component';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { UnitStateService } from 'player/src/app/services/unit-state.service';
import {
  FloatingMarkingBarComponent
} from 'player/src/app/components/floating-marking-bar/floating-marking-bar.component';
import { TextElement } from 'common/models/elements/text/text';

import { ValueChangeElement } from 'common/models/elements/classes';

describe('TextGroupElementComponent', () => {
  let component: TextGroupElementComponent;
  let fixture: ComponentFixture<TextGroupElementComponent>;
  let mockUnitStateService: UnitStateService;

  @Component({ selector: 'aspect-text', template: '' })
  class TextStubComponent {
    @Input() elementModel!: TextElement;
    @Input() savedText!: string;
    @Output() elementValueChanged = new EventEmitter<ValueChangeElement>();
    @Output() textSelectionStart = new EventEmitter<PointerEvent>();
    @Output() markingDataChanged = new EventEmitter<{
      active: boolean,
      mode: 'mark' | 'delete',
      color: string,
      colorName: string | undefined
    }>();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TextGroupElementComponent,
        TextStubComponent,
        FloatingMarkingBarComponent,
        CastPipe
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    mockUnitStateService = TestBed.inject(UnitStateService);
    fixture = TestBed.createComponent(TextGroupElementComponent);
    spyOn(mockUnitStateService, 'registerElement');
    spyOn(mockUnitStateService, 'getElementCodeById').withArgs('test').and
      .returnValue({ id: 'test', status: 'NOT_REACHED', value: [] });
    component = fixture.componentInstance;
    component.elementModel = new TextElement({
      type: 'text',
      id: 'test',
      width: 0,
      height: 0
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});

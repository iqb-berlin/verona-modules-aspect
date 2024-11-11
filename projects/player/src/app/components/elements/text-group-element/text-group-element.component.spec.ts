import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import {
  FloatingMarkingBarComponent
} from 'player/src/app/components/floating-marking-bar/floating-marking-bar.component';
import { TextElement } from 'common/models/elements/text/text';
import { ValueChangeElement } from 'common/interfaces';
import { TextGroupElementComponent } from './text-group-element.component';

describe('TextGroupElementComponent', () => {
  let component: TextGroupElementComponent;
  let fixture: ComponentFixture<TextGroupElementComponent>;

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
    fixture = TestBed.createComponent(TextGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = new TextElement({ id: 'id', alias: 'alias' });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

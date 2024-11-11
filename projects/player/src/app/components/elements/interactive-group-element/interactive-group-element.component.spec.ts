// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, Input, Pipe, PipeTransform
} from '@angular/core';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { ButtonElement } from 'common/models/elements/button/button';
import { InteractiveGroupElementComponent } from './interactive-group-element.component';

describe('InteractiveGroupElementComponent', () => {
  let component: InteractiveGroupElementComponent;
  let fixture: ComponentFixture<InteractiveGroupElementComponent>;

  @Component({ selector: 'aspect-button', template: '' })
  class ButtonStubComponent {
    @Input() elementModel!: ButtonElement;
  }

  @Component({ selector: 'aspect-floating-keypad', template: '' })
  class MockFloatingKeyPadComponent {
    @Input() isKeypadOpen!: boolean;
  }

  @Pipe({
    name: 'isEnabledNavigationTarget'
  })
  class MockIsEnabledNavigationTarget implements PipeTransform {
    transform(): boolean {
      return true;
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        InteractiveGroupElementComponent,
        MockFloatingKeyPadComponent,
        ButtonStubComponent,
        MockIsEnabledNavigationTarget,
        CastPipe
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractiveGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = new ButtonElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

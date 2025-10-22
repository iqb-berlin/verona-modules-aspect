// eslint-disable-next-line max-classes-per-file
import {
  Component, Input, Pipe, PipeTransform
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { ButtonElement } from 'common/models/elements/button/button';
import { ActionGroupElementComponent } from './action-group-element.component';

describe('ActionGroupElementComponent', () => {
  let component: ActionGroupElementComponent;
  let fixture: ComponentFixture<ActionGroupElementComponent>;

  @Pipe({
    name: 'isEnabledNavigationTarget',
    standalone: false
  })
  class MockIsEnabledNavigationTarget implements PipeTransform {
    transform(): boolean {
      return true;
    }
  }

  @Component({
    selector: 'aspect-button',
    template: '',
    standalone: false
  })
  class ButtonStubComponent {
    @Input() elementModel!: ButtonElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ActionGroupElementComponent,
        ButtonStubComponent,
        MockIsEnabledNavigationTarget,
        CastPipe
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = new ButtonElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

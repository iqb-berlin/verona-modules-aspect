import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
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
    fixture = TestBed.createComponent(InteractiveGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = new ButtonElement();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

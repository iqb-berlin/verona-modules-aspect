// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { ImageElement } from 'common/models/elements/media-elements/image';
import { InteractiveGroupElementComponent } from './interactive-group-element.component';

describe('InteractiveGroupElementComponent', () => {
  let component: InteractiveGroupElementComponent;
  let fixture: ComponentFixture<InteractiveGroupElementComponent>;

  @Component({
    selector: 'aspect-image',
    template: '',
    standalone: false
  })
  class ImageStubComponent {
    @Input() elementModel!: ImageElement;
  }

  @Component({
    selector: 'aspect-floating-keypad',
    template: '',
    standalone: false
  })
  class MockFloatingKeyPadComponent {
    @Input() isKeypadOpen!: boolean;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        InteractiveGroupElementComponent,
        ImageStubComponent,
        MockFloatingKeyPadComponent,
        CastPipe
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractiveGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = new ImageElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

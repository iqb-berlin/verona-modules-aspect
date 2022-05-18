import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BaseGroupElementComponent
} from 'player/src/app/components/elements/base-group-element/base-group-element.component';
import { FrameElement } from 'common/models/elements/frame/frame';

describe('BaseGroupElementComponent', () => {
  let component: BaseGroupElementComponent;
  let fixture: ComponentFixture<BaseGroupElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        BaseGroupElementComponent
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = new FrameElement({
      type: 'frame',
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

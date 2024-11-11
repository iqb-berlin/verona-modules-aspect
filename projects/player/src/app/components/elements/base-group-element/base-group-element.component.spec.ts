import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BaseGroupElementComponent
} from 'player/src/app/components/elements/base-group-element/base-group-element.component';
import { FrameElement } from 'common/models/elements/frame/frame';
import { APIService } from 'common/shared.module';

describe('BaseGroupElementComponent', () => {
  let component: BaseGroupElementComponent;
  let fixture: ComponentFixture<BaseGroupElementComponent>;

  class ApiStubService {
    // eslint-disable-next-line class-methods-use-this
    getResourceURL(): string {
      return 'assets';
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        BaseGroupElementComponent
      ],
      providers: [{ provide: APIService, useClass: ApiStubService }]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseGroupElementComponent);
    component = fixture.componentInstance;
    component.elementModel = new FrameElement({ id: 'id', alias: 'alias' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CastPipe } from 'player/src/app/pipes/cast.pipe';
import { ButtonElement } from 'common/models/elements/button/button';
import { ActionGroupElementComponent } from './action-group-element.component';

describe('ActionGroupElementComponent', () => {
  let component: ActionGroupElementComponent;
  let fixture: ComponentFixture<ActionGroupElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ActionGroupElementComponent,
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

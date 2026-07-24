import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MarkableWordComponent
} from 'player/src/app/components/markable-word/markable-word.component';
import {
  MarkableDelimiterComponent
} from 'player/src/app/components/markable-delimiter/markable-delimiter.component';
import { MarkablesContainerComponent } from './markables-container.component';

describe('MarkablesContainerComponent', () => {
  let component: MarkablesContainerComponent;
  let fixture: ComponentFixture<MarkablesContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarkablesContainerComponent, MarkableWordComponent, MarkableDelimiterComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarkablesContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

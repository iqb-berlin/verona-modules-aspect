import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarkablesContainerComponent } from './markables-container.component';

describe('MarkablesContainerComponent', () => {
  let component: MarkablesContainerComponent;
  let fixture: ComponentFixture<MarkablesContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkablesContainerComponent]
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

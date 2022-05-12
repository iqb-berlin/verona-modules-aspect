import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutPlayerComponent } from './layout-player.component';

describe('LayoutPlayerComponent', () => {
  let component: LayoutPlayerComponent;
  let fixture: ComponentFixture<LayoutPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LayoutPlayerComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});

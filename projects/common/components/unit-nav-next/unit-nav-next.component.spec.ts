import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnitNavNextComponent } from './unit-nav-next.component';

describe('UnitNavNextComponent', () => {
  let component: UnitNavNextComponent;
  let fixture: ComponentFixture<UnitNavNextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitNavNextComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitNavNextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit navigate when the navigation button is clicked', () => {
    const emitSpy = vi.spyOn(component.navigate, 'emit');
    const navButton: HTMLElement = fixture.nativeElement.querySelector('.svg-container');
    navButton.click();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should not emit navigate when clicking outside the navigation button', () => {
    const emitSpy = vi.spyOn(component.navigate, 'emit');
    const buttonText: HTMLElement = fixture.nativeElement.querySelector('.button-text');
    buttonText.click();
    expect(emitSpy).not.toHaveBeenCalled();
  });
});

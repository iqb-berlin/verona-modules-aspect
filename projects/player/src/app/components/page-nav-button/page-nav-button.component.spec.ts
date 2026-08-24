import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PageNavButtonComponent } from './page-nav-button.component';

describe('PageNavButtonComponent', () => {
  let component: PageNavButtonComponent;
  let fixture: ComponentFixture<PageNavButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PageNavButtonComponent]
    });
    fixture = TestBed.createComponent(PageNavButtonComponent);
    component = fixture.componentInstance;
    component.direction = 'next';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark itself with its direction', () => {
    expect(fixture.debugElement.query(By.css('.next'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.previous'))).toBeNull();
  });

  it('should show a downwards arrow for the next page', () => {
    expect(fixture.debugElement.query(By.css('polygon')).nativeElement.getAttribute('points'))
      .toBe('10,10 390,10 200,190');
  });

  it('should show an upwards arrow for the previous page', () => {
    component.direction = 'previous';

    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.previous'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('polygon')).nativeElement.getAttribute('points'))
      .toBe('10,190 390,190 200,10');
  });

  it('should announce its direction when clicked', () => {
    const clicks: string[] = [];
    component.clicked.subscribe(direction => clicks.push(direction));

    fixture.debugElement.query(By.css('.page-nav-button')).nativeElement.click();

    expect(clicks).toEqual(['next']);
  });
});

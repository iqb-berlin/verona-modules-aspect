import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BehaviorSubject } from 'rxjs';
import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpinnerComponent],
      imports: [MatProgressSpinnerModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    component.isLoaded = new BehaviorSubject<boolean>(false);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show the spinner while not loaded', () => {
    fixture.detectChanges();
    expect(component.isLoading).toBe(true);
    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeTruthy();
  });

  it('should hide the spinner when loading has finished', () => {
    fixture.detectChanges();
    component.isLoaded.next(true);
    fixture.detectChanges();
    expect(component.isLoading).toBe(false);
    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeNull();
  });

  // The timing tests call ngOnInit directly: timers scheduled through the
  // fixture's NgZone (created in beforeEach) are invisible to fakeAsync/tick.
  it('should emit timeOut when not loaded within the timeout duration', fakeAsync(() => {
    component.timeOutDuration = 500;
    const emitSpy = vi.spyOn(component.timeOut, 'emit');
    component.ngOnInit();
    tick(500);
    expect(emitSpy).toHaveBeenCalledWith(500);
  }));

  it('should not emit timeOut when loaded before the timeout duration', fakeAsync(() => {
    component.timeOutDuration = 500;
    const emitSpy = vi.spyOn(component.timeOut, 'emit');
    component.ngOnInit();
    tick(200);
    component.isLoaded.next(true);
    tick(500);
    expect(emitSpy).not.toHaveBeenCalled();
  }));

  it('should clear the pending timeout on destroy', fakeAsync(() => {
    component.timeOutDuration = 500;
    const emitSpy = vi.spyOn(component.timeOut, 'emit');
    component.ngOnInit();
    component.ngOnDestroy();
    tick(500);
    expect(emitSpy).not.toHaveBeenCalled();
  }));
});

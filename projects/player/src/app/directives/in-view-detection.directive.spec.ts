import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { InViewDetectionDirective } from './in-view-detection.directive';

/*
 * The directive is declared by the app module, so a spec local NgModule would break the
 * AOT build (NG6007). The host therefore uses the directive as a plain attribute and the
 * inputs are set on the directive instance before the first change detection run.
 */
@Component({
  template: '<div id="detection-area" aspectInViewDetection></div>',
  standalone: false
})
class TestComponent {}

describe('InViewDetectionDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let directive: InViewDetectionDirective;
  let intersectingCount: number;

  const initDirective = (detectionType: 'top' | 'bottom' = 'top'): void => {
    directive = fixture.debugElement.query(By.directive(InViewDetectionDirective))
      .injector.get(InViewDetectionDirective);
    directive.detectionType = detectionType;
    directive.intersecting.subscribe(() => { intersectingCount += 1; });
    fixture.detectChanges();
  };

  beforeEach(() => {
    intersectingCount = 0;
    fixture = TestBed.configureTestingModule({
      declarations: [TestComponent, InViewDetectionDirective]
    })
      .createComponent(TestComponent);
  });

  it('should create an instance', () => {
    initDirective();

    expect(directive).toBeTruthy();
  });

  it('should observe the host element within the document', () => {
    initDirective();

    expect(directive.intersectionDetector).toBeTruthy();
    expect(directive.intersectionDetector.root).toBe(document);
  });

  it('should emit when the detector reports an intersection', () => {
    initDirective();

    directive.intersectionDetector.intersecting.emit();
    directive.intersectionDetector.intersecting.emit();

    expect(intersectingCount).toBe(2);
  });

  it('should stop emitting after destruction', () => {
    initDirective();

    fixture.destroy();
    directive.intersectionDetector.intersecting.emit();

    expect(intersectingCount).toBe(0);
  });

  it('should destroy the detector on destruction', () => {
    initDirective();
    const destroy = vi.spyOn(directive.intersectionDetector, 'destroy');

    fixture.destroy();

    expect(destroy).toHaveBeenCalled();
  });
});

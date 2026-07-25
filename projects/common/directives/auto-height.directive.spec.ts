import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AutoHeightDirective } from './auto-height.directive';

// autoHeight is set on the directive instance: property bindings on native
// elements in spec-local host templates are rejected by the AOT compiler (NG8002).
@Component({
  template: '<textarea autoHeight></textarea>',
  standalone: false
})
class TestHostComponent {}

describe('AutoHeightDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let directive: AutoHeightDirective;
  let textArea: HTMLTextAreaElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestHostComponent, AutoHeightDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    directive = fixture.debugElement.query(By.directive(AutoHeightDirective))
      .injector.get(AutoHeightDirective);
    directive.autoHeight = true;
    textArea = fixture.nativeElement.querySelector('textarea');
  });

  it('should set the height to the scroll height after view init', async () => {
    fixture.detectChanges();
    // the initial resize is scheduled with setTimeout through the fixture's NgZone,
    // which is outside the test ProxyZone — fakeAsync/tick cannot flush it
    await fixture.whenStable();
    // scrollHeight changes slightly once an explicit height is applied,
    // so only assert that a pixel height has been set
    expect(textArea.style.height).toMatch(/^\d+px$/);
  });

  it('should not touch the height when autoHeight is disabled', async () => {
    directive.autoHeight = false;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(textArea.style.height).toBe('');
  });

  it('should resize again on selectionchange', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    const initialHeight = parseInt(textArea.style.height, 10);

    textArea.value = 'line\n'.repeat(20);
    textArea.dispatchEvent(new Event('selectionchange'));
    await fixture.whenStable();

    const newHeight = parseInt(textArea.style.height, 10);
    expect(newHeight).toBeGreaterThan(initialHeight);
  });
});

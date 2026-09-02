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

// the ResizeObserver delivers before paint, so two frames cover observation and callback
const afterTwoFrames = (): Promise<void> => new Promise<void>(resolve => {
  requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
});

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

  /* A page that is not the one shown first is built before its content is put into the document.
     The height measured there is 0, and writing it left the field with no height at all (#1335). */
  it('should keep the row height while the element is outside the document', async () => {
    const host = fixture.nativeElement as HTMLElement;
    const parent = host.parentElement as HTMLElement;
    parent.removeChild(host);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(textArea.style.height).not.toBe('0px');
  });

  it('should set the height once the element enters the document', async () => {
    const host = fixture.nativeElement as HTMLElement;
    const parent = host.parentElement as HTMLElement;
    parent.removeChild(host);
    fixture.detectChanges();
    await fixture.whenStable();

    parent.appendChild(host);
    await afterTwoFrames();

    expect(textArea.style.height).toMatch(/^[1-9]\d*px$/);
  });

  /* The observer that brings the measurement of a later page must not stay on the element it
     writes to: the resize grabber and a table cell both move that height from outside. */
  it('should leave the height alone once it has been measured', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    textArea.style.height = '500px';
    await afterTwoFrames();

    expect(textArea.style.height).toBe('500px');
  });
});

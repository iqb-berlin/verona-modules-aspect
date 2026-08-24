/* eslint-disable max-classes-per-file */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageLabelModule } from 'player/src/app/directives/page-label.module';
import { Component, Input, NgModule } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('PageLabelDirective', () => {
  @Component({
    template: `
    <div id="container"
         aspectPageLabel
         [isHidden]="headerIsHidden"
         (heightChanged)="headerHeight=$event">
      <div id="header"
           [style.height.px]="100">FIRST CHILD</div>
      <div>Content</div>
    </div>`,
    standalone: false
  })
  class TestComponent {
    @Input()headerIsHidden = true;
    headerHeight = 0;
  }

  // The directive must be in the component's compile-time scope: with the AOT
  // compilation of the unit-test builder, TestBed declarations alone are not
  // enough to resolve directive bindings on known HTML elements.
  @NgModule({
    declarations: [TestComponent],
    imports: [PageLabelModule],
    exports: [TestComponent]
  })
  class TestModule {}

  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [TestModule]
    })
      .createComponent(TestComponent);
    component = fixture.componentInstance;
  });

  it('should not display page label', () => {
    component.headerIsHidden = true;
    fixture.detectChanges();
    const header = fixture.debugElement.query(By.css('#header'));
    expect(header.nativeElement.style.display).toBe('none');
    expect(component.headerHeight).toBe(0);
  });

  it('should display page label with a height of 100', () => {
    component.headerIsHidden = false;
    fixture.detectChanges();
    const header = fixture.debugElement.query(By.css('#header'));
    expect(header.nativeElement.style.display).not.toBe('none');
    expect(component.headerHeight).toBe(100);
  });
});

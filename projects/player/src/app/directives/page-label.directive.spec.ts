import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageLabelDirective } from 'player/src/app/directives/page-label.directive';
import { Component, Input } from '@angular/core';
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
    </div>`
  })
  class TestComponent {
    @Input()headerIsHidden = true;
    headerHeight = 0;
  }

  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [TestComponent, PageLabelDirective]
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

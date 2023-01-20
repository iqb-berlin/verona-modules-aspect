import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { Section } from 'common/models/section';
import { PageScrollButtonComponent } from './page-scroll-button.component';

describe('PageScrollButtonComponent', () => {
  let component: PageScrollButtonComponent;
  let fixture: ComponentFixture<PageScrollButtonComponent>;

  @Component({ selector: 'aspect-section', template: '' })
  class SectionComponent {
    @Input() section!: Section;
    @Input() pageIndex!: number;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PageScrollButtonComponent,
        SectionComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageScrollButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

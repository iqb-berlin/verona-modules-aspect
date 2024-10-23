// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Page } from 'common/models/page';
import {
  Component, Directive, EventEmitter, Input, Output, Pipe, PipeTransform
} from '@angular/core';
import { Section } from 'common/models/section';
import { Subject } from 'rxjs';
import { PageComponent } from './page.component';

describe('PageComponent', () => {
  let component: PageComponent;
  let fixture: ComponentFixture<PageComponent>;

  @Component({ selector: 'aspect-section', template: '' })
  class SectionComponent {
    @Input() section!: Section;
    @Input() pageIndex!: number;
    @Input() sectionNumbering!: boolean;
  }

  @Directive({ selector: '[aspectSectionVisibilityHandling]' })
  class SectionVisibilityHandling {
    @Input() mediaStatusChanged!: Subject<string>;
    @Input() section!: Section;
    @Input() pageSections!: Section[];
    @Input() sectionIndex!: number;
  }

  @Directive({ selector: '[aspectInViewDetection]' })
  class InViewDetection {
    @Input() detectionType!: 'top' | 'bottom';
    @Output() intersecting = new EventEmitter();
  }

  @Pipe({ name: 'isEnabledNavigationTarget' })
  class MockIsEnabledNavigationTargetPipe implements PipeTransform {
    transform(): boolean {
      return true;
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PageComponent,
        SectionComponent,
        SectionVisibilityHandling,
        InViewDetection,
        MockIsEnabledNavigationTargetPipe
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageComponent);
    component = fixture.componentInstance;
    component.page = new Page();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

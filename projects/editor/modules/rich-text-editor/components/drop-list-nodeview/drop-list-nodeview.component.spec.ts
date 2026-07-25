// eslint-disable-next-line max-classes-per-file
import { Component, Directive, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  DropListNodeviewComponent
} from 'editor/modules/rich-text-editor/components/drop-list-nodeview/drop-list-nodeview.component';

interface StubElementModel {
  id: string;
  dimensions: { width: number; height: number };
}

@Component({ selector: 'aspect-drop-list', template: '', standalone: false })
class MockDropListComponent {
  @Input() elementModel!: StubElementModel;
  @Input() clozeContext!: boolean;
}

@Directive({ selector: '[matTooltip]', standalone: false })
class MockMatTooltipDirective {
  @Input() matTooltip!: string;
}

describe('DropListNodeviewComponent', () => {
  let component: DropListNodeviewComponent;
  let fixture: ComponentFixture<DropListNodeviewComponent>;
  const model: StubElementModel = { id: 'drop-list-1', dimensions: { width: 150, height: 30 } };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DropListNodeviewComponent, MockDropListComponent, MockMatTooltipDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(DropListNodeviewComponent);
    component = fixture.componentInstance;
    component.node = { attrs: { model } } as unknown as DropListNodeviewComponent['node'];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pass the element model to the drop list component', () => {
    const child = fixture.debugElement.query(By.directive(MockDropListComponent));
    expect(child.injector.get(MockDropListComponent).elementModel).toBe(model);
  });

  it('should set the cloze context on the drop list component', () => {
    const child = fixture.debugElement.query(By.directive(MockDropListComponent));
    expect(child.injector.get(MockDropListComponent).clozeContext).toBe(true);
  });

  it('should show the element id as tooltip', () => {
    const tooltip = fixture.debugElement.query(By.directive(MockMatTooltipDirective));
    expect(tooltip.injector.get(MockMatTooltipDirective).matTooltip).toBe('ID: drop-list-1');
  });

  it('should size the wrapper according to the model dimensions', () => {
    const wrapper = fixture.debugElement.query(By.css('div')).nativeElement as HTMLElement;
    expect(wrapper.style.width).toBe('150px');
    expect(wrapper.style.height).toBe('30px');
    expect(wrapper.style.display).toBe('inline-block');
  });
});

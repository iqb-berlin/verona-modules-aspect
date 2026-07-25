// eslint-disable-next-line max-classes-per-file
import { Component, Directive, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  DropdownNodeviewComponent
} from 'editor/modules/rich-text-editor/components/dropdown-nodeview/dropdown-nodeview.component';

interface StubElementModel {
  id: string;
  dimensions: { width: number; height: number };
}

@Component({ selector: 'aspect-dropdown', template: '', standalone: false })
class MockDropdownComponent {
  @Input() elementModel!: StubElementModel;
  @Input() clozeContext!: boolean;
}

@Directive({ selector: '[matTooltip]', standalone: false })
class MockMatTooltipDirective {
  @Input() matTooltip!: string;
}

describe('DropdownNodeviewComponent', () => {
  let component: DropdownNodeviewComponent;
  let fixture: ComponentFixture<DropdownNodeviewComponent>;
  const model: StubElementModel = { id: 'dropdown-1', dimensions: { width: 240, height: 60 } };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DropdownNodeviewComponent, MockDropdownComponent, MockMatTooltipDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownNodeviewComponent);
    component = fixture.componentInstance;
    component.node = { attrs: { model } } as unknown as DropdownNodeviewComponent['node'];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pass the element model to the dropdown component', () => {
    const child = fixture.debugElement.query(By.directive(MockDropdownComponent));
    expect(child.injector.get(MockDropdownComponent).elementModel).toBe(model);
  });

  it('should set the cloze context on the dropdown component', () => {
    const child = fixture.debugElement.query(By.directive(MockDropdownComponent));
    expect(child.injector.get(MockDropdownComponent).clozeContext).toBe(true);
  });

  it('should show the element id as tooltip', () => {
    const tooltip = fixture.debugElement.query(By.directive(MockMatTooltipDirective));
    expect(tooltip.injector.get(MockMatTooltipDirective).matTooltip).toBe('ID: dropdown-1');
  });

  it('should size the wrapper according to the model dimensions', () => {
    const wrapper = fixture.debugElement.query(By.css('div')).nativeElement as HTMLElement;
    expect(wrapper.style.width).toBe('240px');
    expect(wrapper.style.height).toBe('60px');
    expect(wrapper.style.display).toBe('inline-block');
  });
});

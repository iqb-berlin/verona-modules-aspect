// eslint-disable-next-line max-classes-per-file
import { Component, Directive, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ToggleButtonNodeviewComponent
} from 'editor/modules/rich-text-editor/components/toggle-button-nodeview/toggle-button-nodeview.component';

interface StubElementModel {
  id: string;
}

@Component({ selector: 'aspect-toggle-button', template: '', standalone: false })
class MockToggleButtonComponent {
  @Input() elementModel!: StubElementModel;
}

@Directive({ selector: '[matTooltip]', standalone: false })
class MockMatTooltipDirective {
  @Input() matTooltip!: string;
}

describe('ToggleButtonNodeviewComponent', () => {
  let component: ToggleButtonNodeviewComponent;
  let fixture: ComponentFixture<ToggleButtonNodeviewComponent>;
  const model: StubElementModel = { id: 'toggle-button-1' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToggleButtonNodeviewComponent, MockToggleButtonComponent, MockMatTooltipDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleButtonNodeviewComponent);
    component = fixture.componentInstance;
    component.node = { attrs: { model } } as unknown as ToggleButtonNodeviewComponent['node'];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pass the element model to the toggle button component', () => {
    const child = fixture.debugElement.query(By.directive(MockToggleButtonComponent));
    expect(child.injector.get(MockToggleButtonComponent).elementModel).toBe(model);
  });

  it('should show the element id as tooltip', () => {
    const tooltip = fixture.debugElement.query(By.directive(MockMatTooltipDirective));
    expect(tooltip.injector.get(MockMatTooltipDirective).matTooltip).toBe('ID: toggle-button-1');
  });

  it('should render the toggle button as inline block', () => {
    const child = fixture.debugElement.query(By.css('aspect-toggle-button'));
    const element = child.nativeElement as HTMLElement;
    expect(element.style.display).toBe('inline-block');
    expect(element.style.verticalAlign).toBe('middle');
  });
});

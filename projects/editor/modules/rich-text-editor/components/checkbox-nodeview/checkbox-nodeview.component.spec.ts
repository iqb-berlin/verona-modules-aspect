// eslint-disable-next-line max-classes-per-file
import { Component, Directive, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  CheckboxNodeviewComponent
} from 'editor/modules/rich-text-editor/components/checkbox-nodeview/checkbox-nodeview.component';

interface StubElementModel {
  id: string;
}

@Component({ selector: 'aspect-checkbox', template: '', standalone: false })
class MockCheckboxComponent {
  @Input() elementModel!: StubElementModel;
}

@Directive({ selector: '[matTooltip]', standalone: false })
class MockMatTooltipDirective {
  @Input() matTooltip!: string;
}

describe('CheckboxNodeviewComponent', () => {
  let component: CheckboxNodeviewComponent;
  let fixture: ComponentFixture<CheckboxNodeviewComponent>;
  const model: StubElementModel = { id: 'checkbox-1' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckboxNodeviewComponent, MockCheckboxComponent, MockMatTooltipDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxNodeviewComponent);
    component = fixture.componentInstance;
    component.node = { attrs: { model } } as unknown as CheckboxNodeviewComponent['node'];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pass the element model to the checkbox component', () => {
    const child = fixture.debugElement.query(By.directive(MockCheckboxComponent));
    expect(child.injector.get(MockCheckboxComponent).elementModel).toBe(model);
  });

  it('should show the element id as tooltip', () => {
    const tooltip = fixture.debugElement.query(By.directive(MockMatTooltipDirective));
    expect(tooltip.injector.get(MockMatTooltipDirective).matTooltip).toBe('ID: checkbox-1');
  });

  it('should render the checkbox as inline block', () => {
    const child = fixture.debugElement.query(By.css('aspect-checkbox'));
    expect((child.nativeElement as HTMLElement).style.display).toBe('inline-block');
  });
});

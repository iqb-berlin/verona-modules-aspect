// eslint-disable-next-line max-classes-per-file
import { Component, Directive, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ButtonNodeviewComponent
} from 'editor/modules/rich-text-editor/components/button-nodeview/button-nodeview.component';

interface StubElementModel {
  id: string;
}

@Component({ selector: 'aspect-button', template: '', standalone: false })
class MockButtonComponent {
  @Input() elementModel!: StubElementModel;
}

@Directive({ selector: '[matTooltip]', standalone: false })
class MockMatTooltipDirective {
  @Input() matTooltip!: string;
}

describe('ButtonNodeviewComponent', () => {
  let component: ButtonNodeviewComponent;
  let fixture: ComponentFixture<ButtonNodeviewComponent>;
  const model: StubElementModel = { id: 'button-1' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ButtonNodeviewComponent, MockButtonComponent, MockMatTooltipDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonNodeviewComponent);
    component = fixture.componentInstance;
    component.node = { attrs: { model } } as unknown as ButtonNodeviewComponent['node'];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pass the element model to the button component', () => {
    const child = fixture.debugElement.query(By.directive(MockButtonComponent));
    expect(child.injector.get(MockButtonComponent).elementModel).toBe(model);
  });

  it('should show the element id as tooltip', () => {
    const tooltip = fixture.debugElement.query(By.directive(MockMatTooltipDirective));
    expect(tooltip.injector.get(MockMatTooltipDirective).matTooltip).toBe('ID: button-1');
  });

  it('should render the button as inline block', () => {
    const child = fixture.debugElement.query(By.css('aspect-button'));
    expect((child.nativeElement as HTMLElement).style.display).toBe('inline-block');
  });
});

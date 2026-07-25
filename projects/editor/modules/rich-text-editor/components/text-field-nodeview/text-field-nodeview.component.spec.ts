// eslint-disable-next-line max-classes-per-file
import { Component, Directive, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  TextFieldNodeviewComponent
} from 'editor/modules/rich-text-editor/components/text-field-nodeview/text-field-nodeview.component';

interface StubElementModel {
  id: string;
}

@Component({ selector: 'aspect-text-field-simple', template: '', standalone: false })
class MockTextFieldSimpleComponent {
  @Input() elementModel!: StubElementModel;
}

@Directive({ selector: '[matTooltip]', standalone: false })
class MockMatTooltipDirective {
  @Input() matTooltip!: string;
}

describe('TextFieldNodeviewComponent', () => {
  let component: TextFieldNodeviewComponent;
  let fixture: ComponentFixture<TextFieldNodeviewComponent>;
  const model: StubElementModel = { id: 'text-field-1' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TextFieldNodeviewComponent, MockTextFieldSimpleComponent, MockMatTooltipDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(TextFieldNodeviewComponent);
    component = fixture.componentInstance;
    component.node = { attrs: { model } } as unknown as TextFieldNodeviewComponent['node'];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pass the element model to the text field component', () => {
    const child = fixture.debugElement.query(By.directive(MockTextFieldSimpleComponent));
    expect(child.injector.get(MockTextFieldSimpleComponent).elementModel).toBe(model);
  });

  it('should show the element id as tooltip', () => {
    const tooltip = fixture.debugElement.query(By.directive(MockMatTooltipDirective));
    expect(tooltip.injector.get(MockMatTooltipDirective).matTooltip).toBe('ID: text-field-1');
  });

  it('should render the text field as inline block', () => {
    const child = fixture.debugElement.query(By.css('aspect-text-field-simple'));
    expect((child.nativeElement as HTMLElement).style.display).toBe('inline-block');
  });
});

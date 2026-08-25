// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { UntypedFormGroup } from '@angular/forms';
import { UIElement } from 'common/models/elements/element';
import { TextElement, TextProperties } from 'common/models/elements/text';
import { CheckboxElement, CheckboxProperties } from 'common/models/elements/checkbox';
import { DropListElement, DropListProperties } from 'common/models/elements/drop-list';
import { TableChildOverlay } from './table-child-overlay.component';

@Component({
  selector: 'aspect-text',
  template: '',
  standalone: false
})
class MockTextComponent {
  @Input() elementModel!: UIElement;
  @Input() savedText!: string;
}

@Component({
  selector: 'aspect-checkbox',
  template: '',
  standalone: false
})
class MockCheckboxComponent {
  @Input() elementModel!: UIElement;
  @Input() parentForm!: UntypedFormGroup;
  @Input() tableMode!: boolean;
}

@Component({
  selector: 'aspect-drop-list',
  template: '',
  standalone: false
})
class MockDropListComponent {
  @Input() elementModel!: UIElement;
  @Input() parentForm!: UntypedFormGroup;
  @Input() clozeContext!: boolean;
}

describe('TableChildOverlay', () => {
  let component: TableChildOverlay;
  let fixture: ComponentFixture<TableChildOverlay>;

  const createTextElement = (): TextElement => new TextElement({
    type: 'text',
    id: 'text-id',
    alias: 'text-alias'
  } as Partial<TextProperties>);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TableChildOverlay,
        MockTextComponent,
        MockCheckboxComponent,
        MockDropListComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableChildOverlay);
    component = fixture.componentInstance;
    component.element = createTextElement();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render the matching child component for a text element', () => {
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(MockTextComponent))).not.toBeNull();
    expect(fixture.debugElement.query(By.directive(MockCheckboxComponent))).toBeNull();
  });

  it('should render the matching child component for a checkbox element', () => {
    component.element = new CheckboxElement({
      type: 'checkbox',
      id: 'checkbox-id',
      alias: 'checkbox-alias'
    } as Partial<CheckboxProperties>);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(MockCheckboxComponent))).not.toBeNull();
    expect(fixture.debugElement.query(By.directive(MockTextComponent))).toBeNull();
  });

  it('should add the padding class only for drop-list elements', () => {
    fixture.detectChanges();
    const wrapper: HTMLElement = fixture.nativeElement.querySelector('.wrapper');
    expect(wrapper.classList).not.toContain('drop-list-padding');

    component.element = new DropListElement({
      type: 'drop-list',
      id: 'drop-list-id',
      alias: 'drop-list-alias'
    } as Partial<DropListProperties>);
    fixture.detectChanges();
    expect(wrapper.classList).toContain('drop-list-padding');
    expect(fixture.debugElement.query(By.directive(MockDropListComponent))).not.toBeNull();
  });

  it('should pass the saved text of the element to the text child', () => {
    component.savedTexts = { 'text-id': 'saved text' };
    fixture.detectChanges();
    const mockText = fixture.debugElement.query(By.directive(MockTextComponent)).componentInstance;
    expect(mockText.savedText).toBe('saved text');
  });

  it('should emit elementSelected on click', () => {
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.elementSelected, 'emit');
    const wrapper: HTMLElement = fixture.nativeElement.querySelector('.wrapper');
    wrapper.click();
    expect(emitSpy).toHaveBeenCalledWith(component);
  });

  it('should show a selection border only while selected', () => {
    fixture.detectChanges();
    const wrapper: HTMLElement = fixture.nativeElement.querySelector('.wrapper');
    expect(wrapper.style.border).toBe('');

    component.setSelected(true);
    expect(component.isSelected).toBe(true);
    expect(wrapper.style.border).toContain('purple');

    component.setSelected(false);
    expect(wrapper.style.border).toBe('');
  });

  it('should disable pointer events on the child component in editor mode', () => {
    component.editorMode = true;
    fixture.detectChanges();
    const mockText: HTMLElement = fixture.nativeElement.querySelector('aspect-text');
    expect(mockText.style.pointerEvents).toBe('none');
  });
});

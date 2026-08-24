// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { UIElement } from 'common/models/elements/element';
import { ElementListComponent } from 'editor/src/app/components/element-list/element-list.component';

/* The template reads the static `icon`/`title` of the element class, so the stubs
   need to be real classes instead of object literals. */
class StubTextElement {
  static icon = 'text_fields';
  static title = 'Text';
  alias = 'text_1';
}

class StubButtonElement {
  static icon = 'smart_button';
  static title = 'Knopf';
  alias = 'button_1';
}

describe('ElementListComponent', () => {
  let component: ElementListComponent;
  let fixture: ComponentFixture<ElementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ElementListComponent],
      imports: [CommonModule, MatIconModule, MatListModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ElementListComponent);
    component = fixture.componentInstance;
    component.elements = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render no list item for an empty element list', () => {
    expect(fixture.nativeElement.querySelectorAll('mat-list-item').length).toBe(0);
  });

  it('should render one list item per element', () => {
    component.elements = [
      new StubTextElement() as unknown as UIElement,
      new StubButtonElement() as unknown as UIElement
    ];
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('mat-list-item').length).toBe(2);
  });

  it('should show the element class title, its icon and the element alias', () => {
    component.elements = [new StubTextElement() as unknown as UIElement];
    fixture.detectChanges();

    const listItem: HTMLElement = fixture.nativeElement.querySelector('mat-list-item');
    expect(listItem.querySelector('mat-icon')?.textContent?.trim()).toBe('text_fields');
    expect(listItem.textContent).toContain('Text');
    expect(listItem.textContent).toContain('text_1');
  });
});

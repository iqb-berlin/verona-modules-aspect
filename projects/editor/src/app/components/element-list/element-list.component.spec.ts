// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UIElement } from 'common/models/elements/element';
import { ElementListComponent } from 'editor/src/app/components/element-list/element-list.component';

/* The template reads the static `icon` of the element class, so the stubs
   need to be real classes instead of object literals. */
class StubTextElement {
  static icon = 'text_fields';
  type = 'text';
  alias = 'text_1';
}

class StubButtonElement {
  static icon = 'smart_button';
  type = 'button';
  alias = 'button_1';
}

class StubMarkingPanelElement {
  static icon = 'border_color';
  type = 'marking-panel';
  alias = 'marking-panel_1';
}

describe('ElementListComponent', () => {
  let component: ElementListComponent;
  let fixture: ComponentFixture<ElementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ElementListComponent],
      imports: [CommonModule, MatIconModule, MatListModule, MatButtonModule, TranslateModule.forRoot()]
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

  it('should show the element name, its icon and the element alias', () => {
    TestBed.inject(TranslateService).setTranslation('de', { toolbox: { text: 'Text' } });
    TestBed.inject(TranslateService).use('de');
    component.elements = [new StubTextElement() as unknown as UIElement];
    fixture.detectChanges();

    const listItem: HTMLElement = fixture.nativeElement.querySelector('mat-list-item');
    expect(listItem.querySelector('mat-icon')?.textContent?.trim()).toBe('text_fields');
    expect(listItem.querySelector('[matListItemTitle]')?.textContent?.trim()).toBe('Text: text_1');
  });

  /* The list names an element the way the properties panel does: by the translation of its type,
     not by a name of its own that has to be kept in step by hand (#1553). */
  it('should name an element by the toolbox translation of its type', () => {
    TestBed.inject(TranslateService).setTranslation('de', { toolbox: { 'marking-panel': 'Text marking' } });
    TestBed.inject(TranslateService).use('de');
    component.elements = [new StubMarkingPanelElement() as unknown as UIElement];
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[matListItemTitle]')?.textContent?.trim())
      .toBe('Text marking: marking-panel_1');
  });

  /* A list naming what the author should look at offers the way there (#1520). */
  it('should offer "Zum Element" only where asked to, and hand on the element chosen', () => {
    const element = new StubButtonElement() as unknown as UIElement;
    component.elements = [element];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.go-to-element')).toBeNull();

    component.navigable = true;
    const chosen = vi.fn();
    component.goToElement.subscribe(chosen);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.go-to-element') as HTMLButtonElement).click();

    expect(chosen).toHaveBeenCalledWith(element);
  });
});

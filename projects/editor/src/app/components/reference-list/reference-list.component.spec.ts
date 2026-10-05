import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TranslateModule } from '@ngx-translate/core';
import { Section } from 'common/models/section';
import { UIElement } from 'common/models/elements/element';
import { ReferenceList } from 'editor/src/app/classes/reference-manager';
import { ReferenceListComponent } from 'editor/src/app/components/reference-list/reference-list.component';

@Component({
  selector: 'aspect-element-list',
  standalone: false,
  template: ''
})
class MockElementListComponent {
  @Input() elements!: UIElement[];
  @Input() navigable: boolean = false;
  @Output() goToElement = new EventEmitter<UIElement>();
}

const createReferenceList = (alias: string, refAliases: string[]): ReferenceList => ({
  element: { alias, type: 'page' },
  refs: refAliases.map(refAlias => ({ alias: refAlias } as unknown as UIElement))
});

describe('ReferenceListComponent', () => {
  let component: ReferenceListComponent;
  let fixture: ComponentFixture<ReferenceListComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReferenceListComponent, MockElementListComponent],
      imports: [CommonModule, MatIconModule, MatListModule, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReferenceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the given references', () => {
    component.refs = [createReferenceList('from_input', ['ref_b', 'ref_c'])];
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('from_input');
  });

  /* The delete dialogs list what refers with the way there, so the author can resolve it by hand (#1520). */
  describe('as a list to navigate', () => {
    const section = { section: new Section(), pageIndex: 0, sectionIndex: 1 };

    beforeEach(() => {
      component.refs = [{ ...createReferenceList('feld', ['knopf']), sections: [section] }];
    });

    it('should offer no way anywhere unless asked to', () => {
      fixture.detectChanges();

      const elementList = fixture.debugElement.query(By.directive(MockElementListComponent));
      expect(elementList.injector.get(MockElementListComponent).navigable).toBe(false);
      expect(fixture.nativeElement.querySelector('.go-to-section')).toBeNull();
    });

    it('should pass the way to each element down and hand on the one chosen', () => {
      component.navigable = true;
      const chosen = vi.fn();
      component.goToElement.subscribe(chosen);
      fixture.detectChanges();

      const elementList = fixture.debugElement.query(By.directive(MockElementListComponent))
        .injector.get(MockElementListComponent);
      expect(elementList.navigable).toBe(true);
      elementList.goToElement.emit(component.refs[0].refs[0]);
      expect(chosen).toHaveBeenCalledWith(component.refs[0].refs[0]);
    });

    it('should offer to go to a referring section', () => {
      component.navigable = true;
      const chosen = vi.fn();
      component.goToSection.subscribe(chosen);
      fixture.detectChanges();

      (fixture.nativeElement.querySelector('.go-to-section') as HTMLButtonElement).click();
      expect(chosen).toHaveBeenCalledWith(section);
    });
  });

  it('should pass the references of a group down to the element list', () => {
    const referenceList = createReferenceList('from_input', ['ref_b', 'ref_c']);
    component.refs = [referenceList];
    fixture.detectChanges();

    const elementList = fixture.debugElement.query(By.directive(MockElementListComponent));
    expect(elementList.injector.get(MockElementListComponent).elements).toBe(referenceList.refs);
  });

  /* A section refers through its visibility rules; it is no element, so it gets a line of its own (#1509). */
  it('should name the sections whose visibility rules refer to the target', () => {
    component.refs = [{
      ...createReferenceList('feld', []),
      sections: [{ section: new Section(), pageIndex: 0, sectionIndex: 1 }]
    }];
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.referring-section').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('referenceList.visibilityRuleOf');
    expect(fixture.nativeElement.querySelector('.visibility-rule-hint')).toBeTruthy();
    // No element refers, so no empty element list leaves a gap above the section.
    expect(fixture.debugElement.queryAll(By.directive(MockElementListComponent)).length).toBe(0);
  });

  it('should not explain visibility rules where none refers', () => {
    component.refs = [createReferenceList('feld', ['knopf'])];
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.visibility-rule-hint')).toBeNull();
  });

  /* "Verweise auf Seite 2:" -- the target in bold after the words, the colon right behind it (#1520). */
  it('should introduce each group with the references to its target', () => {
    component.refs = [createReferenceList('Seite 2', ['knopf'])];
    fixture.detectChanges();

    const groupTitle: HTMLElement = fixture.nativeElement.querySelector('.reference-group-title');
    expect(groupTitle.textContent?.replace(/\s+/g, ' ').trim()).toBe('referenceList.referencesTo Seite 2:');
    expect(groupTitle.querySelector('b')?.textContent).toBe('Seite 2');
  });

  it('should name a text range through its translation', () => {
    component.refs = [{ element: { type: 'text-anchor', id: 'Hund', alias: 'Hund' }, refs: [] }];
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('referenceList.textAnchor');
  });

  it('should render nothing for an empty reference list', () => {
    component.refs = [];
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.directive(MockElementListComponent)).length).toBe(0);
  });
});

import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
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
}

const createReferenceList = (alias: string, refAliases: string[]): ReferenceList => ({
  element: { alias, type: 'page' },
  refs: refAliases.map(refAlias => ({ alias: refAlias } as unknown as UIElement))
});

describe('ReferenceListComponent', () => {
  let component: ReferenceListComponent;
  let fixture: ComponentFixture<ReferenceListComponent>;
  const injectedData: ReferenceList[] = [createReferenceList('injected', ['ref_a'])];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReferenceListComponent, MockElementListComponent],
      imports: [CommonModule, MatIconModule, MatListModule, TranslateModule.forRoot()],
      providers: [{ provide: MAT_SNACK_BAR_DATA, useValue: injectedData }]
    }).compileComponents();

    fixture = TestBed.createComponent(ReferenceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the injected snackbar data when no refs input is given', () => {
    expect(component.data).toBe(injectedData);
    expect(fixture.nativeElement.textContent).toContain('injected');
    expect(fixture.debugElement.queryAll(By.directive(MockElementListComponent)).length).toBe(1);
  });

  it('should prefer the refs input over the injected snackbar data', () => {
    component.refs = [createReferenceList('from_input', ['ref_b', 'ref_c'])];
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('from_input');
    expect(fixture.nativeElement.textContent).not.toContain('injected');
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

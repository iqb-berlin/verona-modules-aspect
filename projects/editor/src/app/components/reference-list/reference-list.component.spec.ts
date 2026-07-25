import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
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
      imports: [CommonModule],
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

  it('should render nothing for an empty reference list', () => {
    component.refs = [];
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.directive(MockElementListComponent)).length).toBe(0);
  });
});

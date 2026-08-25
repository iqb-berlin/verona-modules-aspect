import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { Component, Input } from '@angular/core';
import { LikertElement, LikertProperties } from 'common/models/elements/likert';
import {
  LikertRowElement, LikertRowProperties
} from 'common/models/elements/likert-row';
import { PropertyGroupGenerators } from 'common/models/elements/property-group-interfaces';
import { DragNDropValueObject, TextImageLabel } from 'common/models/label-interfaces';
import { LikertRowBackgroundColorPipe } from 'common/pipes/likert-row-background-color.pipe';
import {
  LikertRadioButtonGroupComponent
} from 'common/components/likert-radio-button-group/likert-radio-button-group.component';
import { LikertComponent } from './likert.component';

@Component({
  selector: 'aspect-text-image-panel',
  template: '',
  standalone: false
})
class MockTextImagePanelComponent {
  @Input() label!: TextImageLabel | DragNDropValueObject;
}

describe('LikertComponent', () => {
  let component: LikertComponent;
  let fixture: ComponentFixture<LikertComponent>;

  const createRow = (id: string): LikertRowElement => new LikertRowElement({
    type: 'likert-row',
    id,
    alias: id,
    columnCount: 2,
    rowLabel: {
      text: `Label ${id}`, imgSrc: null, imgFileName: '', imgPosition: 'left'
    }
  } as Partial<LikertRowProperties>);

  const createOption = (text: string): TextImageLabel => ({
    text, imgSrc: null, imgFileName: '', imgPosition: 'above'
  });

  const createLikertElement = (properties: Partial<LikertProperties> = {}): LikertElement => new LikertElement({
    type: 'likert',
    id: 'test-id',
    alias: 'test-alias',
    rows: [createRow('row-1'), createRow('row-2')],
    options: [createOption('Option 1'), createOption('Option 2')],
    firstColumnSizeRatio: 2,
    label: 'Likert Label',
    label2: 'Header Label',
    stickyHeader: false,
    styling: {
      ...PropertyGroupGenerators.generateBasicStyleProps(),
      lineHeight: 135,
      lineColoring: true,
      lineColoringColor: '#c9e0e0',
      firstLineColoring: false,
      firstLineColoringColor: '#c9e0e0'
    },
    ...properties
  } as Partial<LikertProperties>);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        LikertComponent,
        LikertRadioButtonGroupComponent,
        LikertRowBackgroundColorPipe,
        MockTextImagePanelComponent
      ],
      imports: [
        ReactiveFormsModule,
        MatRadioModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LikertComponent);
    component = fixture.componentInstance;
    component.elementModel = createLikertElement();
    component.parentForm = new UntypedFormGroup({
      'row-1': new UntypedFormControl(null),
      'row-2': new UntypedFormControl(null)
    });
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render one radio button group per row', () => {
    fixture.detectChanges();
    const rowGroups = fixture.nativeElement.querySelectorAll('aspect-likert-radio-button-group');
    expect(rowGroups.length).toBe(2);
  });

  it('should render the labels and one column header per option', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.label')?.textContent).toContain('Likert Label');
    expect(compiled.textContent).toContain('Header Label');
    expect(compiled.querySelectorAll('.likert-column-label').length).toBe(2);
  });

  it('should emit childrenAdded with the row components after view init', () => {
    const emitSpy = vi.spyOn(component.childrenAdded, 'emit');
    fixture.detectChanges();
    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy.mock.calls[0][0]?.length).toBe(2);
  });

  it('should return the row components as form element children', () => {
    fixture.detectChanges();
    const children = component.getFormElementChildrenComponents();
    expect(children.length).toBe(2);
    children.forEach(child => expect(child).toBeInstanceOf(LikertRadioButtonGroupComponent));
  });

  it('should show a placeholder message when there are no rows and no options', () => {
    component.elementModel = createLikertElement({ rows: [], options: [] });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Keine Zeilen oder Spalten vorhanden');
  });
});

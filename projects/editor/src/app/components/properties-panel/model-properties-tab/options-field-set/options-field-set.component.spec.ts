import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { LikertRowElement } from 'common/models/elements/compound-group-elements/likert/likert-row';
import { Label, TextImageLabel } from 'common/models/label-interfaces';
import { OptionElement } from 'common/models/ui-element-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { LikertRowLabelPipe } from 'editor/src/app/components/properties-panel/pipes/likert-row-label.pipe';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { IDService } from 'editor/src/app/services/id.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  OptionsFieldSetComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/options-field-set/options-field-set.component';

@Component({ selector: 'aspect-option-list-panel', standalone: false, template: '' })
class MockOptionListPanelComponent {
  @Input() title: string | undefined;
  @Input() textFieldLabel!: string;
  @Input() itemList!: Label[];
  @Input() showImageButton: boolean = false;
  @Output() textItemAdded = new EventEmitter<string>();
  @Output() imageItemAdded = new EventEmitter<void>();
  @Output() itemRemoved = new EventEmitter<number>();
  @Output() itemEdited = new EventEmitter<number>();
  @Output() itemReordered = new EventEmitter<{ previousIndex: number, currentIndex: number }>();
}

describe('OptionsFieldSetComponent', () => {
  let component: OptionsFieldSetComponent;
  let fixture: ComponentFixture<OptionsFieldSetComponent>;
  let elementService: SpyObj<ElementService>;
  let dialogService: SpyObj<DialogService>;
  let idService: SpyObj<IDService>;
  let emitted: { property: string; value: unknown }[];

  const selectedElement = {
    type: 'dropdown',
    getNewOptionLabel: (optionText: string): Label => ({ text: optionText, imgSrc: null })
  } as unknown as OptionElement;

  const createLikertRow = (alias: string, text: string): LikertRowElement => ({
    type: 'likert-row',
    id: alias,
    alias,
    rowLabel: { text, imgSrc: null },
    value: null,
    readOnly: false,
    verticalButtonAlignment: 'auto',
    unregisterIDs: vi.fn()
  } as unknown as LikertRowElement);

  beforeEach(async () => {
    elementService = createSpyObj<ElementService>(['updateElementsProperty', 'createLikertRowElement']);
    dialogService = createSpyObj<DialogService>(['showLabelEditDialog', 'showLikertRowEditDialog']);
    idService = createSpyObj<IDService>(['getAndRegisterNewIDs']);
    const selectionServiceMock = {
      getSelectedElements: () => [selectedElement]
    } as unknown as SelectionService;

    await TestBed.configureTestingModule({
      declarations: [
        OptionsFieldSetComponent,
        MockOptionListPanelComponent,
        LikertRowLabelPipe
      ],
      imports: [CommonModule],
      providers: [
        { provide: UnitService, useValue: {} as UnitService },
        { provide: ElementService, useValue: elementService },
        { provide: SelectionService, useValue: selectionServiceMock },
        { provide: DialogService, useValue: dialogService },
        { provide: IDService, useValue: idService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OptionsFieldSetComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      type: 'dropdown',
      // Arrays are not merged element by element, so their entries keep their real shape.
      options: [{ text: 'A', imgSrc: null }, { text: 'B', imgSrc: null }] as TextImageLabel[]
    };
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render one option list panel for the options', () => {
    const panels = fixture.debugElement.queryAll(By.directive(MockOptionListPanelComponent));
    expect(panels.length).toBe(1);
    expect((panels[0].componentInstance as MockOptionListPanelComponent).itemList)
      .toEqual([{ text: 'A', imgSrc: null }, { text: 'B', imgSrc: null }]);
  });

  it('should add a new option to every selected element', () => {
    component.addOption('options', 'C');

    expect(elementService.updateElementsProperty).toHaveBeenCalledWith(
      [selectedElement],
      'options',
      [{ text: 'A', imgSrc: null }, { text: 'B', imgSrc: null }, { text: 'C', imgSrc: null }]
    );
  });

  it('should add an image option with the dialog result', () => {
    const newLabel: Label = { text: 'C', imgSrc: 'data:image/png;base64,xyz' };
    dialogService.showLabelEditDialog.mockReturnValue(of(newLabel));

    component.addImageOption();

    expect(elementService.updateElementsProperty).toHaveBeenCalledWith(
      [selectedElement],
      'options',
      [{ text: 'A', imgSrc: null }, { text: 'B', imgSrc: null }, newLabel]
    );
  });

  it('should emit the remaining options when one is removed', () => {
    component.removeOption('options', 0);

    expect(emitted).toEqual([{ property: 'options', value: [{ text: 'B', imgSrc: null }] }]);
  });

  it('should emit the reordered options', () => {
    component.moveOption('options', { previousIndex: 0, currentIndex: 1 });

    expect(emitted).toEqual([{
      property: 'options',
      value: [{ text: 'B', imgSrc: null }, { text: 'A', imgSrc: null }]
    }]);
  });

  it('should replace an option with the dialog result', () => {
    const editedLabel: Label = { text: 'A*', imgSrc: null };
    dialogService.showLabelEditDialog.mockReturnValue(of(editedLabel));

    component.editOption('options', 0);

    expect(dialogService.showLabelEditDialog).toHaveBeenCalledWith({ text: 'A', imgSrc: null });
    expect(emitted).toEqual([{ property: 'options', value: [editedLabel, { text: 'B', imgSrc: null }] }]);
  });

  it('should append a new likert row', () => {
    const existingRow = createLikertRow('row1', 'Zeile 1');
    const newRow = createLikertRow('row2', 'Zeile 2');
    component.combinedProperties.rows = [existingRow];
    idService.getAndRegisterNewIDs.mockReturnValue({ id: 'row2', alias: 'row2' });
    elementService.createLikertRowElement.mockReturnValue(newRow);

    component.addLikertRow('Zeile 2');

    expect(idService.getAndRegisterNewIDs).toHaveBeenCalledWith('likert-row');
    expect(elementService.createLikertRowElement).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'likert-row', id: 'row2', columnCount: 2 })
    );
    expect(emitted).toEqual([{ property: 'rows', value: [existingRow, newRow] }]);
  });

  it('should unregister the ids of a removed likert row', () => {
    const firstRow = createLikertRow('row1', 'Zeile 1');
    const secondRow = createLikertRow('row2', 'Zeile 2');
    component.combinedProperties.rows = [firstRow, secondRow];

    component.removeLikertRow(0);

    expect(firstRow.unregisterIDs).toHaveBeenCalled();
    expect(emitted).toEqual([{ property: 'rows', value: [secondRow] }]);
  });

  it('should update changed properties of an edited likert row', () => {
    const row = createLikertRow('row1', 'Zeile 1');
    component.combinedProperties.rows = [row];
    dialogService.showLikertRowEditDialog.mockReturnValue(
      of({ ...row, alias: 'renamed', readOnly: true } as unknown as LikertRowElement)
    );

    component.editLikertRow(0);

    expect(elementService.updateElementsProperty).toHaveBeenCalledWith([row], 'alias', 'renamed');
    expect(elementService.updateElementsProperty).toHaveBeenCalledWith([row], 'readOnly', true);
  });
});

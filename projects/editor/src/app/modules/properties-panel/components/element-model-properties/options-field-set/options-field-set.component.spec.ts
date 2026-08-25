import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { LikertRowElement } from 'common/models/elements/likert-row';
import { Label, TextImageLabel } from 'common/models/label-interfaces';
import { OptionElement } from 'common/models/ui-element-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { LikertRowLabelPipe } from 'editor/src/app/modules/properties-panel/pipes/likert-row-label.pipe';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { IDService } from 'editor/src/app/services/id.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  OptionsFieldSetComponent
} from './options-field-set.component';

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
      imports: [CommonModule, MatFormFieldModule, MatInputModule, TranslateModule.forRoot()],
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

  /* A selection whose option lists disagree merges `options` to null. The control used to render
     anyway with an empty list, and adding an option then replaced BOTH elements' lists with that one
     option - a silent wipe. (Before this branch the same path threw instead, because the spread hit
     null.) The panel now refuses to offer the control, the way it refuses to invent an answer
     elsewhere. */
  describe('a selection whose lists disagree', () => {
    it('should offer no option list and write nothing', () => {
      component.combinedProperties = { type: 'dropdown', options: null };
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.directive(MockOptionListPanelComponent))).toBeNull();
      expect(emitted).toEqual([]);
      expect(elementService.updateElementsProperty).not.toHaveBeenCalled();
    });

    it('should offer no row list either', () => {
      component.combinedProperties = { type: 'likert', rows: null };
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.directive(MockOptionListPanelComponent))).toBeNull();
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /* The two captions came from the grab bag. They belong to the likert - `label` is the caption of
     the options table, `label2` the caption of its first column - and this component already read
     Merged<LikertProperties>, so they came home rather than into another catch-all. The dropdown and
     the radio group also use this component and must not show them. */
  describe('the likert captions', () => {
    const textareas = (): HTMLTextAreaElement[] => Array.from(
      fixture.nativeElement.querySelectorAll('textarea') as NodeListOf<HTMLTextAreaElement>
    );

    it('should show both captions for a likert and emit an edit', () => {
      component.combinedProperties = {
        type: 'likert', label: 'Tabelle', label2: 'Erste Spalte'
      };
      fixture.detectChanges();

      expect(textareas().map(t => t.value)).toEqual(['Tabelle', 'Erste Spalte']);

      textareas()[1].value = 'Neue Spalte';
      textareas()[1].dispatchEvent(new Event('input'));

      expect(emitted).toEqual([{ property: 'label2', value: 'Neue Spalte' }]);
    });

    it('should show neither for a dropdown', () => {
      expect(textareas()).toEqual([]);
    });
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

  /* The rows in the view are the models of the unit itself -- copyPlainData copies plain data and
     keeps models as they are (rules.md §15). Editing one therefore has to go through the write path;
     a direct write would land in the unit with nothing reported to the host (#1286). */
  it('should leave the edited likert row itself untouched', () => {
    const row = createLikertRow('row1', 'Zeile 1');
    component.combinedProperties.rows = [row];
    dialogService.showLikertRowEditDialog.mockReturnValue(
      of({
        ...row, rowLabel: { text: 'geändert', imgSrc: null }, readOnly: true
      } as unknown as LikertRowElement)
    );

    component.editLikertRow(0);

    expect(row.rowLabel.text).toBe('Zeile 1');
    expect(row.readOnly).toBe(false);
    expect(elementService.updateElementsProperty)
      .toHaveBeenCalledWith([row], 'rowLabel', { text: 'geändert', imgSrc: null });
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

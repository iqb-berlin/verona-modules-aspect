import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { DragNDropValueObject, Label } from 'common/models/label-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import {
  MergedCheckboxComponent
} from 'editor/src/app/modules/properties-panel/components/merged-checkbox/merged-checkbox.component';
import { GetValidDropListsPipe } from 'editor/src/app/modules/properties-panel/pipes/get-valid-drop-lists.pipe';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { IDService } from 'editor/src/app/services/id.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  DropListPropertiesComponent
} from './drop-list-properties.component';

@Component({
  selector: 'aspect-option-list-panel',
  standalone: false,
  template: ''
})
class MockOptionListPanelComponent {
  @Input() title: string | undefined;
  @Input() textFieldLabel!: string;
  @Input() itemList!: Label[];
  @Output() textItemAdded = new EventEmitter<string>();
  @Output() itemRemoved = new EventEmitter<number>();
  @Output() itemEdited = new EventEmitter<number>();
  @Output() itemReordered = new EventEmitter<{ previousIndex: number, currentIndex: number }>();
}

describe('DropListPropertiesComponent', () => {
  let component: DropListPropertiesComponent;
  let fixture: ComponentFixture<DropListPropertiesComponent>;
  let elementService: SpyObj<ElementService>;
  let dialogService: SpyObj<DialogService>;
  let idService: SpyObj<IDService>;
  let emitted: { property: string; value: unknown }[];

  const createValueObject = (id: string, text: string): DragNDropValueObject => ({
    id, alias: id, text, imgSrc: null, audioSrc: null, originListID: 'list1'
  } as DragNDropValueObject);

  beforeEach(async () => {
    elementService = createSpyObj<ElementService>(['updateDropListValueObject']);
    dialogService = createSpyObj<DialogService>(['showDropListOptionEditDialog']);
    idService = createSpyObj<IDService>(['getAndRegisterNewIDs', 'unregister']);
    const unitServiceMock = {
      expertMode: true,
      getAllDropListElementIDs: () => []
    } as unknown as UnitService;

    await TestBed.configureTestingModule({
      declarations: [DropListPropertiesComponent,
        MockOptionListPanelComponent,
        GetValidDropListsPipe,
        MergedCheckboxComponent
      ],
      imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: UnitService, useValue: unitServiceMock },
        { provide: ElementService, useValue: elementService },
        { provide: DialogService, useValue: dialogService },
        { provide: IDService, useValue: idService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DropListPropertiesComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      type: 'drop-list',
      idList: ['droplist1'],
      value: [createValueObject('value_1', 'first'), createValueObject('value_2', 'second')],
      connectedTo: [],
      orientation: 'vertical',
      isSortList: false,
      onlyOneItem: false,
      allowReplacement: false,
      copyOnDrop: false,
      permanentPlaceholders: false,
      permanentPlaceholdersCC: false,
      showNumbering: false,
      startNumberingAtZero: false,
      highlightReceivingDropList: false,
      highlightReceivingDropListColor: '#add8e6'
    };
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should force onlyOneItem when replacement is allowed', () => {
    component.updateAllowReplacement(true);

    expect(emitted).toEqual([
      { property: 'onlyOneItem', value: true },
      { property: 'allowReplacement', value: true }
    ]);
  });

  it('should disable allowReplacement when onlyOneItem is unchecked', () => {
    component.updateOnlyOneItem(false);

    expect(emitted).toEqual([
      { property: 'allowReplacement', value: false },
      { property: 'onlyOneItem', value: false }
    ]);
  });

  it('should add an option with newly registered IDs', () => {
    idService.getAndRegisterNewIDs.mockReturnValue({ id: 'value_3', alias: 'value_3' });

    component.addOption('third');

    expect(idService.getAndRegisterNewIDs).toHaveBeenCalledWith('value');
    expect(emitted.length).toBe(1);
    const newValueList = emitted[0].value as DragNDropValueObject[];
    expect(newValueList.length).toBe(3);
    expect(newValueList[2]).toMatchObject({ id: 'value_3', text: 'third' });
  });

  it('should unregister IDs and emit the shortened list when an option is removed', () => {
    component.removeOption(0);

    expect(idService.unregister).toHaveBeenCalledWith('value_1', true, false);
    expect(idService.unregister).toHaveBeenCalledWith('value_1', false, true);
    expect(emitted.length).toBe(1);
    expect((emitted[0].value as DragNDropValueObject[]).map(value => value.id)).toEqual(['value_2']);
  });

  it('should update the value object when the edit dialog is saved', () => {
    const editedValue = createValueObject('value_2', 'edited');
    dialogService.showDropListOptionEditDialog.mockReturnValue(of(editedValue));

    component.editOption(1);

    expect(elementService.updateDropListValueObject).toHaveBeenCalledWith(1, editedValue);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { UIElementValue } from 'common/models/ui-element-interfaces';
import { SafeResourceHTMLPipe } from 'common/pipes/safe-resource-html.pipe';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import {
  CombinedProperties
} from 'editor/src/app/components/properties-panel/element-properties-panel/element-properties-panel.component';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';
import {
  TextPropsComponent
} from 'editor/src/app/components/properties-panel/model-properties-tab/text-properties-field-set/text-properties-field-set.component';

@Component({ selector: 'aspect-highlight-properties', standalone: false, template: '' })
class MockHighlightPropertiesComponent {
  @Input() combinedProperties!: CombinedProperties;
  @Input() disabled!: boolean;
  @Output() updateModel = new EventEmitter<{ property: string; value: UIElementValue }>();
}

describe('TextPropsComponent', () => {
  let component: TextPropsComponent;
  let fixture: ComponentFixture<TextPropsComponent>;
  let dialogService: SpyObj<DialogService>;
  let emitted: { property: string; value: unknown }[];

  const selectedElement = { text: '<p>Alter Text</p>', styling: { fontSize: 20 } };

  beforeEach(async () => {
    dialogService = createSpyObj<DialogService>(['showRichTextEditDialog']);
    const unitServiceMock = {
      expertMode: true,
      unit: {
        getAllElements: () => [{ id: 'marking_panel_1', alias: 'Panel 1' }]
      }
    } as unknown as UnitService;
    const selectionServiceMock = {
      getSelectedElements: () => [selectedElement]
    } as unknown as SelectionService;

    await TestBed.configureTestingModule({
      declarations: [
        TextPropsComponent,
        MockHighlightPropertiesComponent,
        SafeResourceHTMLPipe
      ],
      imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: UnitService, useValue: unitServiceMock },
        { provide: DialogService, useValue: dialogService },
        { provide: SelectionService, useValue: selectionServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TextPropsComponent);
    component = fixture.componentInstance;
    component.combinedProperties = {
      type: 'text',
      text: '<p>Alter Text</p>',
      columnCount: 1,
      markingPanels: [],
      markingMode: 'selection',
      hasSelectionPopup: false,
      highlightableYellow: false,
      highlightableTurquoise: false,
      highlightableOrange: false
    };
    emitted = [];
    component.updateModel.subscribe(update => emitted.push(update));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should collect the ids and aliases of all marking panels', () => {
    expect(component.markingPanelIDs).toEqual([['marking_panel_1', 'Panel 1']]);
  });

  it('should render the text of the element and the highlight properties', () => {
    expect((fixture.nativeElement.querySelector('.text-text') as HTMLElement).innerHTML)
      .toContain('Alter Text');
    expect(fixture.debugElement.query(By.directive(MockHighlightPropertiesComponent))).not.toBeNull();
  });

  it('should emit the result of the text edit dialog', () => {
    dialogService.showRichTextEditDialog.mockReturnValue(of('<p>Neuer Text</p>'));

    const editButton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    editButton.click();

    expect(dialogService.showRichTextEditDialog).toHaveBeenCalledWith('<p>Alter Text</p>', 20);
    expect(emitted).toEqual([{ property: 'text', value: '<p>Neuer Text</p>' }]);
  });

  it('should not emit anything when the text edit dialog is cancelled', () => {
    dialogService.showRichTextEditDialog.mockReturnValue(of(''));

    component.showTextEditDialog();

    expect(emitted).toEqual([]);
  });

  it('should emit a copy of the connected marking panels', () => {
    const markingPanels = ['marking_panel_1'];

    component.toggleConnectedMarkingPanels(markingPanels);

    expect(emitted).toEqual([{ property: 'markingPanels', value: ['marking_panel_1'] }]);
    expect(emitted[0].value).not.toBe(markingPanels);
  });

  it('should emit the edited column count', () => {
    const columnCountInput = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;
    columnCountInput.value = '3';
    columnCountInput.dispatchEvent(new Event('input'));

    expect(emitted).toEqual([{ property: 'columnCount', value: '3' }]);
  });
});

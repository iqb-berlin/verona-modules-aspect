import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { UIElement } from 'common/models/elements/element';
import { Measurement } from 'common/models/ui-element-interfaces';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { SectionMenuComponent } from 'editor/src/app/components/section-menu/section-menu.component';
import { EditorPage } from 'editor/src/app/models/editor-page';
import { EditorSection } from 'editor/src/app/models/editor-section';
import { DialogService } from 'editor/src/app/services/dialog.service';
import { IDService } from 'editor/src/app/services/id.service';
import { MessageService } from 'editor/src/app/services/message.service';
import { SectionService } from 'editor/src/app/services/section.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';

@Component({ selector: 'aspect-size-input-panel', standalone: false, template: '' })
class MockSizeInputPanelComponent {
  @Input() label!: string;
  @Input() value!: number;
  @Input() unit!: string;
  @Input() allowedUnits!: string[];
  @Output() valueUpdated = new EventEmitter<Measurement>();
}

/* Only the component logic is covered here. The template consists almost entirely of
   Angular Material menus whose content is rendered lazily on menu open; driving those
   overlays would test Material, not this component. */
describe('SectionMenuComponent', () => {
  let component: SectionMenuComponent;
  let fixture: ComponentFixture<SectionMenuComponent>;
  let sectionService: SpyObj<SectionService>;
  let dialogService: SpyObj<DialogService>;
  let messageService: SpyObj<MessageService>;
  let clipboard: SpyObj<Clipboard>;
  let selectionService: SelectionService;
  let unitServiceMock: UnitService;
  let pages: EditorPage[];

  beforeEach(async () => {
    pages = [new EditorPage()];
    sectionService = createSpyObj<SectionService>([
      'updateSectionProperty', 'deleteSection', 'moveSection', 'transferSection',
      'duplicateSection', 'insertSection', 'replaceSection'
    ]);
    dialogService = createSpyObj<DialogService>(['showSectionInsertDialog', 'showVisibilityRulesDialog']);
    messageService = createSpyObj<MessageService>(['showSuccess']);
    clipboard = createSpyObj<Clipboard>(['copy']);
    selectionService = new SelectionService();
    unitServiceMock = {
      expertMode: true,
      savedSectionCode: undefined,
      unit: {
        pages,
        stateVariables: [],
        getAllElements: () => []
      }
    } as unknown as UnitService;

    await TestBed.configureTestingModule({
      declarations: [SectionMenuComponent, MockSizeInputPanelComponent],
      imports: [
        CommonModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: UnitService, useValue: unitServiceMock },
        { provide: SectionService, useValue: sectionService },
        { provide: SelectionService, useValue: selectionService },
        { provide: DialogService, useValue: dialogService },
        { provide: MessageService, useValue: messageService },
        { provide: IDService, useValue: new IDService() },
        { provide: Clipboard, useValue: clipboard }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SectionMenuComponent);
    component = fixture.componentInstance;
    component.section = pages[0].sections[0];
    component.sectionIndex = 0;
    component.lastSectionIndex = 0;
    component.pageIndex = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delegate property changes to the section service', () => {
    component.updateModel('backgroundColor', '#000000');

    expect(sectionService.updateSectionProperty)
      .toHaveBeenCalledWith(component.section, 'backgroundColor', '#000000');
  });

  it('should toggle the numbering exception', () => {
    component.ignoreNumbering();

    expect(sectionService.updateSectionProperty)
      .toHaveBeenCalledWith(component.section, 'ignoreNumbering', true);
  });

  it('should delete the section on the selected page', () => {
    selectionService.selectedPageIndex = 3;

    component.deleteSection();

    expect(sectionService.deleteSection).toHaveBeenCalledWith(3, 0);
  });

  it('should grow and shrink the size array with a default of one fraction', () => {
    component.section.gridRowSizes = [{ value: 2, unit: 'px' }];

    component.modifySizeArray('gridRowSizes', 3);

    expect(sectionService.updateSectionProperty).toHaveBeenCalledWith(
      component.section,
      'gridRowSizes',
      [{ value: 2, unit: 'px' }, { value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }]
    );

    component.modifySizeArray('gridRowSizes', 1);

    expect(sectionService.updateSectionProperty)
      .toHaveBeenCalledWith(component.section, 'gridRowSizes', [{ value: 2, unit: 'px' }]);
  });

  it('should replace a single grid size', () => {
    component.section.gridColumnSizes = [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }];

    component.changeGridSize('gridColumnSizes', 1, { value: 200, unit: 'px' });

    expect(sectionService.updateSectionProperty).toHaveBeenCalledWith(
      component.section,
      'gridColumnSizes',
      [{ value: 1, unit: 'fr' }, { value: 200, unit: 'px' }]
    );
  });

  it('should move the section inside the page and transfer it beyond the page bounds', () => {
    component.sectionIndex = 1;
    component.lastSectionIndex = 2;

    component.moveSection('up');
    expect(sectionService.moveSection).toHaveBeenCalledWith(component.section, 'up');

    component.sectionIndex = 2;
    component.moveSection('down');
    expect(sectionService.transferSection).toHaveBeenCalledWith(0, 2, 'down');
  });

  it('should copy the section to the clipboard and remember it in the unit service', () => {
    component.copySection();

    expect(clipboard.copy).toHaveBeenCalled();
    expect(messageService.showSuccess).toHaveBeenCalledWith('Abschnitt in Zwischenablage kopiert');
    expect(unitServiceMock.savedSectionCode).toBe(JSON.stringify(component.section));
  });

  it('should collect the section elements for the element list', () => {
    const element = { id: 'text_1', position: {} } as unknown as UIElement;
    vi.spyOn(component.section, 'getAllElements').mockReturnValue([element]);

    component.updateElementList();

    expect(component.sectionElements).toEqual([element]);
  });

  it('should announce clicks and hovers of positioned elements only', () => {
    const hovered: string[] = [];
    const selected: string[] = [];
    let hoverEndCount = 0;
    component.elementHovered.subscribe(id => hovered.push(id));
    component.elementSelected.subscribe(id => selected.push(id));
    component.elementHoverEnd.subscribe(() => {
      hoverEndCount += 1;
    });

    component.onUnitListElHover({ id: 'text_1', position: {} } as unknown as UIElement);
    component.onUnitListElHover({ id: 'cloze_child' } as unknown as UIElement);
    component.onUnitListElClick({ id: 'text_1' } as unknown as UIElement);

    expect(hovered).toEqual(['text_1']);
    expect(selected).toEqual(['text_1']);
    expect(hoverEndCount).toBe(1);
  });

  it('should insert the section returned by the insert dialog', () => {
    const newSection = new EditorSection();
    dialogService.showSectionInsertDialog.mockReturnValue(of({ newSection, replaceSection: false }));

    component.showSectionInsertDialog();

    expect(dialogService.showSectionInsertDialog).toHaveBeenCalledWith(true);
    expect(sectionService.insertSection).toHaveBeenCalled();
    expect(sectionService.replaceSection).not.toHaveBeenCalled();
  });

  it('should apply the visibility configuration returned by the dialog', () => {
    dialogService.showVisibilityRulesDialog.mockReturnValue(of({
      visibilityRules: [],
      logicalConnectiveOfRules: 'conjunction',
      visibilityDelay: 3,
      animatedVisibility: true,
      enableReHide: true
    }));

    component.showVisibilityRulesDialog();

    expect(sectionService.updateSectionProperty)
      .toHaveBeenCalledWith(component.section, 'visibilityDelay', 3);
    expect(sectionService.updateSectionProperty)
      .toHaveBeenCalledWith(component.section, 'logicalConnectiveOfRules', 'conjunction');
    expect(sectionService.updateSectionProperty)
      .toHaveBeenCalledWith(component.section, 'enableReHide', true);
  });

  it('should duplicate the section', () => {
    component.duplicateSection();

    expect(sectionService.duplicateSection).toHaveBeenCalledWith(0);
  });
});

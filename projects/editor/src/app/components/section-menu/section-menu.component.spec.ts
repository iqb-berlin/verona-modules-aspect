import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import {
  NumberFieldBadInputDirective
} from 'editor/modules/editor-shared/directives/number-field-bad-input.directive';
import { NumberFieldDirective } from 'editor/modules/editor-shared/directives/number-field.directive';
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
  @Input() min: number | null = null;
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
    messageService = createSpyObj<MessageService>(['showSuccess', 'showWarning']);
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
      declarations: [
        SectionMenuComponent, MockSizeInputPanelComponent,
        NumberFieldDirective, NumberFieldBadInputDirective
      ],
      imports: [
        CommonModule,
        FormsModule,
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

  /* The four number boxes live in the layout menu, so these open it and go through the boxes: what
     was wrong was the wiring, not the array logic above. They passed `$event.target.value` on - a
     string into `height`, which is declared `number` - and `|| 0` turned an emptied box into a 0,
     which for the counts cut the size array to nothing (#1164). */
  describe('the layout number boxes', () => {
    /* The menu renders into an overlay, outside the fixture. In template order: section height,
       then the row count, then the column count - the second height box belongs to the other
       branch of `dynamicPositioning` and is not rendered at the same time. */
    const boxes = (): HTMLInputElement[] => Array.from(
      document.querySelectorAll('.layoutMenu input[type="number"]') as NodeListOf<HTMLInputElement>
    );

    const edit = async (box: HTMLInputElement, value: string): Promise<void> => {
      box.value = value;
      box.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      box.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      await fixture.whenStable();
    };

    beforeEach(async () => {
      component.section.dynamicPositioning = true;
      component.section.autoRowSize = false;
      component.section.autoColumnSize = false;
      component.section.height = 400;
      component.section.gridRowSizes = [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }];
      component.section.gridColumnSizes = [{ value: 1, unit: 'fr' }];
      fixture.detectChanges();
      // The second of the two menus in this component: the element list is the first.
      const layoutMenuButton = Array.from(
        fixture.nativeElement.querySelectorAll('[aria-haspopup="menu"]') as NodeListOf<HTMLButtonElement>
      )[1];
      layoutMenuButton.click();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should write an edited height as a number', async () => {
      await edit(boxes()[0], '300');

      expect(sectionService.updateSectionProperty)
        .toHaveBeenCalledWith(component.section, 'height', 300);
    });

    it('should refuse an emptied height', async () => {
      await edit(boxes()[0], '');

      expect(sectionService.updateSectionProperty).not.toHaveBeenCalled();
      expect(messageService.showWarning).toHaveBeenCalledTimes(1);
      expect(boxes()[0].value).toBe('400');
    });

    /* The one that lost data: an emptied count wrote 0, and the whole size array went with it. */
    it('should refuse an emptied row count rather than drop every row', async () => {
      await edit(boxes()[1], '');

      expect(sectionService.updateSectionProperty).not.toHaveBeenCalled();
      expect(messageService.showWarning).toHaveBeenCalledTimes(1);
      expect(boxes()[1].value).toBe('2');
    });

    /* And a typed 0, which the box took before and which leaves a grid with no tracks at all. */
    it('should refuse a row count of zero', async () => {
      await edit(boxes()[1], '0');

      expect(sectionService.updateSectionProperty).not.toHaveBeenCalled();
      expect(boxes()[1].value).toBe('2');
    });

    it('should take a valid row count', async () => {
      await edit(boxes()[1], '3');

      expect(sectionService.updateSectionProperty).toHaveBeenCalledWith(
        component.section, 'gridRowSizes',
        [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }]
      );
    });
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

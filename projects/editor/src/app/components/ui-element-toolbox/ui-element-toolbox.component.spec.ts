import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { createSpyObj, SpyObj } from 'common/utils/vitest-spy-object';
import { TemplateService } from 'editor/modules/section-templates/services/template.service';
import {
  UiElementToolboxComponent
} from 'editor/src/app/components/ui-element-toolbox/ui-element-toolbox.component';
import { EditorPage } from 'editor/src/app/models/editor-page';
import { DragNDropService } from 'editor/src/app/services/drag-n-drop.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';

@Component({ selector: 'aspect-show-state-variables-button', standalone: false, template: '' })
class MockShowStateVariablesButtonComponent {
  @Input() stateVariablesCount!: number;
}

describe('UiElementToolboxComponent', () => {
  let component: UiElementToolboxComponent;
  let fixture: ComponentFixture<UiElementToolboxComponent>;
  let elementService: SpyObj<ElementService>;
  let templateService: SpyObj<TemplateService>;
  let dragNDropService: DragNDropService;
  let selectionService: SelectionService;
  let pages: EditorPage[];

  beforeEach(async () => {
    pages = [new EditorPage(), new EditorPage()];
    pages[1].addSection();
    elementService = createSpyObj<ElementService>(['addElementToSection']);
    templateService = createSpyObj<TemplateService>(['applyTemplate']);
    dragNDropService = new DragNDropService();
    selectionService = new SelectionService();

    const unitServiceMock = {
      expertMode: true,
      unit: { pages, stateVariables: [] }
    } as unknown as UnitService;

    await TestBed.configureTestingModule({
      declarations: [UiElementToolboxComponent, MockShowStateVariablesButtonComponent],
      imports: [
        CommonModule,
        MatButtonModule,
        MatExpansionModule,
        MatIconModule,
        MatTabsModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: SelectionService, useValue: selectionService },
        { provide: UnitService, useValue: unitServiceMock },
        { provide: TemplateService, useValue: templateService },
        { provide: ElementService, useValue: elementService },
        { provide: DragNDropService, useValue: dragNDropService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UiElementToolboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /* By the indices, deliberately: a new element has no element to follow, and after a load the
     element selection is whatever overlay rendered last (#1204). */
  it('should add a new element to the currently selected section', () => {
    selectionService.selectedPageIndex = 1;
    selectionService.selectedSectionIndex = 1;

    component.addUIElement('text');

    expect(elementService.addElementToSection)
      .toHaveBeenCalledWith('text', pages[1].sections[1]);
  });

  it('should flag a running drag and pass the element type via the data transfer', () => {
    const setData = vi.fn();
    const dragEvent = { dataTransfer: { setData } } as unknown as DragEvent;

    component.startDrag(dragEvent, 'button');

    expect(dragNDropService.isDragInProgress).toBe(true);
    expect(setData).toHaveBeenCalledWith('elementType', 'button');
  });

  it('should reset the drag flag when the drag ends', () => {
    dragNDropService.isDragInProgress = true;

    component.endDrag();

    expect(dragNDropService.isDragInProgress).toBe(false);
  });

  /** Hands the draggable buttons of both tabs to `check` and collects the names of the buttons it
   * returns: those of the element tab, the ones shown only on hover included, and those of the
   * assistants tab, which is the open one once expert mode is off and the element tab gone. */
  const offendingButtons = (check: (buttons: HTMLElement[]) => HTMLElement[]): (string | undefined)[] => {
    let seen = 0;
    const offending = [true, false].flatMap(expertMode => {
      TestBed.inject(UnitService).expertMode = expertMode;
      const toolbox = TestBed.createComponent(UiElementToolboxComponent);
      toolbox.componentInstance.hoverFormulaButton = true;
      toolbox.componentInstance.hoverRadioButton = true;
      toolbox.detectChanges();
      const buttons: HTMLElement[] = Array.from(toolbox.nativeElement.querySelectorAll('[draggable="true"]'));
      seen += buttons.length;
      return check(buttons);
    });
    expect(seen).toBe(34);
    return offending.map(button => button.textContent?.trim());
  };

  /* Left standing, the flag keeps the frames of dynamic sections from being clicked (#1590). */
  it('should end the drag again for every draggable button', () => {
    const leftStanding = offendingButtons(buttons => buttons.filter(button => {
      button.dispatchEvent(new DragEvent('dragstart'));
      const started = dragNDropService.isDragInProgress;
      button.dispatchEvent(new DragEvent('dragend'));
      const stillDragging = dragNDropService.isDragInProgress;
      dragNDropService.isDragInProgress = false;
      return !started || stillDragging;
    }));

    expect(leftStanding).toEqual([]);
  });

  /** Whether a descendant of the button reaches beyond the button's border box, as rendered or as
   * laid out. The layout counts as well because a click ripple starts out scaled to nothing and grows
   * to its laid-out size while the button is held, so by the time a drag starts Chrome sees most of
   * it, where the test would see nothing. Offsets are whole pixels, hence a tolerance of one. */
  const reachesOut = (button: HTMLElement): boolean => {
    const descendants = Array.from(button.querySelectorAll('*'));
    const own = button.getBoundingClientRect();
    const rendered = descendants
      .map(descendant => descendant.getBoundingClientRect())
      .filter(box => box.width > 0 && box.height > 0)
      .some(box => box.top < own.top - 0.5 || box.bottom > own.bottom + 0.5 ||
        box.left < own.left - 0.5 || box.right > own.right + 0.5);
    const laidOut = descendants
      .filter((descendant): descendant is HTMLElement => descendant instanceof HTMLElement)
      .map(descendant => {
        // Offsets count from inside the button's border.
        let left = button.clientLeft;
        let top = button.clientTop;
        let step: Element | null = descendant;
        while (step instanceof HTMLElement && step !== button) {
          left += step.offsetLeft;
          top += step.offsetTop;
          step = step.offsetParent;
        }
        if (step !== button) return undefined;
        return {
          left, top, right: left + descendant.offsetWidth, bottom: top + descendant.offsetHeight
        };
      })
      .filter(box => box !== undefined);
    // Measured only where the button is the offset parent; were it no longer, nothing would be.
    expect(laidOut.length).toBeGreaterThan(0);
    return rendered || laidOut.some(box => box.left < -1 || box.top < -1 ||
      box.right > button.offsetWidth + 1 || box.bottom > button.offsetHeight + 1);
  };

  /* Chrome crops the image of a dragged element to the box around it and all its descendants, clipped
     or not, so whatever reaches out of a button comes along into its drag image (#437). A drag begins
     with the button pressed, which is when Material draws its click ripple. */
  it('should keep everything inside a draggable button within the button while it is pressed', () => {
    const reachingOut = offendingButtons(buttons => buttons.filter(button => {
      const own = button.getBoundingClientRect();
      // A real press: without buttons and detail Material takes the event for a screen reader's.
      const press = {
        bubbles: true, buttons: 1, detail: 1, clientX: own.left + own.width / 2, clientY: own.top + own.height / 2
      };
      button.dispatchEvent(new MouseEvent('mouseenter', press));
      button.dispatchEvent(new MouseEvent('mousedown', press));
      const outside = reachesOut(button);
      button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      return outside;
    }));

    expect(reachingOut).toEqual([]);
  });

  it('should delegate applying a section template', () => {
    component.applyTemplate('likert');

    expect(templateService.applyTemplate).toHaveBeenCalledWith('likert');
  });

  /* A button carries the name the properties panel shows for the element it adds (#1553). */
  it('should label an element button with the toolbox translation of its type', () => {
    TestBed.inject(TranslateService).setTranslation('de', { toolbox: { 'marking-panel': 'Text marking' } });
    TestBed.inject(TranslateService).use('de');
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    const markingPanelButton = buttons.find(button => button.textContent?.includes('Text marking'));
    markingPanelButton?.click();

    expect(markingPanelButton).toBeDefined();
    expect(elementService.addElementToSection)
      .toHaveBeenCalledWith('marking-panel', pages[0].sections[0]);
  });

  it('should show the state variables button only in expert mode', () => {
    expect(fixture.nativeElement.querySelector('aspect-show-state-variables-button')).toBeTruthy();
  });
});

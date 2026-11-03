import {
  Directive, Input, ComponentRef,
  ViewChild, ViewContainerRef, OnInit, OnDestroy, ChangeDetectorRef, Output, EventEmitter
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ComponentRegistry } from 'common/utils/component-registry';
import { ElementComponent } from 'common/directives/element-component.directive';
import { CompoundElementComponent } from 'common/directives/compound-element.directive';
import { ClozeComponent } from 'common/components/elements/cloze/cloze.component';
import {
  ClozeChildOverlayComponent
} from 'common/components/cloze-child-overlay/cloze-child-overlay.component';
import { GeometryComponent } from 'common/components/elements/geometry/geometry.component';
import { TetfolioComponent } from 'common/components/elements/tetfolio/tetfolio.component';
import { FormElementComponent } from 'common/directives/form-element-component.directive';
import { DropListComponent } from 'common/components/elements/drop-list/drop-list.component';
import { MathTableComponent } from 'common/components/elements/math-table/math-table.component';
import { TableComponent } from 'common/components/elements/table/table.component';
import {
  TableChildOverlay
} from 'common/components/table-child-overlay/table-child-overlay.component';
import { DragOperatorService } from 'common/services/drag-operator.service';
import { ElementService } from 'editor/src/app/services/element.service';
import { DragNDropService } from 'editor/src/app/services/drag-n-drop.service';
import { Section } from 'common/models/section';
import { PositionedUIElement } from 'common/models/ui-element-interfaces';
import { UnitService } from 'editor/src/app/services/unit.service';
import { SelectionService } from 'editor/src/app/services/selection.service';

@Directive()
export abstract class ElementOverlay implements OnInit, OnDestroy {
  @Input() element!: PositionedUIElement;
  /** The section this overlay lives in. Handed in rather than looked up, so that the selection can
     say which section holds it without going through selectedPageIndex/selectedSectionIndex — those
     are written in several places and can name another section (#1204). */
  @Input() section!: Section;
  @Output() elementSelected = new EventEmitter();
  @ViewChild('elementContainer', { read: ViewContainerRef, static: true }) private elementContainer!: ViewContainerRef;
  isSelected = false;
  /** Make children not clickable. This way there is no interference with drag-and-drop via overlay. */
  preventInteraction = true;
  childComponent!: ComponentRef<ElementComponent | CompoundElementComponent>;
  private ngUnsubscribe = new Subject<void>();

  temporaryHighlight: boolean = false;

  constructor(public selectionService: SelectionService,
              protected unitService: UnitService,
              protected elementService: ElementService,
              protected dragNDropService: DragNDropService,
              private changeDetectorRef: ChangeDetectorRef,
              private dragOperatorService: DragOperatorService) { }

  ngOnInit(): void {
    const componentType = ComponentRegistry.getComponent(this.element.type);
    this.childComponent = this.elementContainer.createComponent(componentType);
    this.childComponent.instance.elementModel = this.element;

    this.childComponent.changeDetectorRef.detectChanges(); // this fires onInit, which initializes the FormControl

    if (this.childComponent.instance instanceof FormElementComponent) {
      (this.childComponent.instance as FormElementComponent).elementFormControl.setValue(this.element.value);
    }

    if (this.childComponent.instance instanceof ClozeComponent) {
      this.childComponent.instance.editorMode = this.preventInteraction;
      // make cloze element children clickable to access child elements
      this.childComponent.location.nativeElement.style.pointerEvents = 'unset';
      this.childComponent.instance.childElementSelected
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((elementSelectionEvent: ClozeChildOverlayComponent) => {
          this.selectionService.selectElement({ elementComponent: elementSelectionEvent, multiSelect: false });
        });
    }

    if (this.childComponent.instance instanceof TableComponent) {
      this.childComponent.instance.editorMode = this.preventInteraction;
      // make element children clickable to access child elements
      this.childComponent.location.nativeElement.style.pointerEvents = 'unset';
      this.childComponent.instance.childElementSelected
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((selectedElementComponent: TableChildOverlay) => {
          this.selectionService.selectElement({ elementComponent: selectedElementComponent, multiSelect: false });
        });
    }

    this.selectionService.selectElement({ elementComponent: this, multiSelect: false });

    // Geogebra element needs to know when its props are updated, re-init itself
    this.unitService.geometryElementPropertyUpdated
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (elementID: string) => {
          if (this.element.type === 'geometry' && this.element.id === elementID) {
            (this.childComponent.instance as GeometryComponent).refresh();
          }
        }
      );
    // same for math table
    this.unitService.mathTableElementPropertyUpdated
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (elementID: string) => {
          if (this.element.type === 'math-table' && this.element.id === elementID) {
            (this.childComponent.instance as MathTableComponent).refresh();
          }
        }
      );

    this.unitService.tablePropUpdated
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (elementID: string) => {
          if (this.element.type === 'table' && this.element.id === elementID) {
            (this.childComponent.instance as TableComponent).refresh();
          }
        }
      );

    // same for tetfolio: rebuild the iframe when htmlContent changes
    this.unitService.tetfolioElementPropertyUpdated
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (elementID: string) => {
          if (this.element.type === 'tetfolio' && this.element.id === elementID) {
            (this.childComponent.instance as TetfolioComponent).refresh();
          }
        }
      );

    this.unitService.presetValueUpdated
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((elementID: string) => this.showPresetValue(elementID));
  }

  /** Hands a preset written in the editor to the form control of the element, or of the child of a compound element,
     that has this ID (#1642). The control is filled once, when the element is drawn, and some templates show the
     value through it alone: the chosen option of a toggle button, the strike of a checkbox -- in a gap the only sign
     that it is checked --, the struck-out options of a radio group, the thumb of a slider.
     Drop lists are left out. They follow the panel through the array they share with their model, and while
     interaction is on they work on a copy that has to stay one (#1635). */
  showPresetValue(elementID: string): void {
    const component = this.childComponent.instance;
    [component, ...(component instanceof CompoundElementComponent ? component.getFormElementChildrenComponents() : [])]
      .filter((formElement): formElement is FormElementComponent => formElement instanceof FormElementComponent &&
        !(formElement instanceof DropListComponent) && formElement.elementModel.id === elementID)
      .forEach(formElement => formElement.elementFormControl.setValue(formElement.elementModel.value));
  }

  setSelected(newValue: boolean): void {
    this.isSelected = newValue;
    // This avoids: "NG0100: Expression has changed after it was checked"
    // The selection service may change the "selected" variable after onInit has run.
    // Therefore we need to run it again after this.
    this.changeDetectorRef.detectChanges();
  }

  highlight(duration?: number): void {
    this.temporaryHighlight = true;
    if (duration) {
      setTimeout(() => {
        this.temporaryHighlight = false;
      }, duration);
    }
  }

  removeHighlight(): void {
    this.temporaryHighlight = false;
  }

  selectElement(event?: MouseEvent): void {
    if (!this.isSelected) {
      // this.selectElement(event.shiftKey);
      if (event?.shiftKey) {
        this.selectionService.selectElement({ elementComponent: this, multiSelect: true });
      } else {
        this.selectionService.selectElement({ elementComponent: this, multiSelect: false });
      }
    }
    event?.stopPropagation();
    this.elementSelected.emit();
  }

  openEditDialog(): void {
    this.elementService.showDefaultEditDialog(this.element);
  }

  setInteractionEnabled(isEnabled: boolean): void {
    this.preventInteraction = !isEnabled;
    if (this.childComponent.instance instanceof ClozeComponent ||
      this.childComponent.instance instanceof TableComponent) {
      this.childComponent.instance.editorMode = !isEnabled;
    }
    this.setDropListsDetached(isEnabled);
  }

  /** Trying an element out leaves the unit as it is (#1635). In the editor a drop list holds its model's own value
     array -- that is how the canvas follows the properties panel, whose writes splice into that array -- and a drag
     rearranges the array the list holds. So while interaction is on, the drop lists of this element, its own or
     those of a cloze or table, work on a copy; switched off, they get the model's array back, and what was tried is
     gone. */
  private setDropListsDetached(isDetached: boolean): void {
    [this.element, ...this.element.getChildElements()]
      .map(element => this.dragOperatorService.dropLists[element.id])
      .filter(dropList => dropList !== undefined)
      .forEach(dropList => {
        dropList.elementFormControl.setValue(
          isDetached ? [...dropList.elementModel.value] : dropList.elementModel.value
        );
        // A copy of its own while detached: a sort list puts its placeholder into the view model during a drag.
        if (isDetached) dropList.refreshViewModel();
        else dropList.viewModel = dropList.elementModel.value;
        dropList.cdr.detectChanges();
      });
  }

  isInteractionEnabled(): boolean {
    return !this.preventInteraction;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

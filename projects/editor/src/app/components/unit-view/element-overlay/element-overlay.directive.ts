import {
  Directive, Input, ComponentRef,
  ViewChild, ViewContainerRef, OnInit, OnDestroy, ChangeDetectorRef, Output, EventEmitter
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ComponentRegistry } from 'common/utils/component-registry';
import { ElementComponent } from 'common/directives/element-component.directive';
import { CompoundElementComponent } from 'common/directives/compound-element.directive';
import { ClozeComponent } from 'common/components/compound-elements/cloze/cloze.component';
import {
  ClozeChildOverlayComponent
} from 'common/components/compound-elements/cloze-child-overlay/cloze-child-overlay.component';
import { GeometryComponent } from 'common/components/geometry/geometry.component';
import { FormElementComponent } from 'common/directives/form-element-component.directive';
import { MathTableComponent } from 'common/components/input-elements/math-table.component';
import { TableComponent } from 'common/components/compound-elements/table/table.component';
import { TableChildOverlay } from 'common/components/compound-elements/table/table-child-overlay.component';
import { ElementService } from 'editor/src/app/services/element.service';
import { DragNDropService } from 'editor/src/app/services/drag-n-drop.service';
import { PositionedUIElement } from 'common/interfaces';
import { UnitService } from '../../../services/unit.service';
import { SelectionService } from '../../../services/selection.service';

@Directive()
export abstract class ElementOverlay implements OnInit, OnDestroy {
  @Input() element!: PositionedUIElement;
  @Output() elementSelected = new EventEmitter();
  @ViewChild('elementContainer', { read: ViewContainerRef, static: true }) private elementContainer!: ViewContainerRef;
  isSelected = false;
  // Make children not clickable. This way there is no interference with drag-and-drop via overlay.
  preventInteraction = true;
  childComponent!: ComponentRef<ElementComponent | CompoundElementComponent>;
  private ngUnsubscribe = new Subject<void>();

  temporaryHighlight: boolean = false;

  constructor(public selectionService: SelectionService,
              protected unitService: UnitService,
              protected elementService: ElementService,
              protected dragNDropService: DragNDropService,
              private changeDetectorRef: ChangeDetectorRef) { }

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
          this.selectionService.isCompoundChildSelected = true;
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
          this.selectionService.isCompoundChildSelected = true;
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
  }

  isInteractionEnabled(): boolean {
    return !this.preventInteraction;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

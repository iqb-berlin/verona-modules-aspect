import {
  Directive, Input, ComponentRef,
  ViewChild, ViewContainerRef, OnInit, OnDestroy, ChangeDetectorRef, Output, EventEmitter
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ElementComponent } from 'common/directives/element-component.directive';
import { CompoundElementComponent } from 'common/directives/compound-element.directive';
import { ClozeComponent } from 'common/components/compound-elements/cloze/cloze.component';
import { ClozeChildOverlay } from
    'common/components/compound-elements/cloze/cloze-child-overlay.component';
import { UIElement } from 'common/models/elements/element';
import { GeometryComponent } from 'common/components/geometry/geometry.component';
import { GeometryElement } from 'common/models/elements/geometry/geometry';
import { FormElementComponent } from 'common/directives/form-element-component.directive';
import { UnitService } from '../../../services/unit.service';
import { SelectionService } from '../../../services/selection.service';
import { MathTableComponent } from 'common/components/input-elements/math-table.component';

@Directive()
export abstract class CanvasElementOverlay implements OnInit, OnDestroy {
  @Input() element!: UIElement;
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
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.childComponent = this.elementContainer.createComponent(this.element.getElementComponent());
    this.childComponent.instance.elementModel = this.element;

    this.childComponent.changeDetectorRef.detectChanges(); // this fires onInit, which initializes the FormControl

    if (this.childComponent.instance instanceof FormElementComponent) {
      (this.childComponent.instance as FormElementComponent).elementFormControl.setValue(this.element.value);
    }

    if (this.childComponent.instance instanceof ClozeComponent) {
      this.childComponent.instance.editorMode = true;
      // make cloze element children clickable to access child elements
      this.childComponent.location.nativeElement.style.pointerEvents = 'unset';
      this.childComponent.instance.childElementSelected
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((elementSelectionEvent: ClozeChildOverlay) => {
          this.selectionService.selectElement({ elementComponent: elementSelectionEvent, multiSelect: false });
          this.selectionService.isClozeChildSelected = true;
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
  }

  setSelected(newValue: boolean): void {
    this.temporaryHighlight = true;
    setTimeout(() => {
      this.temporaryHighlight = false;
    }, 2000);
    this.isSelected = newValue;
    // This avoids: "NG0100: Expression has changed after it was checked"
    // The selection service may change the "selected" variable after onInit has run.
    // Therefore we need to run it again after this.
    this.changeDetectorRef.detectChanges();
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
    this.unitService.showDefaultEditDialog(this.element);
  }

  setInteractionEnabled(isEnabled: boolean): void {
    this.preventInteraction = !isEnabled;
  }

  isInteractionEnabled(): boolean {
    return !this.preventInteraction
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

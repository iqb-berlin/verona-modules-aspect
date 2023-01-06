import {
  Directive, Input, ComponentRef,
  ViewChild, ViewContainerRef, OnInit, OnDestroy, ChangeDetectorRef, Output, EventEmitter
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ElementComponent } from 'common/directives/element-component.directive';
import { CompoundElementComponent } from 'common/directives/compound-element.directive';
import { ClozeComponent } from 'common/components/compound-elements/cloze/cloze.component';
import { CompoundChildOverlayComponent } from
  'common/components/compound-elements/cloze/compound-child-overlay.component';
import { DragNDropValueObject, UIElement } from 'common/models/elements/element';
import { GeometryComponent } from 'common/components/geometry/geometry.component';
import { GeometryElement } from 'common/models/elements/geometry/geometry';
import { DropListComponent } from 'common/components/input-elements/drop-list.component';
import { FormElementComponent } from 'common/directives/form-element-component.directive';
import { UnitService } from '../../../services/unit.service';
import { SelectionService } from '../../../services/selection.service';

@Directive()
export abstract class CanvasElementOverlay implements OnInit, OnDestroy {
  @Input() element!: UIElement;
  @Output() elementSelected = new EventEmitter();
  @ViewChild('elementContainer', { read: ViewContainerRef, static: true }) private elementContainer!: ViewContainerRef;
  isSelected = false;
  protected childComponent!: ComponentRef<ElementComponent | CompoundElementComponent>;
  private ngUnsubscribe = new Subject<void>();

  temporaryHighlight: boolean = false;

  constructor(public selectionService: SelectionService,
              protected unitService: UnitService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.childComponent = this.elementContainer.createComponent(this.element.getElementComponent());
    this.childComponent.instance.elementModel = this.element;

    if (this.childComponent.instance instanceof GeometryComponent) {
      this.childComponent.instance.appDefinition = (this.element as GeometryElement).appDefinition;
    }

    this.childComponent.changeDetectorRef.detectChanges(); // this fires onInit, which initializes the FormControl

    if (this.childComponent.instance instanceof FormElementComponent) {
      (this.childComponent.instance as FormElementComponent).elementFormControl.setValue(this.element.value);
    }

    // DropList keeps a special viewModel variable, which needs to be updated
    // if (this.childComponent.instance instanceof DropListComponent) {
    //   (this.childComponent.instance as DropListComponent).viewModel = this.element.value as DragNDropValueObject[];
    // }

    // Make children not clickable. This way the only relevant events are managed by the overlay.
    this.childComponent.location.nativeElement.style.pointerEvents = 'none';

    if (this.childComponent.instance instanceof ClozeComponent) {
      this.childComponent.instance.editorMode = true;
      // make cloze element children clickable to access child elements
      this.childComponent.location.nativeElement.style.pointerEvents = 'unset';
      this.childComponent.instance.childElementSelected
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((elementSelectionEvent: CompoundChildOverlayComponent) => {
          this.selectionService.selectElement({ elementComponent: elementSelectionEvent, multiSelect: false });
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
    this.childComponent.location.nativeElement.style.pointerEvents = isEnabled ? 'unset' : 'none';
  }

  isInteractionEnabled(): boolean {
    return this.childComponent.location.nativeElement.style.pointerEvents !== 'none';
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

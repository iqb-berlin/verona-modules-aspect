import {
  Directive, Input, ComponentRef,
  ViewChild, ViewContainerRef, OnInit, OnDestroy, ChangeDetectorRef, Output, EventEmitter
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnitService } from '../../../services/unit.service';
import { ElementComponent } from 'common/directives/element-component.directive';
import { SelectionService } from '../../../services/selection.service';
import { CompoundElementComponent } from 'common/directives/compound-element.directive';
import { ClozeComponent } from 'common/components/compound-elements/cloze/cloze.component';
import { CompoundChildOverlayComponent } from
    'common/components/compound-elements/cloze/compound-child-overlay.component';
import { UIElement } from 'common/models/elements/element';

@Directive()
export abstract class CanvasElementOverlay implements OnInit, OnDestroy {
  @Input() element!: UIElement;
  @Input() viewMode: boolean = false;
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
    this.childComponent = this.elementContainer.createComponent(this.element.getComponentFactory());
    this.childComponent.instance.elementModel = this.element;

    // Make children not clickable. This way the only relevant events are managed by the overlay.
    this.childComponent.location.nativeElement.style.pointerEvents = 'none';

    this.selectionService.selectElement({ elementComponent: this, multiSelect: false });

    if (this.childComponent.instance instanceof ClozeComponent) {
      // make cloze element children clickable
      this.childComponent.instance.editorMode = true;
      this.childComponent.location.nativeElement.style.pointerEvents = 'unset';
      this.childComponent.instance.childElementSelected
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((elementSelectionEvent: CompoundChildOverlayComponent) => {
          this.selectionService.selectElement({ elementComponent: elementSelectionEvent, multiSelect: false });
        });
    }
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

  selectElement(multiSelect: boolean = false): void {
    if (multiSelect) {
      this.selectionService.selectElement({ elementComponent: this, multiSelect: true });
    } else {
      this.selectionService.selectElement({ elementComponent: this, multiSelect: false });
    }
  }

  elementClicked(event: MouseEvent): void {
    if (!this.isSelected) {
      this.selectElement(event.shiftKey);
    }
    event.stopPropagation();
    this.elementSelected.emit();
  }

  openEditDialog(): void {
    this.unitService.showDefaultEditDialog(this.element);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

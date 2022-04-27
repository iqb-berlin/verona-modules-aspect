import {
  AfterViewInit, Component, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TextElement } from 'common/interfaces/elements';
import { TextComponent } from 'common/components/ui-elements/text.component';
import { TextMarker } from '../../classes/text-marker';
import { NativeEventService } from '../../services/native-event.service';
import { UnitStateService } from '../../services/unit-state.service';
import { ElementGroupDirective } from '../../directives/element-group.directive';
import { ElementModelElementCodeMappingService } from '../../services/element-model-element-code-mapping.service';
import { ElementComponent } from 'common/directives/element-component.directive';

@Component({
  selector: 'aspect-element-text-group',
  templateUrl: './element-text-group.component.html',
  styleUrls: ['./element-text-group.component.scss']
})
export class ElementTextGroupComponent extends ElementGroupDirective implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('elementComponent') elementComponent!: ElementComponent;
  TextElement!: TextElement;

  initialValue!: string;
  isMarkingBarOpen!: boolean;
  selectedColor!: string | null;
  selectedMode!: 'mark' | 'delete' | null;
  markingBarPosition: { top: number, left: number } = { top: 0, left: 0 };
  textComponentRect!: DOMRect;
  textComponentContainerScrollTop!: number;

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private nativeEventService: NativeEventService,
    private unitStateElementMapperService: ElementModelElementCodeMappingService,
    public unitStateService: UnitStateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initialValue = this.unitStateElementMapperService
      .mapToElementModelValue(
        this.unitStateService.getElementCodeById(this.elementModel.id)?.value, this.elementModel
      ) as string;
  }

  ngAfterViewInit(): void {
    this.registerAtUnitStateService(
      this.elementModel.id,
      this.unitStateElementMapperService.mapToElementCodeValue(this.initialValue, this.elementModel.type),
      this.elementComponent,
      this.pageIndex);
  }

  applySelection(
    selection: { active: boolean; mode: 'mark' | 'delete'; color: string; colorName: string | undefined },
    elementComponent: TextComponent
  ): void {
    if (selection.active) {
      this.selectedColor = selection.color;
      this.selectedMode = selection.mode;
      this.applySelectionToText(selection.mode, selection.color, elementComponent);
    } else {
      this.selectedColor = null;
      this.selectedMode = null;
    }
  }

  startSelection(pointerDown: PointerEvent, elementComponent: TextComponent): void {
    this.isMarkingBarOpen = false;
    this.nativeEventService.pointerUp
      .pipe(takeUntil(this.ngUnsubscribe), first())
      .subscribe((pointerUp: PointerEvent) => {
        this.stopSelection(
          this.getClientPointFromEvent(pointerUp),
          pointerUp.ctrlKey,
          this.getClientPointFromEvent(pointerDown),
          elementComponent
        );
      });
  }

  applySelectionToText(mode: 'mark' | 'delete', color: string, elementComponent: TextComponent): void {
    TextMarker
      .applySelection(
        mode,
        color,
        elementComponent
      );
    this.isMarkingBarOpen = false;
  }

  private stopSelection(
    mouseUp: { clientX: number, clientY: number },
    ctrlKey: boolean,
    downPosition: { clientX: number, clientY: number },
    elementComponent: TextComponent
  ) {
    const selection = window.getSelection();
    if (selection && TextMarker.isSelectionValid(selection) && selection.rangeCount > 0) {
      if (!TextMarker.isRangeInside(selection.getRangeAt(0), elementComponent.textContainerRef.nativeElement) ||
        (ctrlKey)) {
        selection.removeAllRanges();
      } else if (this.selectedMode && this.selectedColor) {
        this.applySelectionToText(this.selectedMode, this.selectedColor, elementComponent);
      } else if (!this.isMarkingBarOpen) {
        this.openMarkingBar(mouseUp, downPosition, elementComponent);
      }
    }
  }

  private getClientPointFromEvent = (event: PointerEvent): { clientX: number, clientY: number } => ({
    clientX: event.clientX,
    clientY: event.clientY
  });

  private openMarkingBar(
    mouseUp: { clientX: number, clientY: number },
    downPosition: { clientX: number, clientY: number },
    elementComponent: TextComponent
  ) {
    this.markingBarPosition.left = downPosition.clientX > mouseUp.clientX ? downPosition.clientX : mouseUp.clientX;
    this.markingBarPosition.top = downPosition.clientY > mouseUp.clientY ? downPosition.clientY : mouseUp.clientY;
    this.textComponentContainerScrollTop =
      elementComponent.domElement.closest('.fixed-size-content')?.scrollTop || 0;
    this.textComponentRect = elementComponent.domElement.getBoundingClientRect();
    this.isMarkingBarOpen = true;
    this.nativeEventService.pointerDown
      .pipe(takeUntil(this.ngUnsubscribe), first())
      .subscribe(() => this.closeMarkingBar());
  }

  private closeMarkingBar() {
    this.isMarkingBarOpen = false;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

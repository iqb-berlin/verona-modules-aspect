import {
  AfterViewInit,
  ApplicationRef,
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import { TextComponent } from 'common/components/text/text.component';
import { TextElement } from 'common/models/elements/text/text';
import { AnchorService } from 'player/src/app/services/anchor.service';
import { TextMarkingSupport } from 'player/src/app/classes/text-marking-support';
import { MarkableSupport } from 'player/src/app/classes/markable-support';
import { MarkingPanelService } from 'player/src/app/services/marking-panel.service';
import { MarkingData, MarkingPanelMarkingData } from 'common/models/marking-data';
import { takeUntil } from 'rxjs/operators';
import { Subject, take } from 'rxjs';
import { ValueChangeElement } from 'common/interfaces';
import { NativeEventService } from '../../../services/native-event.service';
import { UnitStateService } from '../../../services/unit-state.service';
import { ElementGroupDirective } from '../../../directives/element-group.directive';
import { ElementModelElementCodeMappingService } from '../../../services/element-model-element-code-mapping.service';

@Component({
  selector: 'aspect-text-group-element',
  templateUrl: './text-group-element.component.html',
  styleUrls: ['./text-group-element.component.scss']
})
export class TextGroupElementComponent extends ElementGroupDirective implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('elementComponent') elementComponent!: TextComponent;
  TextElement!: TextElement;
  textMarkingSupport: TextMarkingSupport;
  markableSupport: MarkableSupport;
  savedText: string = '';
  savedMarks: string[] = [];
  private ngUnsubscribe = new Subject<void>();

  constructor(
    nativeEventService: NativeEventService,
    anchorService: AnchorService,
    renderer: Renderer2,
    applicationRef: ApplicationRef,
    private elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
    public unitStateService: UnitStateService,
    private markingPanelService: MarkingPanelService
  ) {
    super();
    this.textMarkingSupport = new TextMarkingSupport(nativeEventService, anchorService);
    this.markableSupport = new MarkableSupport(renderer, applicationRef, this.markingPanelService);
    this.subscribeToMarkingPanelMarkingDataChanged();
  }

  ngOnInit(): void {
    this.savedMarks = this.unitStateService.getElementCodeById(this.elementModel.id)?.value as string[] || [];
    this.savedText = this.elementModelElementCodeMappingService
      .mapToElementModelValue(
        this.savedMarks, this.elementModel
      ) as string;
  }

  ngAfterViewInit(): void {
    if (this.elementModel.markingMode === 'word' || this.elementModel.markingMode === 'range') {
      this.markableSupport.createMarkables(this.savedMarks, this.elementComponent);
      this.markableSupport.registerRangeClicks(this.elementComponent);
    }
    this.registerAtUnitStateService(
      this.elementModel.id,
      this.elementModel.alias,
      ElementModelElementCodeMappingService
        .mapToElementCodeValue(
          this.getElementModelValue(),
          this.elementModel.type,
          {
            markingMode: (this.elementModel as TextElement).markingMode
          }),
      this.elementComponent,
      this.pageIndex);
    // timeout is needed to give marking panels on other pages time to initialize
    setTimeout(() => this.broadcastMarkingColorChange(undefined));
  }

  broadcastMarkingColorChange(color: string | undefined): void {
    this.markingPanelService
      .broadcastMarkingColorData({
        color: color,
        id: this.elementModel.id,
        markingMode: (this.elementModel as TextElement).markingMode,
        markingPanels: (this.elementModel as TextElement).markingPanels
      });
  }

  private subscribeToMarkingPanelMarkingDataChanged() {
    this.markingPanelService.markingPanelMarkingDataChanged
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data: MarkingPanelMarkingData) => {
        if ((this.elementModel as TextElement).markingPanels.includes(data.id)) {
          this.elementComponent.selectedColor
            .next(TextGroupElementComponent.getSelectedColorValue(data.markingData));
          this.textMarkingSupport.applyMarkingData(data.markingData, this.elementComponent);
          this.elementComponent.textSelectionStart
            .pipe(takeUntil(this.ngUnsubscribe), take(1))
            .subscribe(pointerEvent => {
              this.textMarkingSupport.startTextSelection(pointerEvent, this.elementComponent);
            });
        }
      });
  }

  static getSelectedColorValue(markingData: MarkingData): string | undefined {
    if (!markingData.active) return undefined;
    return markingData.colorName;
  }

  private getElementModelValue(): string | string[] {
    return (this.elementModel as TextElement).markingMode === 'word' ||
    (this.elementModel as TextElement).markingMode === 'range' ? this.savedMarks : this.savedText;
  }

  changeElementCodeValue(value: ValueChangeElement): void {
    this.unitStateService.changeElementCodeValue({
      id: value.id,
      value: ElementModelElementCodeMappingService
        .mapToElementCodeValue(
          value.value,
          this.elementModel.type,
          {
            markingMode: (this.elementModel as TextElement).markingMode
          })
    });
  }

  ngOnDestroy(): void {
    this.markableSupport.reset();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.textMarkingSupport.destroy();
  }
}

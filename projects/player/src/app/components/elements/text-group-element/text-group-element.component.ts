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
import { ValueChangeElement } from 'common/models/elements/element';
import { AnchorService } from 'player/src/app/services/anchor.service';
import { TextMarkingSupport } from 'player/src/app/classes/text-marking-support';
import { MarkableSupport } from 'player/src/app/classes/markable-support';
import { RemoteControlService } from 'player/src/app/services/remote-control.service';
import { MarkingData, RemoteMarkingData } from 'common/models/marking-data';
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

  constructor(
    nativeEventService: NativeEventService,
    anchorService: AnchorService,
    renderer: Renderer2,
    applicationRef: ApplicationRef,
    private elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
    public unitStateService: UnitStateService,
    private remoteControlService: RemoteControlService
  ) {
    super();
    this.textMarkingSupport = new TextMarkingSupport(nativeEventService, anchorService);
    this.markableSupport = new MarkableSupport(renderer, applicationRef);
    this.subscribeToMarkingDataChanged();
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
    }
    this.registerAtUnitStateService(
      this.elementModel.id,
      ElementModelElementCodeMappingService
        .mapToElementCodeValue(
          this.getElementModelValue(),
          this.elementModel.type,
          {
            markingMode: (this.elementModel as TextElement).markingMode
          }),
      this.elementComponent,
      this.pageIndex);
    this.elementComponent.selectedColor
      .subscribe(color => this.remoteControlService
        .broadcastMarkingColorChange({
          color: color,
          id: this.elementModel.id,
          markingBars: (this.elementModel as TextElement).markingBars
        }));
  }

  private subscribeToMarkingDataChanged() {
    this.remoteControlService.remoteMarkingDataChanged
      .subscribe((data: RemoteMarkingData) => {
        if ((this.elementModel as TextElement).markingBars.includes(data.id)) {
          this.elementComponent.selectedColor
            .next(TextGroupElementComponent.getSelectedColorValue(data.markingData));
        }
      });
  }

  private static getSelectedColorValue(markingData: MarkingData): string | undefined {
    if (!markingData.active || markingData.mode !== 'mark') return undefined;
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
    this.textMarkingSupport.destroy();
  }
}

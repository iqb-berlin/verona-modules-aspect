import {
  AfterViewInit, Component, OnDestroy, OnInit, Renderer2, ViewChild
} from '@angular/core';
import { TextComponent } from 'common/components/text/text.component';
import { TextElement } from 'common/models/elements/text/text';
import { ValueChangeElement } from 'common/models/elements/element';
import { AnchorService } from 'player/src/app/services/anchor.service';
import { TextMarkingSupport } from 'player/src/app/classes/text-marking-support';
import { TextMarkingUtils } from 'player/src/app/classes/text-marking-utils';
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
  textMarkingSupport:TextMarkingSupport;
  savedText: string = '';

  constructor(
    private nativeEventService: NativeEventService,
    private anchorService: AnchorService,
    private elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
    public unitStateService: UnitStateService,
    private renderer: Renderer2
  ) {
    super();
    this.textMarkingSupport = new TextMarkingSupport(nativeEventService, anchorService);
  }

  ngOnInit(): void {
    this.savedText = this.elementModelElementCodeMappingService
      .mapToElementModelValue(
        this.unitStateService.getElementCodeById(this.elementModel.id)?.value, this.elementModel
      ) as string;
  }

  private listenClickEvents(): void {
    const clickables = this.elementComponent.textContainerRef.nativeElement.querySelectorAll('aspect-clickable');
    clickables.forEach((clickable: HTMLElement) => {
      this.renderer.listen(clickable, 'click', () => { this.onClickableClick(clickable); });
    });
  }

  onClickableClick(clickable: HTMLElement): void {
    const rgbColor = TextMarkingUtils.hexToRgbString(TextElement.selectionColors.orange);
    if (clickable.style.backgroundColor === rgbColor) {
      clickable.style.backgroundColor = 'transparent';
    } else {
      clickable.style.backgroundColor = TextElement.selectionColors.orange;
    }
    this.elementComponent.elementValueChanged.emit({
      id: this.elementModel.id,
      value: this.elementComponent.textContainerRef.nativeElement.innerHTML
    });
  }

  ngAfterViewInit(): void {
    if ((this.elementModel as TextElement).markingMode === 'singleClick' ||
      (this.elementModel as TextElement).markingMode === 'rangeClick') {
      this.listenClickEvents();
    }
    this.registerAtUnitStateService(
      this.elementModel.id,
      this.elementModelElementCodeMappingService
        .mapToElementCodeValue(this.savedText, this.elementModel.type, this.elementModel),
      this.elementComponent,
      this.pageIndex);
  }

  changeElementCodeValue(value: ValueChangeElement): void {
    this.unitStateService.changeElementCodeValue({
      id: value.id,
      value: this.elementModelElementCodeMappingService
        .mapToElementCodeValue(value.value, this.elementModel.type, this.elementModel)
    });
  }

  ngOnDestroy(): void {
    this.textMarkingSupport.destroy();
  }
}

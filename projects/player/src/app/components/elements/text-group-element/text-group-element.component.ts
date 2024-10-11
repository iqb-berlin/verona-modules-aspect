import {
  AfterViewInit, ApplicationRef,
  Component,
  OnDestroy,
  OnInit, Renderer2,
  ViewChild
} from '@angular/core';
import { TextComponent } from 'common/components/text/text.component';
import { TextElement } from 'common/models/elements/text/text';
import { ValueChangeElement } from 'common/models/elements/element';
import { AnchorService } from 'player/src/app/services/anchor.service';
import { TextMarkingSupport } from 'player/src/app/classes/text-marking-support';
import { TextMarkingUtils } from 'player/src/app/classes/text-marking-utils';
import { MarkableSupport } from 'player/src/app/classes/markable-support';
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
    private nativeEventService: NativeEventService,
    private anchorService: AnchorService,
    private elementModelElementCodeMappingService: ElementModelElementCodeMappingService,
    public unitStateService: UnitStateService,
    private renderer: Renderer2,
    private applicationRef: ApplicationRef
  ) {
    super();
    this.textMarkingSupport = new TextMarkingSupport(nativeEventService, anchorService);
    this.markableSupport = new MarkableSupport(renderer, applicationRef);
  }

  ngOnInit(): void {
    this.savedMarks = this.elementModelElementCodeMappingService
      .mapToElementModelValue(this.unitStateService
        .getElementCodeById(this.elementModel.id)?.value, this.elementModel) as string[];
    this.savedText = ((this.elementModel as TextElement).markingMode === 'selection') ?
      TextMarkingUtils
        .restoreMarkedTextIndices(
          this.savedMarks,
          ElementModelElementCodeMappingService.modifyAnchors((this.elementModel as TextElement).text)) :
      ElementModelElementCodeMappingService.modifyAnchors((this.elementModel as TextElement).text);
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

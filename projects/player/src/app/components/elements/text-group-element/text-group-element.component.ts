import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { TextComponent } from 'common/components/text/text.component';
import { TextElement } from 'common/models/elements/text/text';
import { ValueChangeElement } from 'common/models/elements/element';
import { AnchorService } from 'player/src/app/services/anchor.service';
import { TextMarkingSupport } from 'player/src/app/classes/text-marking-support';
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
    public unitStateService: UnitStateService
  ) {
    super();
    this.textMarkingSupport = new TextMarkingSupport(nativeEventService, anchorService);
  }

  ngOnInit(): void {
    this.savedText = this.elementModelElementCodeMappingService
      .mapToElementModelValue(this.unitStateService
        .getElementCodeById(this.elementModel.id)?.value, this.elementModel) as string;
  }

  ngAfterViewInit(): void {
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

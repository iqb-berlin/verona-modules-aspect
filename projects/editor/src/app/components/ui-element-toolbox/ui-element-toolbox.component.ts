import { Component } from '@angular/core';
import { ElementService } from 'editor/src/app/services/element.service';
import { ClozeElement } from 'common/models/elements/compound-group-elements/cloze/cloze';
import { ImageElement } from 'common/models/elements/interactive-group-elements/image';
import { AudioElement } from 'common/models/elements/media-player-group-elements/audio';
import { VideoElement } from 'common/models/elements/media-player-group-elements/video';
import { TextFieldElement } from 'common/models/elements/text-input-group-elements/text-field';
import { TextAreaElement } from 'common/models/elements/text-input-group-elements/text-area';
import { SpellCorrectElement } from 'common/models/elements/text-input-group-elements/spell-correct';
import { MathFieldElement } from 'common/models/elements/text-input-group-elements/math-field';
import { MathTableElement } from 'common/models/elements/interactive-group-elements/math-table';
import { LikertElement } from 'common/models/elements/compound-group-elements/likert/likert';
import { DropdownElement } from 'common/models/elements/input-group-elements/dropdown';
import { CheckboxElement } from 'common/models/elements/input-group-elements/checkbox';
import { SliderElement } from 'common/models/elements/input-group-elements/slider';
import { HotspotImageElement } from 'common/models/elements/input-group-elements/hotspot-image';
import { DropListElement } from 'common/models/elements/input-group-elements/drop-list';
import { ButtonElement } from 'common/models/elements/action-group-elements/button';
import { FrameElement } from 'common/models/elements/base-group-elements/frame';
import { GeometryElement } from 'common/models/elements/external-app-group-elements/geometry';
import { TriggerElement } from 'common/models/elements/action-group-elements/trigger';
import { TextElement } from 'common/models/elements/text-group-elements/text';
import { MarkingPanelElement } from 'common/models/elements/interactive-group-elements/marking-panel';
import { DragNDropService } from 'editor/src/app/services/drag-n-drop.service';
import { TableElement } from 'common/models/elements/compound-group-elements/table/table';
import { TemplateService } from 'editor/modules/section-templates/services/template.service';
import { UIElementType } from 'common/models/ui-element-interfaces';
import { WidgetPeriodicTableElement } from 'common/models/elements/widget-group-elements/widget-periodic-table';
import {
  WidgetMoleculeEditorElement
} from 'common/models/elements/widget-group-elements/widget-molecule-editor';
import { SelectionService } from 'editor/src/app/services/selection.service';
import { UnitService } from 'editor/src/app/services/unit.service';

@Component({
  selector: 'aspect-ui-element-toolbox',
  templateUrl: './ui-element-toolbox.component.html',
  styleUrls: ['./ui-element-toolbox.component.scss'],
  standalone: false
})
export class UiElementToolboxComponent {
  hoverRadioButton: boolean = false;
  hoverFormulaButton: boolean = false;

  constructor(private selectionService: SelectionService,
              public unitService: UnitService,
              private templateService: TemplateService,
              private elementService: ElementService,
              protected dragNDropService: DragNDropService) { }

  addUIElement(elementType: UIElementType): void {
    this.elementService.addElementToSection(
      elementType,
      this.unitService.unit
        .pages[this.selectionService.selectedPageIndex].sections[this.selectionService.selectedSectionIndex]);
  }

  startDrag($event: DragEvent, elementType: string): void {
    this.dragNDropService.isDragInProgress = true;
    $event.dataTransfer?.setData('elementType', elementType);
  }

  endDrag(): void {
    this.dragNDropService.isDragInProgress = false;
  }

  applyTemplate(templateName: string) {
    this.templateService.applyTemplate(templateName);
  }

  protected readonly ClozeElement = ClozeElement;
  protected readonly ImageElement = ImageElement;
  protected readonly AudioElement = AudioElement;
  protected readonly VideoElement = VideoElement;
  protected readonly TextFieldElement = TextFieldElement;
  protected readonly TextAreaElement = TextAreaElement;
  protected readonly SpellCorrectElement = SpellCorrectElement;
  protected readonly MathFieldElement = MathFieldElement;
  protected readonly MathTableElement = MathTableElement;
  protected readonly LikertElement = LikertElement;
  protected readonly DropdownElement = DropdownElement;
  protected readonly CheckboxElement = CheckboxElement;
  protected readonly SliderElement = SliderElement;
  protected readonly HotspotImageElement = HotspotImageElement;
  protected readonly DropListElement = DropListElement;
  protected readonly ButtonElement = ButtonElement;
  protected readonly FrameElement = FrameElement;
  protected readonly GeometryElement = GeometryElement;
  protected readonly TriggerElement = TriggerElement;
  protected readonly TextElement = TextElement;
  protected readonly MarkingPanelElement = MarkingPanelElement;
  protected readonly TableElement = TableElement;
  protected readonly WidgetPeriodicTableElement = WidgetPeriodicTableElement;
  protected readonly WidgetMoleculeEditorElement = WidgetMoleculeEditorElement;
}

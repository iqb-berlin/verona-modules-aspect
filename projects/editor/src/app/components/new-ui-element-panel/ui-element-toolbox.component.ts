import { Component } from '@angular/core';
import { UIElementType } from 'common/models/elements/element';
import { UnitService } from '../../services/unit-services/unit.service';
import { SelectionService } from '../../services/selection.service';
import { ElementService } from 'editor/src/app/services/unit-services/element.service';
import { ClozeElement } from 'common/models/elements/compound-elements/cloze/cloze';
import { ImageElement } from 'common/models/elements/media-elements/image';
import { AudioElement } from 'common/models/elements/media-elements/audio';
import { VideoElement } from 'common/models/elements/media-elements/video';
import { TextFieldElement } from 'common/models/elements/input-elements/text-field';
import { TextAreaElement } from 'common/models/elements/input-elements/text-area';
import { SpellCorrectElement } from 'common/models/elements/input-elements/spell-correct';
import { MathFieldElement } from 'common/models/elements/input-elements/math-field';
import { MathTableElement } from 'common/models/elements/input-elements/math-table';
import { LikertElement } from 'common/models/elements/compound-elements/likert/likert';
import { DropdownElement } from 'common/models/elements/input-elements/dropdown';
import { CheckboxElement } from 'common/models/elements/input-elements/checkbox';
import { SliderElement } from 'common/models/elements/input-elements/slider';
import { HotspotImageElement } from 'common/models/elements/input-elements/hotspot-image';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { ButtonElement } from 'common/models/elements/button/button';
import { FrameElement } from 'common/models/elements/frame/frame';
import { GeometryElement } from 'common/models/elements/geometry/geometry';
import { TriggerElement } from 'common/models/elements/trigger/trigger';
import { TextElement } from 'common/models/elements/text/text';

@Component({
  selector: 'aspect-ui-element-toolbox',
  templateUrl: './ui-element-toolbox.component.html',
  styleUrls: ['./ui-element-toolbox.component.css']
})
export class UiElementToolboxComponent {
  hoverRadioButton: boolean = false;
  hoverFormulaButton: boolean = false;

  constructor(private selectionService: SelectionService,
              public unitService: UnitService,
              private elementService: ElementService) { }

  addUIElement(elementType: UIElementType): void {
    this.elementService.addElementToSection(
      elementType,
      this.unitService.unit.pages[this.selectionService.selectedPageIndex].sections[this.selectionService.selectedSectionIndex]);
  }

  applyTemplate(templateName: string) {
    this.unitService.applyTemplate(templateName);
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
}

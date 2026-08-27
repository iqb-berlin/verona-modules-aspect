import { ComponentRegistry } from 'common/utils/component-registry';
import { TextComponent } from 'common/components/elements/text/text.component';
import { ButtonComponent } from 'common/components/elements/button/button.component';
import { TextFieldComponent } from 'common/components/elements/text-field/text-field.component';
import {
  TextFieldSimpleComponent
} from 'common/components/elements/text-field-simple/text-field-simple.component';
import { TextAreaComponent } from 'common/components/elements/text-area/text-area.component';
import { CheckboxComponent } from 'common/components/elements/checkbox/checkbox.component';
import { DropdownComponent } from 'common/components/elements/dropdown/dropdown.component';
import {
  RadioButtonGroupComponent
} from 'common/components/elements/radio-button-group/radio-button-group.component';
import { ImageComponent } from 'common/components/elements/image/image.component';
import { AudioComponent } from 'common/components/elements/audio/audio.component';
import { VideoComponent } from 'common/components/elements/video/video.component';
import { LikertComponent } from 'common/components/elements/likert/likert.component';
import {
  LikertRadioButtonGroupComponent
} from 'common/components/likert-radio-button-group/likert-radio-button-group.component';
import {
  RadioGroupImagesComponent
} from 'common/components/elements/radio-group-images/radio-group-images.component';
import { DropListComponent } from 'common/components/elements/drop-list/drop-list.component';
import { ClozeComponent } from 'common/components/elements/cloze/cloze.component';
import { TableComponent } from 'common/components/elements/table/table.component';
import { HotspotImageComponent } from 'common/components/elements/hotspot-image/hotspot-image.component';
import { SliderComponent } from 'common/components/elements/slider/slider.component';
import {
  SpellCorrectComponent
} from 'common/components/elements/spell-correct/spell-correct.component';
import { FrameComponent } from 'common/components/elements/frame/frame.component';
import {
  ToggleButtonComponent
} from 'common/components/elements/toggle-button/toggle-button.component';
import { GeometryComponent } from 'common/components/elements/geometry/geometry.component';
import { MathFieldComponent } from 'common/components/elements/math-field/math-field.component';
import { MathTableComponent } from 'common/components/elements/math-table/math-table.component';
import {
  TextAreaMathComponent
} from 'common/components/elements/text-area-math/text-area-math.component';
import { TriggerComponent } from 'common/components/elements/trigger/trigger.component';
import {
  WidgetMoleculeEditorComponent
} from 'common/components/elements/widget-molecule-editor/widget-molecule-editor.component';
import {
  WidgetPeriodicTableComponent
} from 'common/components/elements/widget-periodic-table/widget-periodic-table.component';

/**
 * Registers the component that draws each element type, which is what lets a renderer go from a stored
 * `type` to a component without knowing any of them.
 *
 * Called from the `SharedModule` constructor, so both applications get it by importing that module; the
 * unit tests call it from their `vitest-providers.ts` because they build components without it.
 * Registering twice is harmless: each type is simply written again.
 *
 * Not quite every type: `marking-panel` is missing here and is registered by the two `AppModule`s
 * themselves, which is why a test bed that only calls this function has no component for it.
 */
export function registerComponents(): void {
  ComponentRegistry.registerComponents({
    text: TextComponent,
    button: ButtonComponent,
    'text-field': TextFieldComponent,
    'text-field-simple': TextFieldSimpleComponent,
    'text-area': TextAreaComponent,
    checkbox: CheckboxComponent,
    dropdown: DropdownComponent,
    radio: RadioButtonGroupComponent,
    image: ImageComponent,
    audio: AudioComponent,
    video: VideoComponent,
    likert: LikertComponent,
    'likert-row': LikertRadioButtonGroupComponent,
    'radio-group-images': RadioGroupImagesComponent,
    'drop-list': DropListComponent,
    cloze: ClozeComponent,
    table: TableComponent,
    'hotspot-image': HotspotImageComponent,
    slider: SliderComponent,
    'spell-correct': SpellCorrectComponent,
    frame: FrameComponent,
    'toggle-button': ToggleButtonComponent,
    geometry: GeometryComponent,
    'math-field': MathFieldComponent,
    'math-table': MathTableComponent,
    'text-area-math': TextAreaMathComponent,
    trigger: TriggerComponent,
    'widget-molecule-editor': WidgetMoleculeEditorComponent,
    'widget-periodic-table': WidgetPeriodicTableComponent
  });
}

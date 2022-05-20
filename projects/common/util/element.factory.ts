import {
  BasicStyles, PlayerProperties, PositionProperties, TextImageLabel,
  UIElement, UIElementValue
} from 'common/models/elements/element';
import { TextElement } from 'common/models/elements/text/text';
import { ButtonElement } from 'common/models/elements/button/button';
import { TextFieldElement } from 'common/models/elements/input-elements/text-field';
import { TextFieldSimpleElement } from
  'common/models/elements/compound-elements/cloze/cloze-child-elements/text-field-simple';
import { CheckboxElement } from 'common/models/elements/input-elements/checkbox';
import { TextAreaElement } from 'common/models/elements/input-elements/text-area';
import { DropdownElement } from 'common/models/elements/input-elements/dropdown';
import { RadioButtonGroupElement } from 'common/models/elements/input-elements/radio-button-group';
import { VideoElement } from 'common/models/elements/media-elements/video';
import { ImageElement } from 'common/models/elements/media-elements/image';
import { AudioElement } from 'common/models/elements/media-elements/audio';
import { LikertElement } from 'common/models/elements/compound-elements/likert/likert';
import { RadioButtonGroupComplexElement } from 'common/models/elements/input-elements/radio-button-group-complex';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { DropListSimpleElement } from
  'common/models/elements/compound-elements/cloze/cloze-child-elements/drop-list-simple';
import { ClozeElement } from 'common/models/elements/compound-elements/cloze/cloze';
import { SliderElement } from 'common/models/elements/input-elements/slider';
import { SpellCorrectElement } from 'common/models/elements/input-elements/spell-correct';
import { FrameElement } from 'common/models/elements/frame/frame';
import { ToggleButtonElement } from 'common/models/elements/compound-elements/cloze/cloze-child-elements/toggle-button';

export abstract class ElementFactory {
  static createElement(elementType: string, defaultValues: Partial<UIElement> = {}): UIElement {
    switch (elementType) {
      case 'text':
        return new TextElement({ type: elementType, ...defaultValues } as TextElement);
      case 'button':
        return new ButtonElement({ type: elementType, ...defaultValues } as ButtonElement);
      case 'text-field':
        return new TextFieldElement({ type: elementType, ...defaultValues } as TextFieldElement);
      case 'text-field-simple':
        return new TextFieldSimpleElement({ type: elementType, ...defaultValues } as TextFieldSimpleElement);
      case 'text-area':
        return new TextAreaElement({ type: elementType, ...defaultValues } as TextAreaElement);
      case 'checkbox':
        return new CheckboxElement({ type: elementType, ...defaultValues } as CheckboxElement);
      case 'dropdown':
        return new DropdownElement({ type: elementType, ...defaultValues } as DropdownElement);
      case 'radio':
        return new RadioButtonGroupElement({ type: elementType, ...defaultValues } as RadioButtonGroupElement);
      case 'image':
        return new ImageElement({ type: elementType, ...defaultValues } as ImageElement);
      case 'audio':
        return new AudioElement({ type: elementType, ...defaultValues } as AudioElement);
      case 'video':
        return new VideoElement({ type: elementType, ...defaultValues } as VideoElement);
      case 'likert':
        return new LikertElement({ type: elementType, ...defaultValues } as LikertElement);
      case 'radio-group-images':
        return new RadioButtonGroupComplexElement({
          type: elementType, ...defaultValues } as RadioButtonGroupComplexElement);
      case 'drop-list':
        return new DropListElement({ type: elementType, ...defaultValues } as DropListElement);
      case 'drop-list-simple':
        return new DropListSimpleElement({ type: elementType, ...defaultValues } as DropListSimpleElement);
      case 'cloze':
        return new ClozeElement({ type: elementType, ...defaultValues } as ClozeElement);
      case 'slider':
        return new SliderElement({ type: elementType, ...defaultValues } as SliderElement);
      case 'spell-correct':
        return new SpellCorrectElement({ type: elementType, ...defaultValues } as SpellCorrectElement);
      case 'frame':
        return new FrameElement({ type: elementType, ...defaultValues } as FrameElement);
      case 'toggle-button':
        return new ToggleButtonElement({ type: elementType, ...defaultValues } as ToggleButtonElement);
      default:
        throw new Error(`ElementType ${elementType} not found!`);
    }
  }

  static initPositionProps(defaults: Record<string, UIElementValue> = {}): PositionProperties {
    return {
      fixedSize: defaults.fixedSize !== undefined ? defaults.fixedSize as boolean : false,
      dynamicPositioning: defaults.dynamicPositioning !== undefined ? defaults.dynamicPositioning as boolean : true,
      xPosition: defaults.xPosition !== undefined ? defaults.xPosition as number : 0,
      yPosition: defaults.yPosition !== undefined ? defaults.yPosition as number : 0,
      useMinHeight: defaults.useMinHeight !== undefined ? defaults.useMinHeight as boolean : false,
      gridColumn: defaults.gridColumn !== undefined ? defaults.gridColumn as number : null,
      gridColumnRange: defaults.gridColumnRange !== undefined ? defaults.gridColumnRange as number : 1,
      gridRow: defaults.gridRow !== undefined ? defaults.gridRow as number : null,
      gridRowRange: defaults.gridRowRange !== undefined ? defaults.gridRowRange as number : 1,
      marginLeft: defaults.marginLeft !== undefined ? defaults.marginLeft as number : 0,
      marginRight: defaults.marginRight !== undefined ? defaults.marginRight as number : 0,
      marginTop: defaults.marginTop !== undefined ? defaults.marginTop as number : 0,
      marginBottom: defaults.marginBottom !== undefined ? defaults.marginBottom as number : 0,
      zIndex: defaults.zIndex !== undefined ? defaults.zIndex as number : 0
    };
  }

  static initStylingProps<T>(defaults?: Partial<BasicStyles> & T): BasicStyles & T {
    return {
      ...defaults as T,
      fontColor: defaults?.fontColor !== undefined ? defaults.fontColor as string : '#000000',
      font: defaults?.font !== undefined ? defaults.font as string : 'Roboto',
      fontSize: defaults?.fontSize !== undefined ? defaults.fontSize as number : 20,
      bold: defaults?.bold !== undefined ? defaults.bold as boolean : false,
      italic: defaults?.italic !== undefined ? defaults.italic as boolean : false,
      underline: defaults?.underline !== undefined ? defaults.underline as boolean : false,
      backgroundColor: defaults?.backgroundColor !== undefined ? defaults.backgroundColor as string : '#d3d3d3'
    };
  }

  static initTextImageLabel(): TextImageLabel {
    return {
      text: '',
      imgSrc: null,
      position: 'above'
    };
  }

  static initPlayerProps(defaults: Record<string, UIElementValue> = {}): PlayerProperties {
    return {
      autostart: defaults.autostart !== undefined ? defaults.autostart as boolean : false,
      autostartDelay: defaults.autostartDelay !== undefined ? defaults.autostartDelay as number : 0,
      loop: defaults.loop !== undefined ? defaults.loop as boolean : false,
      startControl: defaults.startControl !== undefined ? defaults.startControl as boolean : true,
      pauseControl: defaults.pauseControl !== undefined ? defaults.pauseControl as boolean : false,
      progressBar: defaults.progressBar !== undefined ? defaults.progressBar as boolean : true,
      interactiveProgressbar: defaults.interactiveProgressbar !== undefined ?
        defaults.interactiveProgressbar as boolean :
        false,
      volumeControl: defaults.volumeControl !== undefined ? defaults.volumeControl as boolean : true,
      defaultVolume: defaults.defaultVolume !== undefined ? defaults.defaultVolume as number : 0.8,
      minVolume: defaults.minVolume !== undefined ? defaults.minVolume as number : 0,
      muteControl: defaults.muteControl !== undefined ? defaults.muteControl as boolean : true,
      interactiveMuteControl: defaults.interactiveMuteControl !== undefined ?
        defaults.interactiveMuteControl as boolean :
        false,
      hintLabel: defaults.hintLabel !== undefined ? defaults.hintLabel as string : '',
      hintLabelDelay: defaults.hintLabelDelay !== undefined ? defaults.hintLabelDelay as number : 0,
      activeAfterID: defaults.activeAfterID !== undefined ? defaults.activeAfterID as string : '',
      minRuns: defaults.minRuns !== undefined ? defaults.minRuns as number : 1,
      maxRuns: defaults.maxRuns !== undefined ? defaults.maxRuns as number | null : null,
      showRestRuns: defaults.showRestRuns !== undefined ? defaults.showRestRuns as boolean : false,
      showRestTime: defaults.showRestTime !== undefined ? defaults.showRestTime as boolean : true,
      playbackTime: defaults.playbackTime !== undefined ? defaults.playbackTime as number : 0
    };
  }
}

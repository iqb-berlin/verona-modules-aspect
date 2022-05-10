import { ComponentFactory, ComponentFactoryResolver } from '@angular/core';
import { TextComponent } from '../ui-elements/text/text.component';
import { ButtonComponent } from '../ui-elements/button/button.component';
import { TextFieldComponent } from '../ui-elements/text-field/text-field.component';
import { TextAreaComponent } from '../ui-elements/text-area/text-area.component';
import { CheckboxComponent } from '../ui-elements/checkbox/checkbox.component';
import { DropdownComponent } from '../ui-elements/dropdown/dropdown.component';
import { RadioButtonGroupComponent } from '../ui-elements/radio/radio-button-group.component';
import { ImageComponent } from '../ui-elements/image/image.component';
import { AudioComponent } from '../ui-elements/audio/audio.component';
import { VideoComponent } from '../ui-elements/video/video.component';
import { LikertComponent } from '../ui-elements/likert/likert.component';
import { RadioGroupImagesComponent } from '../ui-elements/radio-complex/radio-group-images.component';
import { DropListComponent } from '../ui-elements/drop-list/drop-list.component';
import { ClozeComponent } from '../ui-elements/cloze/cloze.component';
import { SliderComponent } from '../ui-elements/slider/slider.component';
import { SpellCorrectComponent } from '../ui-elements/spell-correct/spell-correct.component';
import { FrameComponent } from '../ui-elements/frame/frame.component';
import { ElementComponent } from '../directives/element-component.directive';
import {
  BasicStyles, ExtendedStyles, PlayerProperties, PositionProperties,
  UIElement
} from 'common/classes/element';
import {
  TextImageLabel,
  UIElementValue
} from 'common/interfaces/elements';
import { TextElement } from 'common/ui-elements/text/text';
import { ButtonElement } from 'common/ui-elements/button/button';
import { TextFieldElement } from 'common/ui-elements/text-field/text-field';
import { TextFieldSimpleElement } from 'common/ui-elements/cloze/text-field-simple';
import { CheckboxElement } from 'common/ui-elements/checkbox/checkbox';
import { TextAreaElement } from 'common/ui-elements/text-area/text-area';
import { DropdownElement } from 'common/ui-elements/dropdown/dropdown';
import { RadioButtonGroupElement } from 'common/ui-elements/radio/radio-button-group';
import { VideoElement } from 'common/ui-elements/video/video';
import { ImageElement } from 'common/ui-elements/image/image';
import { AudioElement } from 'common/ui-elements/audio/audio';
import { LikertElement } from 'common/ui-elements/likert/likert';
import { RadioButtonGroupComplexElement } from 'common/ui-elements/radio-complex/radio-button-group-complex';
import { DropListElement } from 'common/ui-elements/drop-list/drop-list';
import { DropListSimpleElement } from 'common/ui-elements/cloze/drop-list-simple';
import { ClozeElement } from 'common/ui-elements/cloze/cloze';
import { SliderElement } from 'common/ui-elements/slider/slider';
import { SpellCorrectElement } from 'common/ui-elements/spell-correct/spell-correct';
import { FrameElement } from 'common/ui-elements/frame/frame';
import { ToggleButtonElement } from 'common/ui-elements/cloze/toggle-button';

export abstract class ElementFactory {
  // static createElement(element: Partial<UIElement>): UIElement {
  static createElement(elementType: string, defaultValues: Partial<UIElement> = {}): UIElement {
    console.log('createElement', elementType, defaultValues);
    switch (elementType) {
      case 'text':
        return new TextElement(defaultValues as TextElement);
      case 'button':
        return new ButtonElement(defaultValues as ButtonElement);
      case 'text-field':
        return new TextFieldElement(defaultValues as TextFieldElement);
      case 'text-field-simple':
        return new TextFieldSimpleElement(defaultValues as TextFieldSimpleElement);
      case 'text-area':
        return new TextAreaElement(defaultValues as TextAreaElement);
      case 'checkbox':
        return new CheckboxElement(defaultValues as CheckboxElement);
      case 'dropdown':
        return new DropdownElement(defaultValues as DropdownElement);
      case 'radio':
        return new RadioButtonGroupElement(defaultValues as RadioButtonGroupElement);
      case 'image':
        return new ImageElement(defaultValues as ImageElement);
      case 'audio':
        return new AudioElement(defaultValues as AudioElement);
      case 'video':
        return new VideoElement(defaultValues as VideoElement);
      case 'likert':
        return new LikertElement(defaultValues as LikertElement);
      case 'radio-group-images':
        return new RadioButtonGroupComplexElement(defaultValues as RadioButtonGroupComplexElement);
      case 'drop-list':
        return new DropListElement(defaultValues as DropListElement);
      case 'drop-list-simple':
        return new DropListSimpleElement(defaultValues as DropListSimpleElement);
      case 'cloze':
        return new ClozeElement(defaultValues as ClozeElement);
      case 'slider':
        return new SliderElement(defaultValues as SliderElement);
      case 'spell-correct':
        return new SpellCorrectElement(defaultValues as SpellCorrectElement);
      case 'frame':
        return new FrameElement(defaultValues as FrameElement);
      case 'toggle-button':
        return new ToggleButtonElement(defaultValues as ToggleButtonElement);
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

  // static initStylingProps(defaults?: BasicStyles & ExtendedStyles): BasicStyles {
  static initStylingProps(defaults?: any): BasicStyles {
    return {
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
        false, // TODO default?
      volumeControl: defaults.volumeControl !== undefined ? defaults.volumeControl as boolean : true,
      defaultVolume: defaults.defaultVolume !== undefined ? defaults.defaultVolume as number : 0.8,
      minVolume: defaults.minVolume !== undefined ? defaults.minVolume as number : 0,
      muteControl: defaults.muteControl !== undefined ? defaults.muteControl as boolean : true,
      interactiveMuteControl: defaults.interactiveMuteControl !== undefined ?
        defaults.interactiveMuteControl as boolean :
        false, // TODO default?
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

  static getComponentFactory( // TODO weg hier
    elementType: string, componentFactoryResolver: ComponentFactoryResolver
  ): ComponentFactory<ElementComponent> {
    switch (elementType) {
      case 'text':
        return componentFactoryResolver.resolveComponentFactory(TextComponent);
      case 'button':
        return componentFactoryResolver.resolveComponentFactory(ButtonComponent);
      case 'text-field':
        return componentFactoryResolver.resolveComponentFactory(TextFieldComponent);
      case 'text-area':
        return componentFactoryResolver.resolveComponentFactory(TextAreaComponent);
      case 'checkbox':
        return componentFactoryResolver.resolveComponentFactory(CheckboxComponent);
      case 'dropdown':
        return componentFactoryResolver.resolveComponentFactory(DropdownComponent);
      case 'radio':
        return componentFactoryResolver.resolveComponentFactory(RadioButtonGroupComponent);
      case 'image':
        return componentFactoryResolver.resolveComponentFactory(ImageComponent);
      case 'audio':
        return componentFactoryResolver.resolveComponentFactory(AudioComponent);
      case 'video':
        return componentFactoryResolver.resolveComponentFactory(VideoComponent);
      case 'likert':
        return componentFactoryResolver.resolveComponentFactory(LikertComponent);
      case 'radio-group-images':
        return componentFactoryResolver.resolveComponentFactory(RadioGroupImagesComponent);
      case 'drop-list':
        return componentFactoryResolver.resolveComponentFactory(DropListComponent);
      case 'cloze':
        return componentFactoryResolver.resolveComponentFactory(ClozeComponent);
      case 'slider':
        return componentFactoryResolver.resolveComponentFactory(SliderComponent);
      case 'spell-correct':
        return componentFactoryResolver.resolveComponentFactory(SpellCorrectComponent);
      case 'frame':
        return componentFactoryResolver.resolveComponentFactory(FrameComponent);
      default:
        throw new Error('unknown element: ' + elementType);
    }
  }
}

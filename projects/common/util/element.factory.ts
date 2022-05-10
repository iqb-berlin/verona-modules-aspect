import { ComponentFactory, ComponentFactoryResolver } from '@angular/core';
import { TextComponent } from '../components/ui-elements/text.component';
import { ButtonComponent } from '../components/ui-elements/button.component';
import { TextFieldComponent } from '../components/ui-elements/text-field.component';
import { TextAreaComponent } from '../components/ui-elements/text-area.component';
import { CheckboxComponent } from '../components/ui-elements/checkbox.component';
import { DropdownComponent } from '../components/ui-elements/dropdown.component';
import { RadioButtonGroupComponent } from '../components/ui-elements/radio-button-group.component';
import { ImageComponent } from '../components/ui-elements/image.component';
import { AudioComponent } from '../components/ui-elements/audio.component';
import { VideoComponent } from '../components/ui-elements/video.component';
import { LikertComponent } from '../components/ui-elements/likert.component';
import { RadioGroupImagesComponent } from '../components/ui-elements/radio-group-images.component';
import { DropListComponent } from '../components/ui-elements/drop-list.component';
import { ClozeComponent } from '../components/ui-elements/cloze.component';
import { SliderComponent } from '../components/ui-elements/slider.component';
import { SpellCorrectComponent } from '../components/ui-elements/spell-correct.component';
import { FrameComponent } from '../components/ui-elements/frame.component';
import { ElementComponent } from '../directives/element-component.directive';
import {
  AudioElement,
  ButtonElement,
  CheckboxElement, ClozeElement,
  DropdownElement, DropListElement, DropListSimpleElement, FrameElement,
  ImageElement,
  LikertElement, RadioButtonGroupComplexElement,
  RadioButtonGroupElement, SliderElement, SpellCorrectElement,
  TextAreaElement,
  TextElement,
  TextFieldElement,
  TextFieldSimpleElement, ToggleButtonElement,
  UIElement,
  VideoElement
} from 'common/classes/element';
import {
  BasicStyles,
  PlayerProperties,
  PositionProperties,
  TextImageLabel,
  UIElementValue
} from 'common/interfaces/elements';

export abstract class ElementFactory {
  static createElement(element: Partial<UIElement>): UIElement {
    switch (element.type) {
      case 'text':
        return new TextElement(element as TextElement);
      case 'button':
        return new ButtonElement(element as ButtonElement);
      case 'text-field':
        return new TextFieldElement(element as TextFieldElement);
      case 'text-field-simple':
        return new TextFieldSimpleElement(element as TextFieldSimpleElement);
      case 'text-area':
        return new TextAreaElement(element as TextAreaElement);
      case 'checkbox':
        return new CheckboxElement(element as CheckboxElement);
      case 'dropdown':
        return new DropdownElement(element as DropdownElement);
      case 'radio':
        return new RadioButtonGroupElement(element as RadioButtonGroupElement);
      case 'image':
        return new ImageElement(element as ImageElement);
      case 'audio':
        return new AudioElement(element as AudioElement);
      case 'video':
        return new VideoElement(element as VideoElement);
      case 'likert':
        return new LikertElement(element as LikertElement);
      case 'radio-group-images':
        return new RadioButtonGroupComplexElement(element as RadioButtonGroupComplexElement);
      case 'drop-list':
        return new DropListElement(element as DropListElement);
      case 'drop-list-simple':
        return new DropListSimpleElement(element as DropListSimpleElement);
      case 'cloze':
        return new ClozeElement(element as ClozeElement);
      case 'slider':
        return new SliderElement(element as SliderElement);
      case 'spell-correct':
        return new SpellCorrectElement(element as SpellCorrectElement);
      case 'frame':
        return new FrameElement(element as FrameElement);
      case 'toggle-button':
        return new ToggleButtonElement(element as ToggleButtonElement);
      default:
        throw new Error(`ElementType ${element.type} not found!`);
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

  static initStylingProps(defaults?: Record<string, UIElementValue>): BasicStyles {
    if (!defaults) return {} as BasicStyles;
    return {
      fontColor: defaults.fontColor !== undefined ? defaults.fontColor as string : '#000000',
      font: defaults.font !== undefined ? defaults.font as string : 'Roboto',
      fontSize: defaults.fontSize !== undefined ? defaults.fontSize as number : 20,
      bold: defaults.bold !== undefined ? defaults.bold as boolean : false,
      italic: defaults.italic !== undefined ? defaults.italic as boolean : false,
      underline: defaults.underline !== undefined ? defaults.underline as boolean : false,
      backgroundColor: defaults.backgroundColor !== undefined ? defaults.backgroundColor as string : '#d3d3d3'
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
        throw new Error('unknown element');
    }
  }
}

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
  AudioElement, BasicStyles,
  ButtonElement,
  CheckboxElement,
  ClozeElement,
  DropdownElement,
  DropListElement,
  DropListSimpleElement,
  FrameElement,
  ImageElement,
  InputElement, LikertElement, LikertRowElement, PlayerProperties, PositionProperties,
  RadioButtonGroupComplexElement,
  RadioButtonGroupElement, SliderElement, SpellCorrectElement,
  TextAreaElement,
  TextElement,
  TextFieldElement, TextFieldSimpleElement, ToggleButtonElement,
  UIElement, UIElementType,
  VideoElement
} from '../interfaces/elements';

export abstract class ElementFactory {
  static createElement(elementType: string, defaults?: Record<string, any>): UIElement {
    switch (elementType) {
      case 'text':
        return ElementFactory.createTextElement(defaults);
      case 'button':
        return ElementFactory.createButtonElement(defaults);
      case 'text-field':
        return ElementFactory.createTextFieldElement(defaults);
      case 'text-field-simple':
        return ElementFactory.createTextFieldSimpleElement(defaults);
      case 'text-area':
        return ElementFactory.createTextAreaElement(defaults);
      case 'checkbox':
        return ElementFactory.createCheckboxElement(defaults);
      case 'dropdown':
        return ElementFactory.createDropdownElement(defaults);
      case 'radio':
        return ElementFactory.createRadioButtonGroupElement(defaults);
      case 'image':
        return ElementFactory.createImageElement(defaults);
      case 'audio':
        return ElementFactory.createAudioElement(defaults);
      case 'video':
        return ElementFactory.createVideoElement(defaults);
      case 'likert':
        return ElementFactory.createLikertElement(defaults);
      case 'radio-group-images':
        return ElementFactory.createRadioButtonGroupComplexElement(defaults);
      case 'drop-list':
        return ElementFactory.createDropListElement(defaults);
      case 'cloze':
        return ElementFactory.createClozeElement(defaults);
      case 'slider':
        return ElementFactory.createSliderElement(defaults);
      case 'spell-correct':
        return ElementFactory.createSpellCorrectElement(defaults);
      case 'frame':
        return ElementFactory.createFrameElement(defaults);
      case 'toggle-button':
        return ElementFactory.createToggleButtonElement(defaults);
      default:
        throw new Error(`ElementType ${elementType} not found!`);
    }
  }

  static initElement(elementType: string, defaults: Record<string, number>): UIElement {
    return {
      type: elementType as UIElementType,
      id: String(defaults.id) || 'id_placeholder',
      width: defaults.width || 190,
      height: defaults.height || 60,
      styles: {}
    };
  }

  static initInputElement(elementType: string, defaults: Record<string, any>): InputElement {
    return {
      ...ElementFactory.initElement(elementType, defaults),
      label: defaults.label || 'Beispielbeschriftung',
      value: defaults.value || null,
      required: defaults.required || false,
      requiredWarnMessage: defaults.requiredWarnMessage || 'Eingabe erforderlich',
      readOnly: defaults.readOnly || false
    };
  }

  static initPositionProps(defaults: Record<string, any> = {}): PositionProperties {
    return {
      fixedSize: defaults.fixedSize || false,
      dynamicPositioning: defaults.dynamicPositioning || false,
      xPosition: defaults.xPosition || 0,
      yPosition: defaults.yPosition || 0,
      useMinHeight: defaults.useMinHeight || false,
      gridColumnStart: defaults.gridColumnStart || 1,
      gridColumnEnd: defaults.gridColumnEnd || 2,
      gridRowStart: defaults.gridRowStart || 1,
      gridRowEnd: defaults.gridRowEnd || 2,
      marginLeft: defaults.marginLeft || 0,
      marginRight: defaults.marginRight || 0,
      marginTop: defaults.marginTop || 0,
      marginBottom: defaults.marginBottom || 0,
      zIndex: defaults.zIndex || 0
    };
  }

  static initBasicStyles(defaults: Record<string, any>): BasicStyles {
    return {
      fontColor: defaults.fontColor || '#000000',
      font: defaults.font || 'Roboto',
      fontSize: defaults.fontSize || 20,
      bold: defaults.bold || false,
      italic: defaults.italic || false,
      underline: defaults.underline || false,
      backgroundColor: defaults.backgroundColor || '#d3d3d3'
    };
  }

  static initPlayerProps(defaults: Record<string, any> = {}): PlayerProperties {
    return {
      autostart: defaults.autostart || false,
      autostartDelay: defaults.autostartDelay || 0,
      loop: defaults.loop || false,
      startControl: defaults.startControl || true,
      pauseControl: defaults.pauseControl || false,
      progressBar: defaults.progressBar || true,
      interactiveProgressbar: defaults.interactiveProgressbar || undefined,
      volumeControl: defaults.volumeControl || true,
      defaultVolume: defaults.defaultVolume || 8,
      minVolume: defaults.minVolume || 0,
      muteControl: defaults.muteControl || true,
      interactiveMuteControl: defaults.interactiveMuteControl || undefined,
      hintLabel: defaults.hintLabel || '',
      hintLabelDelay: defaults.hintLabelDelay || 0,
      activeAfterID: defaults.activeAfterID || '',
      minRuns: defaults.minRuns || 1,
      maxRuns: defaults.maxRuns || null,
      showRestRuns: defaults.showRestRuns || false,
      showRestTime: defaults.showRestTime || true,
      playbackTime: defaults.playbackTime || 0
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

  private static createButtonElement(defaults: Record<string, any> = {}): ButtonElement {
    return {
      ...ElementFactory.initElement('button', defaults),
      type: 'button',
      label: 'Knopf',
      imageSrc: null,
      action: null,
      positionProps: ElementFactory.initPositionProps(defaults.positionProps),
      styles: {
        ...ElementFactory.initBasicStyles(defaults),
        borderRadius: 0
      }
    };
  }

  private static createCheckboxElement(defaults: Record<string, any> = {}): CheckboxElement {
    return {
      ...ElementFactory.initInputElement('checkbox', { width: 215, ...defaults }),
      type: 'checkbox',
      value: false,
      positionProps: ElementFactory.initPositionProps(defaults),
      styles: ElementFactory.initBasicStyles(defaults)
    };
  }

  private static createClozeElement(defaults: Record<string, any> = {}): ClozeElement {
    return {
      ...ElementFactory.initElement('cloze', { width: 450, height: 200, ...defaults }),
      type: 'cloze',
      document: { type: 'doc', content: [] },
      positionProps: ElementFactory.initPositionProps(defaults),
      styles: {
        ...ElementFactory.initBasicStyles(defaults),
        lineHeight: 135
      }
    };
  }

  private static createDropdownElement(defaults: Record<string, any> = {}): DropdownElement {
    return {
      ...ElementFactory.initInputElement('dropdown', { width: 240, height: 83, ...defaults }),
      type: 'dropdown',
      options: [],
      allowUnset: false,
      positionProps: ElementFactory.initPositionProps(defaults),
      styles: ElementFactory.initBasicStyles(defaults)
    };
  }

  private static createDropListElement(defaults: Record<string, any> = {}): DropListElement {
    return {
      ...ElementFactory.initInputElement('drop-list', { height: 100, ...defaults }),
      type: 'drop-list',
      value: [],
      onlyOneItem: false,
      connectedTo: [],
      orientation: 'vertical',
      highlightReceivingDropList: false,
      highlightReceivingDropListColor: '#006064',
      positionProps: ElementFactory.initPositionProps({ useMinHeight: true, ...defaults }),
      styles: {
        ...ElementFactory.initBasicStyles({ backgroundColor: '#f4f4f2', ...defaults }),
        itemBackgroundColor: '#c9e0e0'
      }
    };
  }

  private static createDropListSimpleElement(defaults: Record<string, any> = {}): DropListSimpleElement {
    return {
      ...ElementFactory.initInputElement('drop-list-simple', { height: 100, ...defaults }),
      type: 'drop-list',
      value: [],
      connectedTo: [],
      highlightReceivingDropList: false,
      highlightReceivingDropListColor: '#add8e6',
      styles: {
        ...ElementFactory.initBasicStyles({ backgroundColor: '#eeeeec', ...defaults }),
        itemBackgroundColor: '#add8e6'
      }
    };
  }

  private static createFrameElement(defaults: Record<string, any> = {}): FrameElement {
    return {
      ...ElementFactory.initElement('frame', {}),
      type: 'frame',
      positionProps: ElementFactory.initPositionProps({ zIndex: -1, ...defaults }),
      styles: {
        ...ElementFactory.initBasicStyles({ backgroundColor: 'transparent', ...defaults }),
        borderWidth: 1,
        borderColor: 'black',
        borderStyle: 'solid',
        borderRadius: 0
      }
    };
  }

  private static createImageElement(defaults: Record<string, any> = {}): ImageElement {
    return {
      ...ElementFactory.initElement('image', { height: 100, ...defaults }),
      type: 'image',
      src: '', // TODO eigentlich undefined
      scale: false,
      magnifier: false,
      magnifierSize: 100,
      magnifierZoom: 1.5,
      magnifierUsed: false,
      positionProps: ElementFactory.initPositionProps({})
    };
  }

  private static createLikertElement(defaults: Record<string, any> = {}): LikertElement {
    return {
      ...ElementFactory.initElement('likert', { width: 250, height: 200, ...defaults }),
      type: 'likert',
      rows: [],
      columns: [],
      firstColumnSizeRatio: 5,
      readOnly: false,
      positionProps: ElementFactory.initPositionProps({ marginBottom: 30, ...defaults }),
      styles: {
        ...ElementFactory.initBasicStyles({ backgroundColor: 'transparent', ...defaults }),
        lineHeight: 135,
        lineColoring: true,
        lineColoringColor: '#c9e0e0'
      }
    };
  }

  static createLikertRowElement(defaults: Record<string, any>): LikertRowElement {
    return {
      ...ElementFactory.initInputElement('likert_row', defaults),
      type: 'likert-row',
      text: defaults.text || '',
      columnCount: defaults.columnCount || 0,
      firstColumnSizeRatio: defaults.firstColumnSizeRatio || 5
    };
  }

  private static createRadioButtonGroupElement(defaults: Record<string, any> = {}): RadioButtonGroupElement {
    return {
      ...ElementFactory.initInputElement('radio', { height: 85, ...defaults }),
      type: 'radio',
      options: [],
      alignment: 'column',
      strikeOtherOptions: false,
      positionProps: ElementFactory.initPositionProps({ marginBottom: 30, ...defaults }),
      styles: ElementFactory.initBasicStyles({ backgroundColor: 'transparent', ...defaults })
    };
  }

  private static createRadioButtonGroupComplexElement(defaults: Record<string, any> = {}): RadioButtonGroupComplexElement {
    return {
      ...ElementFactory.initInputElement('radio-group-images', { height: 100, ...defaults }), // TODO better name
      type: 'radio-group-images',
      columns: [],
      positionProps: ElementFactory.initPositionProps(defaults),
      styles: ElementFactory.initBasicStyles({ backgroundColor: 'transparent', ...defaults })
    };
  }

  private static createSliderElement(defaults: Record<string, any> = {}): SliderElement {
    return {
      ...ElementFactory.initElement('slider', { width: 300, height: 75, ...defaults }),
      type: 'slider',
      minValue: 0,
      maxValue: 100,
      showValues: true,
      barStyle: false,
      thumbLabel: false,
      positionProps: ElementFactory.initPositionProps(defaults),
      styles: ElementFactory.initBasicStyles({ backgroundColor: 'transparent', ...defaults })
    };
  }

  private static createSpellCorrectElement(defaults: Record<string, any> = {}): SpellCorrectElement {
    return {
      ...ElementFactory.initInputElement('spell-correct', { width: 230, height: 80, ...defaults }),
      type: 'spell-correct',
      positionProps: ElementFactory.initPositionProps(defaults),
      styles: ElementFactory.initBasicStyles({ backgroundColor: 'transparent', ...defaults })
    };
  }

  private static createTextElement(defaults: Record<string, any> = {}): TextElement {
    return {
      ...ElementFactory.initElement('text', { height: 98, ...defaults }),
      type: 'text',
      text: 'Lorem ipsum dolor sit amet',
      highlightableOrange: false,
      highlightableTurquoise: false,
      highlightableYellow: false,
      positionProps: ElementFactory.initPositionProps(defaults),
      styles: {
        ...ElementFactory.initBasicStyles({ backgroundColor: 'transparent', ...defaults }),
        lineHeight: 135
      }
    };
  }

  private static createTextAreaElement(defaults: Record<string, any> = {}): TextAreaElement {
    return {
      ...ElementFactory.initInputElement('text-area', { width: 230, height: 132, ...defaults }),
      type: 'text-area',
      appearance: 'outline',
      resizeEnabled: false,
      rowCount: 3,
      inputAssistancePreset: 'none',
      inputAssistancePosition: 'floating',
      positionProps: ElementFactory.initPositionProps(defaults),
      styles: {
        ...ElementFactory.initBasicStyles({ backgroundColor: 'transparent', ...defaults }),
        lineHeight: 135
      }
    };
  }

  private static createTextFieldElement(defaults: Record<string, any> = {}): TextFieldElement {
    return {
      ...ElementFactory.initInputElement('text-field', { width: 230, height: 100, ...defaults }),
      type: 'text-field',
      appearance: 'outline',
      minLength: 0,
      minLengthWarnMessage: 'Eingabe zu kurz',
      maxLength: 0,
      maxLengthWarnMessage: 'Eingabe zu lang',
      pattern: '',
      patternWarnMessage: 'Eingabe entspricht nicht der Vorgabe',
      inputAssistancePreset: 'none',
      inputAssistancePosition: 'floating',
      clearable: false,
      positionProps: ElementFactory.initPositionProps(defaults),
      styles: ElementFactory.initBasicStyles({ backgroundColor: 'transparent', ...defaults })
    };
  }

  private static createTextFieldSimpleElement(defaults: Record<string, any> = {}): TextFieldSimpleElement {
    return {
      ...ElementFactory.initInputElement('text-field', { height: 25, ...defaults }),
      type: 'text-field',
      label: undefined,
      styles: ElementFactory.initBasicStyles(defaults)
    };
  }

  private static createToggleButtonElement(defaults: Record<string, any> = {}): ToggleButtonElement {
    return {
      ...ElementFactory.initInputElement('toggle-button', { height: 25, ...defaults }),
      type: 'toggle-button',
      options: [],
      strikeOtherOptions: false,
      selectionColor: 'lightgreen',
      verticalOrientation: false,
      dynamicWidth: true,
      styles: {
        ...ElementFactory.initBasicStyles({ backgroundColor: 'transparent', ...defaults }),
        lineHeight: 135
      }
    };
  }

  private static createAudioElement(defaults: Record<string, any> = {}): AudioElement {
    return {
      ...ElementFactory.initElement('audio', { width: 250, height: 90, ...defaults }),
      type: 'audio',
      src: '', // TODO eigentlich undefined
      positionProps: ElementFactory.initPositionProps(defaults),
      playerProps: ElementFactory.initPlayerProps(defaults)
    };
  }

  private static createVideoElement(defaults: Record<string, any> = {}): VideoElement {
    return {
      ...ElementFactory.initElement('video', { width: 280, height: 230, ...defaults }),
      type: 'video',
      src: '', // TODO eigentlich undefined
      scale: false,
      positionProps: ElementFactory.initPositionProps(defaults),
      playerProps: ElementFactory.initPlayerProps(defaults)
    };
  }
}

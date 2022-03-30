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
  InputElement, InputElementValue, LikertElement, LikertRowElement, PlayerProperties, PositionProperties,
  RadioButtonGroupComplexElement,
  RadioButtonGroupElement, SliderElement, SpellCorrectElement,
  TextAreaElement,
  TextElement,
  TextFieldElement, ToggleButtonElement,
  UIElement, UIElementType, UIElementValue,
  VideoElement
} from '../interfaces/elements';
import { ClozeDocument, ClozeDocumentParagraph, ClozeDocumentParagraphPart } from '../interfaces/cloze';

export abstract class ElementFactory {
  static createElement(element: Partial<UIElement>): UIElement {
    // console.log('createElement', element);
    switch (element.type) {
      case 'text':
        return ElementFactory.createTextElement(element as Partial<TextElement>);
      case 'button':
        return ElementFactory.createButtonElement(element as Partial<ButtonElement>);
      case 'text-field':
        return ElementFactory.createTextFieldElement(element as Partial<TextFieldElement>);
      case 'text-area':
        return ElementFactory.createTextAreaElement(element as Partial<TextAreaElement>);
      case 'checkbox':
        return ElementFactory.createCheckboxElement(element as Partial<CheckboxElement>);
      case 'dropdown':
        return ElementFactory.createDropdownElement(element as Partial<DropdownElement>);
      case 'radio':
        return ElementFactory.createRadioButtonGroupElement(element as Partial<RadioButtonGroupElement>);
      case 'image':
        return ElementFactory.createImageElement(element as Partial<ImageElement>);
      case 'audio':
        return ElementFactory.createAudioElement(element as Partial<AudioElement>);
      case 'video':
        return ElementFactory.createVideoElement(element as Partial<VideoElement>);
      case 'likert':
        return ElementFactory.createLikertElement(element as Partial<LikertElement>);
      case 'radio-group-images':
        return ElementFactory.createRadioButtonGroupComplexElement(element as Partial<RadioButtonGroupComplexElement>);
      case 'drop-list':
        return ElementFactory.createDropListElement(element as Partial<DropListElement>);
      case 'cloze':
        return ElementFactory.createClozeElement(element as Partial<ClozeElement>);
      case 'slider':
        return ElementFactory.createSliderElement(element as Partial<SliderElement>);
      case 'spell-correct':
        return ElementFactory.createSpellCorrectElement(element as Partial<SpellCorrectElement>);
      case 'frame':
        return ElementFactory.createFrameElement(element as Partial<FrameElement>);
      case 'toggle-button':
        return ElementFactory.createToggleButtonElement(element as Partial<ToggleButtonElement>);
      default:
        throw new Error(`ElementType ${element.type} not found!`);
    }
  }

  static initElement(element: Partial<UIElement>): UIElement {
    return {
      type: element.type as UIElementType,
      id: element.id ? String(element.id) : 'id_placeholder',
      width: element.width || 190,
      height: element.height || 60
    };
  }

  static initInputElement(element: Partial<UIElement>): InputElement {
    return {
      ...ElementFactory.initElement(element),
      label: element.value !== undefined ? element.label as string : 'Beispielbeschriftung',
      value: element.value !== undefined ? element.value as InputElementValue : null,
      required: element.required !== undefined ? element.required as boolean : false,
      requiredWarnMessage: element.requiredWarnMessage !== undefined ?
        element.requiredWarnMessage as string :
        'Eingabe erforderlich',
      readOnly: element.readOnly !== undefined ? element.readOnly as boolean : false
    };
  }

  static initPositionProps(defaults: Record<string, UIElementValue> = {}): PositionProperties {
    return {
      fixedSize: defaults.fixedSize !== undefined ? defaults.fixedSize as boolean : false,
      dynamicPositioning: defaults.dynamicPositioning !== undefined ? defaults.dynamicPositioning as boolean : false,
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

  static initBasicStyles(defaults: Record<string, UIElementValue> = {}): BasicStyles {
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

  private static createButtonElement(element: Partial<ButtonElement>): ButtonElement {
    return {
      ...ElementFactory.initElement(element),
      type: 'button',
      label: element.label !== undefined ? element.label : 'Knopf',
      imageSrc: element.imageSrc || null,
      asLink: element.asLink !== undefined ? element.asLink : false,
      action: element.action || null,
      actionParam: element.actionParam !== undefined ? element.actionParam : null,
      position: ElementFactory.initPositionProps(element.position as Record<string, UIElementValue>),
      styling: {
        ...ElementFactory.initBasicStyles(element.styling),
        borderRadius: element.borderRadius !== undefined ? element.borderRadius as number : 0
      }
    };
  }

  private static createCheckboxElement(element: Partial<CheckboxElement>): CheckboxElement {
    return {
      ...ElementFactory.initInputElement({ width: 215, ...element }),
      type: 'checkbox',
      value: element.value !== undefined ? element.value : false,
      position: ElementFactory.initPositionProps(element.position),
      styling: ElementFactory.initBasicStyles(element.styling)
    };
  }

  private static createClozeElement(element: Partial<ClozeElement>): ClozeElement {
    return {
      ...ElementFactory.initElement({ width: 450, height: 200, ...element }),
      type: 'cloze',
      document: element.document !== undefined ?
        {
          ...element.document,
          content: element.document.content
            .map((paragraph: ClozeDocumentParagraph) => ({
              ...paragraph,
              content: paragraph.content
                .map((paraPart: ClozeDocumentParagraphPart) => (
                  ['TextField', 'DropList', 'ToggleButton'].includes(paraPart.type) ?
                    {
                      ...paraPart,
                      attrs: {
                        ...paraPart.attrs,
                        model: ElementFactory.createElement(paraPart.attrs!.model as InputElement)
                      }
                    } :
                    {
                      ...paraPart
                    }
                ))
            }))
        } as ClozeDocument :
        { type: 'doc', content: [] },
      position: ElementFactory.initPositionProps(element.position),
      styling: {
        ...ElementFactory.initBasicStyles(element.styling),
        lineHeight: element.styling?.lineHeight !== undefined ? element.styling?.lineHeight as number : 135
      }
    };
  }

  private static createDropdownElement(element: Partial<DropdownElement>): DropdownElement {
    return {
      ...ElementFactory.initInputElement({ width: 240, height: 83, ...element }),
      type: 'dropdown',
      options: element.options !== undefined ? element.options : [],
      allowUnset: element.allowUnset !== undefined ? element.allowUnset : false,
      position: ElementFactory.initPositionProps(element),
      styling: ElementFactory.initBasicStyles(element.styling)
    };
  }

  private static createDropListElement(element: Partial<DropListElement>): DropListElement {
    return {
      ...ElementFactory.initInputElement({ height: 100, ...element }),
      type: 'drop-list',
      value: element.value !== undefined ? element.value : [],
      onlyOneItem: element.onlyOneItem !== undefined ? element.onlyOneItem : false,
      connectedTo: element.connectedTo !== undefined ? element.connectedTo : [],
      orientation: element.orientation !== undefined ? element.orientation : 'vertical',
      highlightReceivingDropList: element.highlightReceivingDropList !== undefined ?
        element.highlightReceivingDropList :
        false,
      highlightReceivingDropListColor: element.highlightReceivingDropListColor !== undefined ?
        element.highlightReceivingDropListColor : '#006064',
      position: ElementFactory.initPositionProps({ useMinHeight: true, ...element }),
      styling: {
        ...ElementFactory.initBasicStyles({ backgroundColor: '#f4f4f2', ...element.styling }),
        itemBackgroundColor: element.itemBackgroundColor !== undefined ?
          element.itemBackgroundColor as string : '#c9e0e0'
      }
    };
  }

  private static createDropListSimpleElement(element: Partial<DropListSimpleElement>): DropListSimpleElement { // TODO unused
    return {
      ...ElementFactory.initInputElement({ height: 100, ...element }),
      type: 'drop-list',
      value: element.value !== undefined ? element.value : [],
      connectedTo: element.connectedTo !== undefined ? element.connectedTo : [],
      highlightReceivingDropList: element.highlightReceivingDropList !== undefined ?
        element.highlightReceivingDropList : false,
      highlightReceivingDropListColor: element.highlightReceivingDropListColor !== undefined ?
        element.highlightReceivingDropListColor : '#add8e6',
      styling: {
        ...ElementFactory.initBasicStyles({ backgroundColor: '#eeeeec', ...element.styling }),
        itemBackgroundColor: element.itemBackgroundColor !== undefined ?
          element.itemBackgroundColor as string : '#add8e6'
      }
    };
  }

  private static createFrameElement(element: Partial<FrameElement>): FrameElement {
    return {
      ...ElementFactory.initElement({}),
      type: 'frame',
      position: ElementFactory.initPositionProps({ zIndex: -1, ...element }),
      styling: {
        ...ElementFactory.initBasicStyles({ backgroundColor: 'transparent', ...element.styling }) as BasicStyles,
        borderWidth: element.borderWidth !== undefined ? element.borderWidth as number : 1,
        borderColor: element.borderColor !== undefined ? element.borderColor as string : 'black',
        borderStyle: element.borderStyle !== undefined ?
          element.borderStyle as 'solid' | 'dotted' | 'dashed' | 'double' | 'groove' |
          'ridge' | 'inset' | 'outset' :
          'solid',
        borderRadius: element.borderRadius !== undefined ? element.borderRadius as number : 0
      }
    };
  }

  private static createImageElement(element: Partial<ImageElement>): ImageElement {
    return {
      ...ElementFactory.initElement({ height: 100, ...element }),
      type: 'image',
      src: element.src || '', // TODO eigentlich undefined
      scale: element.scale !== undefined ? element.scale : false,
      magnifier: element.magnifier !== undefined ? element.magnifier : false,
      magnifierSize: element.magnifierSize !== undefined ? element.magnifierSize : 100,
      magnifierZoom: element.magnifierZoom !== undefined ? element.magnifierZoom : 1.5,
      magnifierUsed: element.magnifierUsed !== undefined ? element.magnifierUsed : false,
      position: ElementFactory.initPositionProps({})
    };
  }

  private static createLikertElement(element: Partial<LikertElement>): LikertElement {
    return {
      ...ElementFactory.initElement({ width: 250, height: 200, ...element }),
      type: 'likert',
      rows: element.rows !== undefined ?
        element.rows.map(row => ElementFactory.createLikertRowElement(row)) :
        [],
      columns: element.columns !== undefined ? element.columns : [],
      firstColumnSizeRatio: element.firstColumnSizeRatio !== undefined ? element.firstColumnSizeRatio : 5,
      readOnly: element.readOnly !== undefined ? element.readOnly : false,
      position: ElementFactory.initPositionProps({ marginBottom: 30, ...element.position }),
      styling: {
        ...ElementFactory.initBasicStyles({ backgroundColor: 'transparent', ...element.styling }),
        lineHeight: element.styling?.lineHeight !== undefined ? element.styling?.lineHeight as number : 135,
        lineColoring: element.lineColoring !== undefined ? element.lineColoring as boolean : true,
        lineColoringColor: element.lineColoringColor !== undefined ? element.lineColoringColor as string : '#c9e0e0'
      }
    };
  }

  static createLikertRowElement(element: Partial<LikertRowElement>): LikertRowElement {
    return {
      ...ElementFactory.initInputElement(element),
      type: 'likert-row',
      text: element.text !== undefined ? element.text : '',
      columnCount: element.columnCount !== undefined ? element.columnCount : 0,
      firstColumnSizeRatio: element.firstColumnSizeRatio !== undefined ? element.firstColumnSizeRatio : 5
    };
  }

  private static createRadioButtonGroupElement(element: Partial<RadioButtonGroupElement>): RadioButtonGroupElement {
    return {
      ...ElementFactory.initInputElement({ height: 85, ...element }),
      type: 'radio',
      options: element.options !== undefined ? element.options : [],
      alignment: element.alignment !== undefined ? element.alignment : 'column',
      strikeOtherOptions: element.strikeOtherOptions !== undefined ? element.strikeOtherOptions : false,
      position: ElementFactory.initPositionProps({ marginBottom: 30, ...element.position }),
      styling: ElementFactory.initBasicStyles({ backgroundColor: 'transparent', ...element.styling })
    };
  }

  private static createRadioButtonGroupComplexElement(element: Partial<RadioButtonGroupComplexElement>):
  RadioButtonGroupComplexElement {
    return {
      ...ElementFactory.initInputElement({ height: 100, ...element }), // TODO better name
      type: 'radio-group-images',
      columns: element.columns !== undefined ? element.columns : [],
      position: ElementFactory.initPositionProps(element.position),
      styling: ElementFactory.initBasicStyles({ backgroundColor: 'transparent', ...element.styling })
    };
  }

  private static createSliderElement(element: Partial<SliderElement>): SliderElement {
    return {
      ...ElementFactory.initInputElement({ width: 300, height: 75, ...element }),
      type: 'slider',
      minValue: element.minValue !== undefined ? element.minValue : 0,
      maxValue: element.maxValue !== undefined ? element.maxValue : 100,
      showValues: element.showValues !== undefined ? element.showValues : true,
      barStyle: element.barStyle !== undefined ? element.barStyle : false,
      thumbLabel: element.thumbLabel !== undefined ? element.thumbLabel : false,
      position: ElementFactory.initPositionProps(element.position),
      styling: ElementFactory.initBasicStyles({ backgroundColor: 'transparent', ...element.styling })
    };
  }

  private static createSpellCorrectElement(element: Partial<SpellCorrectElement>): SpellCorrectElement {
    return {
      ...ElementFactory.initInputElement({ width: 230, height: 80, ...element }),
      type: 'spell-correct',
      position: ElementFactory.initPositionProps(element.position),
      styling: ElementFactory.initBasicStyles({ backgroundColor: 'transparent', ...element.styling })
    };
  }

  private static createTextElement(element: Partial<TextElement>): TextElement {
    return {
      ...ElementFactory.initElement({ height: 98, ...element }),
      type: 'text',
      text: element.text !== undefined ? element.text : 'Lorem ipsum dolor sit amet',
      highlightableOrange: element.highlightableOrange !== undefined ? element.highlightableOrange : false,
      highlightableTurquoise: element.highlightableTurquoise !== undefined ? element.highlightableTurquoise : false,
      highlightableYellow: element.highlightableYellow !== undefined ? element.highlightableYellow : false,
      position: ElementFactory.initPositionProps(element.position),
      styling: {
        ...ElementFactory.initBasicStyles({ backgroundColor: 'transparent', ...element.styling }),
        lineHeight: element.styling?.lineHeight !== undefined ? element.styling?.lineHeight as number : 135
      }
    };
  }

  private static createTextAreaElement(element: Partial<TextAreaElement>): TextAreaElement {
    return {
      ...ElementFactory.initInputElement({ width: 230, height: 132, ...element }),
      type: 'text-area',
      appearance: element.appearance !== undefined ? element.appearance : 'outline',
      resizeEnabled: element.resizeEnabled !== undefined ? element.resizeEnabled : false,
      rowCount: element.rowCount !== undefined ? element.rowCount : 3,
      inputAssistancePreset: element.inputAssistancePreset !== undefined ? element.inputAssistancePreset : 'none',
      inputAssistancePosition: element.inputAssistancePosition !== undefined ?
        element.inputAssistancePosition : 'floating',
      restrictedToInputAssistanceChars: element.restrictedToInputAssistanceChars !== undefined ?
        element.restrictedToInputAssistanceChars : true,
      showSoftwareKeyboard: element.showSoftwareKeyboard !== undefined ?
        element.showSoftwareKeyboard : false,
      softwareKeyboardShowFrench: element.softwareKeyboardShowFrench !== undefined ?
        element.softwareKeyboardShowFrench : false,
      position: ElementFactory.initPositionProps(element.position),
      styling: {
        ...ElementFactory.initBasicStyles({ backgroundColor: 'transparent', ...element.styling }),
        lineHeight: element.styling?.lineHeight !== undefined ? element.styling?.lineHeight as number : 135
      }
    };
  }

  private static createTextFieldElement(element: Partial<TextFieldElement>): TextFieldElement {
    return {
      ...ElementFactory.initInputElement({ width: 230, height: 100, ...element }),
      type: 'text-field',
      appearance: element.appearance !== undefined ? element.appearance : 'outline',
      minLength: element.minLength !== undefined ? element.minLength : 0,
      minLengthWarnMessage: element.minLengthWarnMessage !== undefined ?
        element.minLengthWarnMessage : 'Eingabe zu kurz',
      maxLength: element.maxLength !== undefined ? element.maxLength : 0,
      maxLengthWarnMessage: element.maxLengthWarnMessage !== undefined ?
        element.maxLengthWarnMessage : 'Eingabe zu lang',
      pattern: element.pattern !== undefined ? element.pattern : '',
      patternWarnMessage: element.patternWarnMessage !== undefined ?
        element.patternWarnMessage : 'Eingabe entspricht nicht der Vorgabe',
      inputAssistancePreset: element.inputAssistancePreset !== undefined ? element.inputAssistancePreset : 'none',
      inputAssistancePosition: element.inputAssistancePosition !== undefined ?
        element.inputAssistancePosition : 'floating',
      restrictedToInputAssistanceChars: element.restrictedToInputAssistanceChars !== undefined ?
        element.restrictedToInputAssistanceChars : true,
      showSoftwareKeyboard: element.showSoftwareKeyboard !== undefined ?
        element.showSoftwareKeyboard : false,
      softwareKeyboardShowFrench: element.softwareKeyboardShowFrench !== undefined ?
        element.softwareKeyboardShowFrench : false,
      clearable: element.clearable !== undefined ? element.clearable : false,
      position: ElementFactory.initPositionProps(element.position),
      styling: {
        ...ElementFactory.initBasicStyles({ backgroundColor: 'transparent', ...element.styling }),
        lineHeight: element.styling?.lineHeight !== undefined ? element.styling?.lineHeight as number : 135
      }
    };
  }

  private static createToggleButtonElement(element: Partial<ToggleButtonElement>): ToggleButtonElement {
    return {
      ...ElementFactory.initInputElement({ height: 25, ...element }),
      type: 'toggle-button',
      options: element.options !== undefined ? element.options : [],
      strikeOtherOptions: element.strikeOtherOptions !== undefined ? element.strikeOtherOptions : false,
      selectionColor: element.selectionColor !== undefined ? element.selectionColor : 'lightgreen',
      verticalOrientation: element.verticalOrientation !== undefined ? element.verticalOrientation : false,
      dynamicWidth: element.dynamicWidth !== undefined ? element.dynamicWidth : true,
      styling: {
        ...ElementFactory.initBasicStyles({ backgroundColor: 'transparent', ...element }),
        lineHeight: element.styling?.lineHeight !== undefined ? element.styling?.lineHeight as number : 135
      }
    };
  }

  private static createAudioElement(element: Partial<AudioElement>): AudioElement {
    return {
      ...ElementFactory.initElement({ width: 250, height: 90, ...element }),
      type: 'audio',
      src: element.src !== undefined ? element.src : '', // TODO eigentlich undefined
      position: ElementFactory.initPositionProps(element.position),
      player: ElementFactory.initPlayerProps(element.player)
    };
  }

  private static createVideoElement(element: Partial<VideoElement>): VideoElement {
    return {
      ...ElementFactory.initElement({ width: 280, height: 230, ...element }),
      type: 'video',
      src: element.src !== undefined ? element.src : '', // TODO eigentlich undefined
      scale: element.scale !== undefined ? element.scale : false,
      position: ElementFactory.initPositionProps(element.position),
      player: ElementFactory.initPlayerProps(element.player)
    };
  }
}

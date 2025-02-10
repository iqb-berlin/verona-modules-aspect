import { DragNDropValueObject, PositionedUIElement, TextLabel } from 'common/interfaces';
import { DimensionProperties } from 'common/models/elements/property-group-interfaces';
import { Section, SectionProperties } from 'common/models/section';
import { IDService } from 'editor/src/app/services/id.service';
import {
  TwoPageImagesTemplateOptions,
  TwoPageTemplateOptions
} from 'editor/src/app/section-templates/droplist-interfaces';
import { TemplateService } from '../template.service';

export function createDroplistSection(alignment: 'column' | 'row', text1: string, headingSourceList: string,
                                      options: DragNDropValueObject[],
                                      optionLength: 'long' | 'medium' | 'short' | 'very-short',
                                      headingTargetLists: string,
                                      targetLength: 'medium' | 'short' | 'very-short', targetLabels: TextLabel[],
                                      idService: IDService): Section {
  const sectionElements: PositionedUIElement[] = [
    TemplateService.createElement(
      'text',
      {
        gridRow: 1,
        gridColumn: 1,
        gridColumnRange: 2,
        marginBottom: { value: 20, unit: 'px' }
      },
      { text: text1 },
      idService),
    TemplateService.createElement(
      'text',
      {
        gridRow: 2,
        gridColumn: 1,
        gridColumnRange: 2,
        marginBottom: { value: 20, unit: 'px' }
      },
      {
        text: alignment === 'column' ? headingSourceList : headingTargetLists,
        styling: { bold: true }
      },
      idService),
    TemplateService.createElement(
      'drop-list',
      {
        gridRow: 3,
        gridColumn: alignment === 'column' ? 1 : 3,
        ...alignment === 'row' && { gridRowRange: targetLabels.length },
        gridColumnRange: alignment === 'column' ? 2 : 1,
        marginBottom: { value: alignment === 'column' ? 20 : 40, unit: 'px' },
        ...alignment === 'row' && { marginLeft: { value: 5, unit: 'px' } }
      },
      {
        dimensions: { minHeight: 58 } as DimensionProperties,
        value: options.map(option => ({
          text: option.text,
          originListID: 'id_placeholder'
        })),
        orientation: alignment === 'column' ? 'flex' : 'vertical',
        highlightReceivingDropList: true
      },
      idService),
    TemplateService.createElement(
      'text',
      {
        gridRow: alignment === 'column' ? 4 : 2,
        gridColumn: alignment === 'column' ? 1 : 3,
        gridColumnRange: 2,
        marginBottom: { value: 20, unit: 'px' }
      },
      {
        text: alignment === 'column' ? headingTargetLists : headingSourceList,
        styling: { bold: true }
      },
      idService)
  ];
  const targetListOffset = alignment === 'column' ? 5 : 3;
  targetLabels.forEach((label: TextLabel, i: number) => {
    sectionElements.push(TemplateService.createElement(
      'text',
      {
        gridRow: i + targetListOffset,
        gridColumn: 1,
        marginTop: { value: 16, unit: 'px' },
        marginRight: { value: 5, unit: 'px' }
      },
      { text: label.text },
      idService)
    );
    sectionElements.push(TemplateService.createElement(
      'drop-list',
      {
        gridRow: i + targetListOffset,
        gridColumn: 2,
        marginBottom: { value: i === (targetLabels.length - 1) ? 40 : 5, unit: 'px' }
      },
      {
        dimensions: { minHeight: 58 } as DimensionProperties,
        orientation: 'vertical',
        onlyOneItem: true,
        allowReplacement: true,
        highlightReceivingDropList: true
      },
      idService)
    );
  });

  const section = new Section({
    autoColumnSize: false,
    gridColumnSizes: alignment === 'column' ?
      getDrolistColSizesVertical(optionLength, targetLength) :
      getDrolistColSizesHorizontal(
        optionLength as 'medium' | 'short' | 'very-short', targetLength)
  } as SectionProperties, idService);
  sectionElements.forEach(el => section.addElement(el));
  section.connectAllDropLists();
  return section;
}

function getDrolistColSizesVertical(optionLength: 'long' | 'medium' | 'short' | 'very-short',
                                    targetLength: 'long' | 'medium' | 'short' | 'very-short')
  : [ { value: number; unit: string }, { value: number; unit: string } ] {
  switch (optionLength) {
    case 'long':
      switch (targetLength) {
        case 'long': return [{ value: 4, unit: 'fr' }, { value: 5, unit: 'fr' }];
        case 'medium': return [{ value: 3, unit: 'fr' }, { value: 5, unit: 'fr' }];
        case 'short': return [{ value: 1, unit: 'fr' }, { value: 2, unit: 'fr' }];
        case 'very-short': return [{ value: 125, unit: 'px' }, { value: 1, unit: 'fr' }];
        default: throw Error(`Unknown targetLength: ${targetLength}`);
      }
    case 'medium':
      switch (targetLength) {
        case 'long': return [{ value: 5, unit: 'fr' }, { value: 4, unit: 'fr' }];
        case 'medium': return [{ value: 4, unit: 'fr' }, { value: 5, unit: 'fr' }];
        case 'short': return [{ value: 3, unit: 'fr' }, { value: 5, unit: 'fr' }];
        case 'very-short': return [{ value: 125, unit: 'px' }, { value: 1, unit: 'fr' }];
        default: throw Error(`Unknown targetLength: ${targetLength}`);
      }
    case 'short':
      switch (targetLength) {
        case 'long':
          return [{ value: 1, unit: 'fr' }, { value: 125, unit: 'px' }];
        case 'medium':
          return [{ value: 1, unit: 'fr' }, { value: 125, unit: 'px' }];
        case 'short':
          return [{ value: 250, unit: 'px' }, { value: 1, unit: 'fr' }];
        case 'very-short':
          return [{ value: 125, unit: 'px' }, { value: 1, unit: 'fr' }];
        default:
          throw Error(`Unknown targetLength: ${targetLength}`);
      }
    case 'very-short':
      switch (targetLength) {
        case 'long': return [{ value: 1, unit: 'fr' }, { value: 125, unit: 'px' }];
        case 'medium': return [{ value: 1, unit: 'fr' }, { value: 125, unit: 'px' }];
        case 'short': return [{ value: 250, unit: 'px' }, { value: 1, unit: 'fr' }];
        case 'very-short': return [{ value: 125, unit: 'px' }, { value: 1, unit: 'fr' }];
        default: throw Error(`Unknown targetLength: ${targetLength}`);
      }
    default: throw Error(`Unknown optionLength: ${optionLength}`);
  }
}

function getDrolistColSizesHorizontal(optionLength: 'medium' | 'short' | 'very-short',
                                      targetLength: 'medium' | 'short' | 'very-short')
  : { value: number; unit: string }[] {
  switch (optionLength) {
    case 'medium':
      switch (targetLength) {
        case 'medium': return [{ value: 4, unit: 'fr' }, { value: 5, unit: 'fr' }, { value: 5, unit: 'fr' }];
        case 'short': return [{ value: 3, unit: 'fr' }, { value: 5, unit: 'fr' }, { value: 5, unit: 'fr' }];
        case 'very-short': return [{ value: 125, unit: 'px' }, { value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }];
        default: throw Error(`Unknown targetLength: ${targetLength}`);
      }
    case 'short':
      switch (targetLength) {
        case 'medium': return [{ value: 1, unit: 'fr' }, { value: 250, unit: 'px' }, { value: 250, unit: 'px' }];
        case 'short': return [{ value: 250, unit: 'px' }, { value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }];
        case 'very-short':
          return [{ value: 125, unit: 'px' }, { value: 250, unit: 'px' },
            { value: 250, unit: 'px' }, { value: 1, unit: 'fr' }];
        default: throw Error(`Unknown targetLength: ${targetLength}`);
      }
    case 'very-short':
      switch (targetLength) {
        case 'medium': return [{ value: 1, unit: 'fr' }, { value: 125, unit: 'px' }, { value: 125, unit: 'px' }];
        case 'short': return [{ value: 250, unit: 'px' }, { value: 125, unit: 'px' },
          { value: 125, unit: 'px' }, { value: 1, unit: 'fr' }];
        case 'very-short':
          return [{ value: 125, unit: 'px' }, { value: 125, unit: 'px' },
            { value: 125, unit: 'px' }, { value: 1, unit: 'fr' }];
        default: throw Error(`Unknown targetLength: ${targetLength}`);
      }
    default: throw Error(`Unknown optionLength: ${optionLength}`);
  }
}

export function createSortlistSection(text1: string, headingSourceList: string, options: DragNDropValueObject[],
                                      optionLength: 'long' | 'medium' | 'short' | 'very-short',
                                      numbering: boolean, idService: IDService): Section {
  const sectionElements: PositionedUIElement[] = [
    TemplateService.createElement(
      'text',
      {
        gridRow: 1,
        gridColumn: 1,
        gridColumnRange: 1,
        marginBottom: { value: 20, unit: 'px' }
      },
      { text: text1 },
      idService),
    TemplateService.createElement(
      'drop-list',
      { gridRow: 2, gridColumn: 1, marginBottom: { value: 40, unit: 'px' } },
      {
        dimensions: {
          // eslint-disable-next-line no-nested-ternary
          maxWidth: optionLength === 'medium' ? 500 : optionLength === 'short' ? 250 : 125
        } as DimensionProperties,
        value: options.map(option => ({
          text: option.text,
          originListID: 'id_placeholder'
        })),
        orientation: 'vertical',
        isSortList: true,
        highlightReceivingDropList: true,
        showNumbering: numbering
      },
      idService)
  ];

  const section = new Section(undefined, idService);
  sectionElements.forEach(el => section.addElement(el));
  return section;
}

export function createTwopageSection(options: TwoPageTemplateOptions, idService: IDService): [Section, Section] {
  const section1Elements: PositionedUIElement[] = [
    TemplateService.createElement('text', { gridRow: 1, gridColumn: 1 }, { text: options.text1 }, idService),
    TemplateService.createElement('text', { gridRow: 2, gridColumn: 1 },
                                  { text: options.headingSourceList, styling: { bold: true } }, idService),
    TemplateService.createElement('drop-list', { gridRow: 3, gridColumn: 1 },
                                  {
                                    value: options.options.map(option => ({
                                      text: option.text,
                                      originListID: 'id_placeholder'
                                    })),
                                    orientation: 'vertical',
                                    highlightReceivingDropList: true
                                  },
                                  idService)
  ];
  const section = new Section(undefined, idService);
  section1Elements.forEach(el => section.addElement(el));
  const section2Elements: PositionedUIElement[] = [
    TemplateService.createElement('text', { gridRow: 1, gridColumn: 1 }, { text: options.text2 }, idService),
    TemplateService.createElement('text', { gridRow: 2, gridColumn: 1 },
                                  { text: options.headingTargetLists, styling: { bold: true } }, idService)
  ];
  options.targetLabels.forEach((label: TextLabel, i: number) => {
    const labelEl = TemplateService.createElement(
      'drop-list', { gridRow: 4 + i * 2 - (options.labelsBelow ? 1 : 0), gridColumn: 1 },
      {
        dimensions: { minHeight: 58 } as DimensionProperties,
        orientation: 'vertical',
        onlyOneItem: true,
        allowReplacement: true,
        highlightReceivingDropList: true
      }, idService);
    if (!options.labelsBelow) section2Elements.push(labelEl);
    section2Elements.push(TemplateService.createElement(
      'text', { gridRow: (3 + i * 2) + (options.labelsBelow ? 1 : 0), gridColumn: 1 }, { text: label.text }, idService)
    );
    if (options.labelsBelow) section2Elements.push(labelEl);
  });
  section2Elements.push(
    TemplateService.createElement('text', { gridRow: 3 + options.targetLabels.length * 2, gridColumn: 1 },
                                  { text: options.text3 }, idService));
  const section2 = new Section(undefined, idService);
  section2Elements.forEach(el => section2.addElement(el));
  return [section, section2];
}

export function createTwopageImagesSection(options: TwoPageImagesTemplateOptions, idService: IDService): [Section, Section] {
  const section = new Section(undefined, idService);
  const section2 = new Section(undefined, idService);
  return [section, section2];
}

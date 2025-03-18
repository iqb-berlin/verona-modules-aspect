import { PositionedUIElement } from 'common/interfaces';
import { DimensionProperties } from 'common/models/elements/property-group-interfaces';
import { Section, SectionProperties } from 'common/models/section';
import { DropListElement } from 'common/models/elements/input-elements/drop-list';
import { IDService } from 'editor/src/app/services/id.service';
import {
  ClassicTemplateOptions, SortTemplateOptions,
  TwoPageTemplateOptions
} from 'editor/src/app/section-templates/droplist-interfaces';
import { TemplateService } from '../template.service';

export function createDroplistSection(options: ClassicTemplateOptions, idService: IDService): Section {
  const sectionElements: PositionedUIElement[] = [
    TemplateService.createElement(
      'text', { gridRow: 1, gridColumn: 1, gridColumnRange: 2, marginBottom: { value: 20, unit: 'px' } },
      { text: options.text1 }, idService),
    TemplateService.createElement(
      'text', { gridRow: 2, gridColumn: 1, gridColumnRange: 2, marginBottom: { value: 20, unit: 'px' } },
      {
        text: options.targetLabelAlignment === 'column' ? options.headingSourceList : options.headingTargetLists,
        styling: { bold: true }
      },
      idService),
    TemplateService.createElement(
      'drop-list',
      {
        gridRow: 3,
        gridColumn: options.targetLabelAlignment === 'column' ? 1 : 3,
        ...options.targetLabelAlignment === 'row' && { gridRowRange: options.targetLabels.length + 1 },
        gridColumnRange: options.targetLabelAlignment === 'column' ? 2 : 1,
        marginBottom: { value: options.targetLabelAlignment === 'column' ? 20 : 40, unit: 'px' },
        ...options.targetLabelAlignment === 'row' && { marginLeft: { value: 5, unit: 'px' } }
      },
      {
        dimensions: { minHeight: 58 } as DimensionProperties,
        value: options.options.map(option => ({
          text: option,
          originListID: 'id_placeholder'
        })),
        orientation: options.targetLabelAlignment === 'column' ? 'flex' : 'vertical',
        highlightReceivingDropList: true,
        permanentPlaceholders: true,
        permanentPlaceholdersCC: true
      },
      idService),
    TemplateService.createElement(
      'text',
      {
        gridRow: options.targetLabelAlignment === 'column' ? 4 : 2,
        gridColumn: options.targetLabelAlignment === 'column' ? 1 : 3,
        gridColumnRange: 2,
        marginBottom: { value: 20, unit: 'px' }
      },
      {
        text: options.targetLabelAlignment === 'column' ? options.headingTargetLists : options.headingSourceList,
        styling: { bold: true }
      },
      idService)
  ];
  const targetListOffset = options.targetLabelAlignment === 'column' ? 5 : 3;
  options.targetLabels.forEach((label: string, i: number) => {
    sectionElements.push(TemplateService.createElement(
      'text',
      {
        gridRow: i + targetListOffset,
        gridColumn: 1,
        marginTop: { value: 16, unit: 'px' },
        marginRight: { value: 5, unit: 'px' }
      },
      { text: label },
      idService)
    );
    sectionElements.push(TemplateService.createElement(
      'drop-list',
      {
        gridRow: i + targetListOffset,
        gridColumn: 2,
        marginBottom: { value: i === (options.targetLabels.length - 1) ? 40 : 5, unit: 'px' }
      },
      {
        dimensions: { minHeight: 58, maxWidth: getWidth(options.optionWidth) } as DimensionProperties,
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
    gridColumnSizes: options.targetLabelAlignment === 'column' ?
      getDrolistColSizesVertical(options.optionWidth, options.targetWidth) :
      getDrolistColSizesHorizontal(
        options.optionWidth as 'medium' | 'short' | 'very-short', options.targetWidth)
  } as SectionProperties, idService);
  sectionElements.forEach(el => section.addElement(el));
  section.connectAllDropLists();
  return section;
}

function getWidth(width: 'long' | 'medium' | 'short' | 'very-short'): number {
  switch (width) {
    case 'very-short': return 125;
    case 'short': return 250;
    case 'medium': return 500;
    case 'long': return 750;
    default: throw Error(`Unexpected option width:${width}`);
  }
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

export function createSortlistSection(options: SortTemplateOptions, idService: IDService): Section {
  const sectionElements: PositionedUIElement[] = [
    TemplateService.createElement(
      'text',
      {
        gridRow: 1,
        gridColumn: 1,
        gridColumnRange: 1,
        marginBottom: { value: 20, unit: 'px' }
      },
      { text: options.text1 },
      idService),
    TemplateService.createElement(
      'drop-list',
      { gridRow: 2, gridColumn: 1, marginBottom: { value: 40, unit: 'px' } },
      {
        dimensions: {
          // eslint-disable-next-line no-nested-ternary
          maxWidth: options.optionWidth === 'medium' ? 500 : options.optionWidth === 'short' ? 250 : 125
        } as DimensionProperties,
        value: options.options.map(option => ({
          text: option,
          originListID: 'id_placeholder'
        })),
        orientation: 'vertical',
        isSortList: true,
        highlightReceivingDropList: true,
        showNumbering: options.numbering
      },
      idService)
  ];

  const section = new Section(undefined, idService);
  sectionElements.forEach(el => section.addElement(el));
  return section;
}

export function createTwopageSection(options: TwoPageTemplateOptions, idService: IDService): [Section, Section] {
  const section1Elements: PositionedUIElement[] = [
    TemplateService.createElement('text', { gridRow: 1, gridColumn: 1, marginBottom: { value: 30, unit: 'px' } },
                                  { text: options.text1 }, idService),
    TemplateService.createElement('text', { gridRow: 2, gridColumn: 1, marginBottom: { value: 20, unit: 'px' } },
                                  { text: options.headingSourceList, styling: { bold: true } }, idService)
  ];
  const startListEle: DropListElement = TemplateService.createElement(
    'drop-list',
    { gridRow: 3, gridColumn: 1 },
    {
      value: options.options.map(option => ({
        text: options.srcUseImages ? '' : option,
        imgSrc: options.srcUseImages ? option : undefined,
        originListID: 'id_placeholder'
      })),
      orientation: options.srcUseImages ? 'flex' : 'vertical',
      highlightReceivingDropList: true,
      permanentPlaceholders: true,
      permanentPlaceholdersCC: !options.srcUseImages
    },
    idService) as DropListElement;
  section1Elements.push(startListEle as PositionedUIElement);

  const section2Elements: PositionedUIElement[] = [
    TemplateService.createElement('text',
                                  { gridRow: 1, gridColumn: 1, gridColumnRange: 2 + (options.targetUseImages ? 1 : 0), marginBottom: { value: 30, unit: 'px' } },
                                  { text: options.text2 }, idService),
    TemplateService.createElement('text',
                                  { gridRow: 2, gridColumn: 1, gridColumnRange: 2 + (options.targetUseImages ? 1 : 0), marginBottom: { value: 20, unit: 'px' } },
                                  { text: options.headingTargetLists, styling: { bold: true } }, idService)
  ];

  if (options.srcUseImages) {
    if (options.targetUseImages) {
      section2Elements.push(...createImageTargets(options, idService));
    } else {
      if (options.targetListAlignment === 'row') {
        section2Elements.push(...createImageTargets(options, idService));
      } else {
        section2Elements.push(...createTargetGrid(options, idService));
      }
    }
  } else {
    section2Elements.push(...createTextRowTargets(options, idService));
  }

  const section2 = new Section({
    autoColumnSize: options.srcUseImages && !options.targetUseImages && options.targetListAlignment === 'grid',
    // eslint-disable-next-line no-nested-ternary
    gridColumnSizes: options.targetUseImages ?
      (options.imageSize === 'small' ?
        [{ value: 1, unit: 'fr' }, { value: 165, unit: 'px' }, { value: 165, unit: 'px' }] :
        [{ value: 1, unit: 'fr' }, { value: 215, unit: 'px' }, { value: 215, unit: 'px' }]) :
      [{ value: 1, unit: 'fr' }, { value: 165, unit: 'px' }]
  } as SectionProperties, idService);
  section2Elements.forEach(el => section2.addElement(el));

  // connect all target lists
  section2.connectAllDropLists();
  const targetLists: DropListElement[] =
    section2Elements.filter(el => el.type === 'drop-list') as DropListElement[];
  // connect all targets lists to startlist
  targetLists.forEach(el => {
    (el as DropListElement).connectedTo.push(startListEle.id);
  });
  // connect startlist to all target lists
  startListEle.connectedTo = targetLists.map(list => list.id);

  const section = new Section(undefined, idService);
  section1Elements.forEach(el => section.addElement(el));
  return [section, section2];
}

function createTextRowTargets(options: TwoPageTemplateOptions, idService: IDService): PositionedUIElement[] {
  const elements: PositionedUIElement[] = [];
  options.targetLabels.forEach((label: string, i: number) => {
    const droplistEl = TemplateService.createElement(
      'drop-list', { gridRow: 4 + i * 2 - (options.labelsBelow ? 1 : 0), gridColumn: 1,
        marginBottom: { value: options.labelsBelow ? 5 : 20, unit: 'px' } },
      {
        dimensions: { minHeight: 58 } as DimensionProperties,
        orientation: 'vertical',
        onlyOneItem: true,
        allowReplacement: true,
        highlightReceivingDropList: true
      }, idService);
    if (!options.labelsBelow) elements.push(droplistEl);
    elements.push(TemplateService.createElement(
      'text',
      {
        gridRow: (3 + i * 2) + (options.labelsBelow ? 1 : 0),
        gridColumn: 1,
        marginBottom: { value: options.labelsBelow ? 20 : 5, unit: 'px' }
      }, { text: label }, idService)
    );
    if (options.labelsBelow) elements.push(droplistEl);
  });
  elements.push(TemplateService.createElement(
    'text',
    {
      gridRow: 3 + options.targetLabels.length * 2,
      gridColumn: 1,
      gridColumnRange: 2 + (options.targetUseImages ? 1 : 0)
    },
    { text: options.text3, styling: { fontSize: 14 } },
    idService)
  );
  return elements;
}

function createImageTargets(options: TwoPageTemplateOptions, idService: IDService): PositionedUIElement[] {
  const elements: PositionedUIElement[] = [];
  options.targetLabels.forEach((label: string, i: number) => {
    if (options.targetUseImages) {
      elements.push(TemplateService.createElement(
        'image', { gridRow: 3 + i, gridColumn: 2 }, { src: label }, idService)
      );
    } else {
      elements.push(TemplateService.createElement(
        'text', { gridRow: 3 + i, gridColumn: 1 }, { text: label }, idService)
      );
    }
    elements.push(TemplateService.createElement(
      'drop-list', { gridRow: 3 + i, gridColumn: 2 + (options.targetUseImages ? 1 : 0), marginBottom: { value: 5, unit: 'px' } },
      {
        dimensions: { minHeight: options.imageSize === 'small' ? 167 : 217 } as DimensionProperties,
        onlyOneItem: true,
        allowReplacement: true,
        highlightReceivingDropList: true
      }, idService)
    );
  });
  elements.push(TemplateService.createElement(
    'text',
    {
      gridRow: options.targetLabels.length + 3,
      gridColumn: 1,
      gridColumnRange: 2 + (options.targetUseImages ? 1 : 0)
    },
    { text: options.text3 },
    idService)
  );
  return elements;
}

function createTargetGrid(options: TwoPageTemplateOptions, idService: IDService): PositionedUIElement[] {
  const elements: PositionedUIElement[] = [];
  options.targetLabels.forEach((label: string, i: number) => {
    elements.push(TemplateService.createElement(
      'text', { gridRow: (Math.floor(i / 2) * 2 + 3), gridColumn: (i % 2) + 1 }, { text: label }, idService)
    );
    elements.push(TemplateService.createElement(
      'drop-list', { gridRow: (Math.floor(i / 2) * 2 + 4), gridColumn: (i % 2) + 1 },
      {
        dimensions: { minHeight: 58 } as DimensionProperties,
        orientation: 'vertical',
        onlyOneItem: true,
        allowReplacement: true,
        highlightReceivingDropList: true
      }, idService)
    );
  });
  elements.push(TemplateService.createElement(
    'text',
    {
      gridRow: options.targetLabels.length + 3 + (options.targetLabels.length % 2),
      gridColumn: 1,
      gridColumnRange: 2
    },
    { text: options.text3 },
    idService)
  );
  return elements;
}

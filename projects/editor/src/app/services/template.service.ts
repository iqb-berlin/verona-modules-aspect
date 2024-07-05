import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RadioWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/radio.dialog.component';
import { ElementFactory } from 'common/util/element.factory';
import { PositionProperties, PropertyGroupGenerators } from 'common/models/elements/property-group-interfaces';
import { Section, SectionProperties } from 'common/models/section';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { IDService } from 'editor/src/app/services/id.service';
import { TextLabel } from 'common/models/elements/label-interfaces';
import { PositionedUIElement, UIElement, UIElementType } from 'common/models/elements/element';
import { TextWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/text.dialog.component';
import { LikertWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/likert.dialog.component';
import { InputWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/input.dialog.component';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  readonly dialog = inject(MatDialog);

  constructor(private unitService: UnitService, private idService: IDService) { }

  async applyTemplate(templateName: string) {
    const templateSection: Section = await this.createTemplateSection(templateName);
    this.unitService.getSelectedPage().addSection(templateSection);
  }

  private createTemplateSection(templateName: string): Promise<Section> {
    return new Promise(resolve => {
      switch (templateName) {
        case 'text':
          this.dialog.open(TextWizardDialogComponent, {})
            .afterClosed().subscribe((result: {
              text1: string,
              text2: string,
              highlightableOrange: boolean,
              highlightableTurquoise: boolean,
              highlightableYellow: boolean
            }) => {
              if (result) resolve(this.createTextSection(result));
            });
          break;
        case 'input':
          this.dialog.open(InputWizardDialogComponent, {})
            .afterClosed().subscribe((result: {
              text: string,
              answerCount: number,
              useTextAreas: boolean,
              numbering: 'latin' | 'decimal' | 'bullets' | 'none',
              fieldLength: 'very-small' | 'small' | 'medium' | 'large',
              expectedCharsCount: number
            }) => {
              if (result) resolve(this.createInputSection(result));
            });
          break;
        case 'radio':
          this.dialog.open(RadioWizardDialogComponent, {})
            .afterClosed().subscribe((result: { label1: string, label2: string, options: TextLabel[] }) => {
              if (result) resolve(this.createRadioSection(result));
            });
          break;
        case 'likert':
          this.dialog.open(LikertWizardDialogComponent, {})
            .afterClosed().subscribe(() => {
              resolve(this.createLikertSection());
            });
          break;
        default:
          throw Error(`Template name not found: ${templateName}`);
      }
    });
  }

  private createTextSection(config: { text1: string, text2: string,
    highlightableOrange: boolean, highlightableTurquoise: boolean, highlightableYellow: boolean }): Section {
    return new Section({
      elements: [
        this.createElement(
          'text',
          { gridRow: 1, gridColumn: 1, marginBottom: { value: 30, unit: 'px' } },
          {
            text: config.text1,
            highlightableOrange: config.highlightableOrange,
            highlightableTurquoise: config.highlightableTurquoise,
            highlightableYellow: config.highlightableYellow
          }),
        this.createElement(
          'text',
          { gridRow: 2, gridColumn: 1 },
          { text: config.text2, styling: { fontSize: 16 } }
        )
      ]
    } as SectionProperties);
  }

  private createInputSection(config: { text: string, answerCount: number, useTextAreas: boolean,
    numbering: 'latin' | 'decimal' | 'bullets' | 'none', fieldLength: 'very-small' | 'small' | 'medium' | 'large',
    expectedCharsCount: number }): Section {
    const useNumbering = config.answerCount > 1 && config.numbering !== 'none';

    const sectionElements: UIElement[] = [
      this.createElement(
        'text',
        {
          gridRow: 1,
          gridColumn: 1,
          gridColumnRange: useNumbering ? 2 : 1,
          marginBottom: { value: config.useTextAreas ? 10 : 0, unit: 'px' }
        },
        { text: config.text }
      )
    ];

    const numberingChars : string[] = TemplateService.prepareNumberingChars(config.answerCount, config.numbering);
    for (let i = 0; i < config.answerCount; i++) {
      if (useNumbering) {
        sectionElements.push(
          this.createElement(
            'text',
            { gridRow: i + 2, gridColumn: 1 },
            { text: config.numbering !== 'bullets' ? `${numberingChars[i]})` : '&#x2022;' }
          )
        );
      }
      let marginBottom = config.useTextAreas ? -6 : -25;
      if (i === config.answerCount - 1) marginBottom = config.useTextAreas ? 10 : 0;
      sectionElements.push(
        this.createElement(
          config.useTextAreas ? 'text-area' : 'text-field',
          {
            gridRow: i + 2,
            gridColumn: useNumbering ? 2 : 1,
            marginBottom: { value: marginBottom, unit: 'px' }
          },
          {
            dimensions: {
              maxWidth: TemplateService.getWidth(config.fieldLength)
            },
            ...!config.useTextAreas ? {
              showSoftwareKeyboard: true,
              addInputAssistanceToKeyboard: true
            } : {
              showSoftwareKeyboard: true,
              addInputAssistanceToKeyboard: true,
              hasDynamicRowCount: true,
              expectedCharactersCount: config.expectedCharsCount * 1.5 || 136
            }
          }
        )
      );
    }

    return new Section({
      elements: sectionElements,
      ...useNumbering && { autoColumnSize: false },
      ...useNumbering && { gridColumnSizes: [{ value: 25, unit: 'px' }, { value: 1, unit: 'fr' }] }
    } as SectionProperties);
  }

  private static prepareNumberingChars(answerCount: number,
                                       numbering: 'latin' | 'decimal' | 'bullets' | 'none'): string[] {
    const latinChars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
    switch (numbering) {
      case 'latin': return latinChars.slice(0, answerCount);
      case 'decimal': return Array.from(Array(answerCount).keys()).map(char => String(char + 1));
      default: throw Error(`Unexpected numbering: ${numbering}`);
    }
  }

  private static getWidth(length: 'very-small' | 'small' | 'medium' | 'large'): number {
    switch (length) {
      case 'large': return 750;
      case 'medium': return 500;
      case 'small': return 250;
      case 'very-small': return 75;
      default: throw Error(`Unexpected length: ${length}`);
    }
  }

  private createRadioSection(config: { label1: string, label2: string, options: TextLabel[] }): Section {
    return new Section({
      elements: [
        this.createElement(
          'text',
          { gridRow: 1, gridColumn: 1, marginBottom: { value: 10, unit: 'px' } },
          { text: config.label1 }),
        this.createElement(
          'radio',
          { gridRow: 2, gridColumn: 1, marginBottom: { value: 30, unit: 'px' } },
          { label: config.label2, options: config.options })
      ]
    } as SectionProperties);
  }

  private createLikertSection(): Section {
    return new Section({
      // elements: []
    } as SectionProperties);
  }

  private createElement(elType: UIElementType, coords: Partial<PositionProperties>,
                        params?: Record<string, any>): PositionedUIElement {
    return ElementFactory.createElement({
      type: elType,
      id: this.idService.getAndRegisterNewID(elType),
      position: PropertyGroupGenerators.generatePositionProps(coords),
      ...params
    }) as PositionedUIElement;
  }
}

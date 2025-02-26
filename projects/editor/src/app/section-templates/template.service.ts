import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RadioWizardDialogComponent } from 'editor/src/app/section-templates/dialogs/radio/radio.dialog.component';
import { ElementFactory } from 'common/util/element.factory';
import { PositionProperties, PropertyGroupGenerators } from 'common/models/elements/property-group-interfaces';
import { Section } from 'common/models/section';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { IDService } from 'editor/src/app/services/id.service';
import { UIElement } from 'common/models/elements/element';
import { LikertWizardDialogComponent } from 'editor/src/app/section-templates/dialogs/likert.dialog.component';
import { InputWizardDialogComponent } from 'editor/src/app/section-templates/dialogs/text-input.dialog.component';
import { MarkingPanelDialogComponent } from 'editor/src/app/section-templates/dialogs/marking-panel.dialog.component';
import { GeometryWizardDialogComponent } from 'editor/src/app/section-templates/dialogs/geometry.dialog.component';
import { DroplistWizardDialogComponent } from 'editor/src/app/section-templates/dialogs/droplist.dialog.component';
import { MathTableWizardDialogComponent } from 'editor/src/app/section-templates/dialogs/mathtable.dialog.component';
import { Text3WizardDialogComponent } from 'editor/src/app/section-templates/dialogs/text3.dialog.component';
import { CheckboxWizardDialogComponent } from 'editor/src/app/section-templates/dialogs/checkbox.dialog.component';
import { SelectionService } from 'editor/src/app/services/selection.service';
import {
  PositionedUIElement, TextImageLabel, UIElementType
} from 'common/interfaces';
import { Page, PageProperties } from 'common/models/page';
import * as TextBuilders from 'editor/src/app/section-templates/builders/text-builders';
import * as TextInputBuilders from 'editor/src/app/section-templates/builders/text-input-builders';
import * as RadioBuilders from 'editor/src/app/section-templates/builders/radio-builders';
import * as CheckboxBuilders from 'editor/src/app/section-templates/builders/checkbox-builders';
import * as DroplistBuilders from 'editor/src/app/section-templates/builders/droplist-builders';
import * as GeometryBuilders from 'editor/src/app/section-templates/builders/geometry-builders';
import * as MathtableBuilders from 'editor/src/app/section-templates/builders/mathtable-builders';
import * as StimulusBuilders from 'editor/src/app/section-templates/builders/stimulus/stimulus-builders';
import {
  ClassicTemplateOptions, SortTemplateOptions, TwoPageTemplateOptions
} from 'editor/src/app/section-templates/droplist-interfaces';
import {
  StimulusWizardDialogComponent
} from 'editor/src/app/section-templates/dialogs/stimulus/stimulus.dialog.component';
import {
  Audio1StimulusOptions, Audio2StimulusOptions,
  EmailStimulusOptions,
  MessageStimulusOptions,
  TextStimulusOptions
} from 'editor/src/app/section-templates/stimulus-interfaces';
import { ImageRadioOptions, TextRadioOptions } from 'editor/src/app/section-templates/radio-interfaces';
import { TextElement } from 'common/models/elements/text/text';
import { CONSTANTS } from './constants';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  readonly dialog = inject(MatDialog);

  constructor(private unitService: UnitService,
              private selectionService: SelectionService,
              private idService: IDService) { }

  static helpTooltipImageSrc = CONSTANTS.lightbulb;

  async applyTemplate(templateName: string) {
    const templateSections: Section | [Section, Section] = await this.createTemplateSections(templateName);

    const selectedPage = this.unitService.getSelectedPage();
    const selectedSectionIndex = this.selectionService.selectedSectionIndex;
    if (!Array.isArray(templateSections)) {
      TemplateService.addSectionToPage(templateSections, selectedPage, selectedSectionIndex);
    } else {
      const targetPage = selectedPage.alwaysVisible ? this.unitService.unit.pages[1] : selectedPage;
      if (!this.unitService.unit.pages[0].alwaysVisible) {
        this.createAlwaysVisiblePage();
      }
      TemplateService.addSectionToPage(templateSections[1], this.unitService.unit.pages[0], 0);
      TemplateService.addSectionToPage(templateSections[0], targetPage, selectedSectionIndex);
    }
    this.unitService.updateSectionCounter();
    this.unitService.updateUnitDefinition();
  }

  private createAlwaysVisiblePage(): void {
    this.unitService.unit.pages.push(new Page({ alwaysVisible: true } as PageProperties));
    this.unitService.unit.movePageToFront(this.unitService.unit.pages.length - 1);
    this.unitService.pageOrderChanged.next();
  }

  private static addSectionToPage(section: Section, page: Page, selectedSectionIndex: number): void {
    if (page.sections[selectedSectionIndex].isEmpty()) {
      page.replaceSection(selectedSectionIndex, section);
    } else {
      page.addSection(section);
    }
  }

  private createTemplateSections(templateName: string): Promise<Section | [Section, Section]> {
    return new Promise(resolve => {
      switch (templateName) {
        case 'stimulus':
          this.dialog.open(StimulusWizardDialogComponent, { autoFocus: 'dialog' })
            .afterClosed().subscribe(
              (result: {
                variant: 'text' | 'email' | 'message' | 'audio1' | 'audio2',
                options: TextStimulusOptions | EmailStimulusOptions | MessageStimulusOptions |
                Audio1StimulusOptions | Audio2StimulusOptions
              }) => {
                if (!result) return;
                switch (result.variant) {
                  case 'text':
                    resolve(StimulusBuilders.createTextSection(result.options as TextStimulusOptions, this.idService));
                    break;
                  case 'email':
                    resolve(StimulusBuilders.createEmailSection(result.options as EmailStimulusOptions,
                                                                this.idService));
                    break;
                  case 'message':
                    resolve(StimulusBuilders.createMessageSection(result.options as MessageStimulusOptions,
                                                                  this.idService));
                    break;
                  case 'audio1':
                    resolve(StimulusBuilders.createAudio1Section(result.options as Audio1StimulusOptions,
                                                                 this.idService));
                    break;
                  case 'audio2':
                    resolve(StimulusBuilders.createAudio2Section(result.options as Audio2StimulusOptions,
                                                                 this.idService));
                    break;
                  // no default
                }
              });
          break;
        case 'text2': {
          const availableTextElements = this.unitService.unit.getAllElements('text') as TextElement[];
          this.dialog.open(MarkingPanelDialogComponent,
                           { data: { availableTextIDs: availableTextElements.map(text => text.alias) } })
            .afterClosed()
            .subscribe((result: {
              text1: string, showHelper: boolean, markingMode: 'word' | 'range', connectedText: string | undefined
            }) => {
              if (result) {
                const createdSection =
                  TextBuilders.createText2Section(result.text1, result.showHelper, result.markingMode, this.idService);
                // This connects an existing text element to the created marking panel
                if (result.connectedText) {
                  const createdMarkingPanelID = createdSection.getAllElements('marking-panel')[0].id;
                  availableTextElements
                    .filter((el: UIElement) => el.alias === result.connectedText)[0]
                    .markingPanels.push(createdMarkingPanelID);
                }
                resolve(createdSection);
              }
            });
          break;
        }
        case 'text3':
          this.dialog.open(Text3WizardDialogComponent, {})
            .afterClosed().subscribe(
              (result: { text1: string, text2: string, text3: string, text4: string, text5: string }) => {
                if (result) {
                  resolve(TextBuilders.createText3Section(result.text1, result.text2, result.text3,
                                                          result.text4, result.text5, this.idService));
                }
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
              expectedCharsCount: number,
              useMathFields: boolean,
              numberingWithText: boolean,
              subQuestions: string[]
            }) => {
              if (result) resolve(TextInputBuilders.createInputSection(result, this.idService));
            });
          break;
        case 'radio':
          this.dialog.open(RadioWizardDialogComponent, {})
            .afterClosed().subscribe((result: {
              variant: 'text' | 'image',
              options: TextRadioOptions | ImageRadioOptions
            }) => {
              if (!result) return;
              switch (result.variant) {
                case 'text':
                  resolve(RadioBuilders.createTextRadioSection(result.options as TextRadioOptions, this.idService));
                  break;
                case 'image':
                  resolve(RadioBuilders.createImageRadioSection(result.options as ImageRadioOptions, this.idService));
                // no default
              }
            });
          break;
        case 'likert':
          this.dialog.open(LikertWizardDialogComponent, {})
            .afterClosed().subscribe((result: {
              text1: string, text2: string, options: TextImageLabel[], rows: TextImageLabel[] }) => {
              if (result) {
                resolve(RadioBuilders.createLikertSection(result.text1, result.text2, result.options, result.rows,
                                                          this.idService));
              }
            });
          break;
        case 'checkbox':
          this.dialog.open(CheckboxWizardDialogComponent, {})
            .afterClosed().subscribe((result: { text1: string, options: string[], useImages: boolean }) => {
              if (result) {
                resolve(CheckboxBuilders.createCheckboxSection(result.text1, result.options, result.useImages, this.idService));
              }
            });
          break;
        case 'geometry':
          this.dialog.open(GeometryWizardDialogComponent, {})
            .afterClosed().subscribe((result: { text: string, geometryAppDefinition: string, geometryFileName: string,
              showHelper: boolean }) => {
              if (result) {
                resolve(GeometryBuilders.createGeometrySection(result.text, result.geometryAppDefinition,
                                                               result.geometryFileName, result.showHelper,
                                                               this.idService));
              }
            });
          break;
        case 'mathtable':
          this.dialog.open(MathTableWizardDialogComponent, {})
            .afterClosed().subscribe((result: {
              operation: 'addition' | 'subtraction' | 'multiplication', terms: string[] }) => {
              if (result) {
                resolve(MathtableBuilders.createMathTableSection(result.operation, result.terms, this.idService));
              }
            });
          break;
        case 'droplist':
          this.dialog.open(DroplistWizardDialogComponent, { autoFocus: false })
            .afterClosed().subscribe((result: {
              variant: 'classic' | '2pages' | 'sort',
              options: ClassicTemplateOptions | SortTemplateOptions | TwoPageTemplateOptions
            }) => {
              if (!result) return;
              switch (result.variant) {
                case 'classic':
                  resolve(DroplistBuilders.createDroplistSection(result.options as ClassicTemplateOptions, this.idService));
                  break;
                case 'sort':
                  resolve(DroplistBuilders.createSortlistSection(result.options as SortTemplateOptions, this.idService));
                  break;
                case '2pages':
                  resolve(DroplistBuilders.createTwopageSection(result.options as TwoPageTemplateOptions, this.idService));
                // no default
              }
            });
          break;
        default:
          throw Error(`Template name not found: ${templateName}`);
      }
    });
  }

  static createElement(elType: UIElementType, coords: Partial<PositionProperties>,
                       params: Partial<UIElement>, idService: IDService): PositionedUIElement {
    return ElementFactory.createElement({
      type: elType,
      position: PropertyGroupGenerators.generatePositionProps(coords),
      ...params
    }, idService) as PositionedUIElement;
  }
}

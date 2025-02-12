import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RadioWizardDialogComponent } from 'editor/src/app/section-templates/dialogs/radio.dialog.component';
import { ElementFactory } from 'common/util/element.factory';
import { PositionProperties, PropertyGroupGenerators } from 'common/models/elements/property-group-interfaces';
import { Section } from 'common/models/section';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { IDService } from 'editor/src/app/services/id.service';
import { UIElement } from 'common/models/elements/element';
import { TextWizardDialogComponent } from 'editor/src/app/section-templates/dialogs/text.dialog.component';
import { LikertWizardDialogComponent } from 'editor/src/app/section-templates/dialogs/likert.dialog.component';
import { InputWizardDialogComponent } from 'editor/src/app/section-templates/dialogs/input.dialog.component';
import { RadioImagesWizardDialogComponent } from 'editor/src/app/section-templates/dialogs/radio2.dialog.component';
import { Text2WizardDialogComponent } from 'editor/src/app/section-templates/dialogs/text2.dialog.component';
import { AudioWizardDialogComponent } from 'editor/src/app/section-templates/dialogs/audio.dialog.component';
import { GeometryWizardDialogComponent } from 'editor/src/app/section-templates/dialogs/geometry.dialog.component';
import { DroplistWizardDialogComponent } from 'editor/src/app/section-templates/dialogs/droplist.dialog.component';
import { MathTableWizardDialogComponent } from 'editor/src/app/section-templates/dialogs/mathtable.dialog.component';
import { Text3WizardDialogComponent } from 'editor/src/app/section-templates/dialogs/text3.dialog.component';
import { SelectionService } from 'editor/src/app/services/selection.service';
import {
  DragNDropValueObject, PositionedUIElement, TextImageLabel, TextLabel, UIElementType
} from 'common/interfaces';
import * as TextBuilders from 'editor/src/app/section-templates/builders/text-builders';
import * as TextInputBuilders from 'editor/src/app/section-templates/builders/text-input-builders';
import * as RadioBuilders from 'editor/src/app/section-templates/builders/radio-builders';
import * as DroplistBuilders from 'editor/src/app/section-templates/builders/droplist-builders';
import * as AudioBuilders from 'editor/src/app/section-templates/builders/audio-builders';
import * as GeometryBuilders from 'editor/src/app/section-templates/builders/geometry-builders';
import * as MathtableBuilders from 'editor/src/app/section-templates/builders/mathtable-builders';
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

  async applySectionTemplate(templateName: string) {
    const templateSection: Section = await this.createTemplateSection(templateName);

    const selectedPage = this.unitService.getSelectedPage();
    const selectedSectionIndex = this.selectionService.selectedSectionIndex;
    if (this.unitService.getSelectedSection().isEmpty()) {
      selectedPage.replaceSection(selectedSectionIndex, templateSection);
    } else {
      selectedPage.addSection(templateSection, selectedSectionIndex + 1);
    }
    this.unitService.updateSectionCounter();
    this.unitService.updateUnitDefinition();
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
              if (result) {
                resolve(TextBuilders.createTextSection(result.text1, result.text2, result.highlightableOrange,
                                                       result.highlightableTurquoise, result.highlightableYellow,
                                                       this.idService));
              }
            });
          break;
        case 'text2':
          this.dialog.open(Text2WizardDialogComponent, {})
            .afterClosed().subscribe((result: { text1: string, showHelper: boolean }) => {
              if (result) resolve(TextBuilders.createText2Section(result.text1, result.showHelper, this.idService));
            });
          break;
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
              expectedCharsCount: number
            }) => {
              if (result) resolve(TextInputBuilders.createInputSection(result, this.idService));
            });
          break;
        case 'radio':
          this.dialog.open(RadioWizardDialogComponent, {})
            .afterClosed().subscribe((result: { label1: string, label2: string, options: TextLabel[] }) => {
              if (result) {
                resolve(RadioBuilders.createRadioSection(result.label1, result.label2, result.options, this.idService));
              }
            });
          break;
        case 'radio_images':
          this.dialog.open(RadioImagesWizardDialogComponent, {})
            .afterClosed().subscribe((result: { label1: string, options: TextLabel[], itemsPerRow: number }) => {
              if (result) {
                resolve(RadioBuilders.createRadioImagesSection(result.label1, result.options, result.itemsPerRow,
                                                               this.idService));
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
        case 'audio':
          this.dialog.open(AudioWizardDialogComponent, { autoFocus: false })
            .afterClosed().subscribe((result: {
              variant: 'a' | 'b', src1: string, fileName1: string, maxRuns1: number, src2: string, fileName2: string,
              maxRuns2: number, lang: 'german' | 'english' | 'french', text: string, text2: string }) => {
              if (result?.variant === 'a') {
                resolve(AudioBuilders.createAudioSectionA(result.src1, result.fileName1, result.maxRuns1,
                                                          result.text2, this.idService));
              }
              if (result?.variant === 'b') {
                resolve(AudioBuilders.createAudioSectionB(result.src1, result.fileName1, result.maxRuns1, result.src2,
                                                          result.fileName2, result.maxRuns2, result.lang, result.text,
                                                          result.text2, this.idService));
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
              variant: 'classic' | 'sort', alignment: 'column' | 'row', text1: string, headingSourceList: string,
              options: DragNDropValueObject[], optionLength: 'long' | 'medium' | 'short' | 'very-short',
              headingTargetLists: string, targetLength: 'medium' | 'short' | 'very-short',
              targetLabels: TextLabel[], numbering: boolean }) => {
              if (result?.variant === 'classic') {
                resolve(DroplistBuilders.createDroplistSection(result.alignment, result.text1, result.headingSourceList,
                                                               result.options, result.optionLength,
                                                               result.headingTargetLists, result.targetLength,
                                                               result.targetLabels, this.idService));
              }
              if (result?.variant === 'sort') {
                resolve(DroplistBuilders.createSortlistSection(result.text1, result.options, result.optionLength,
                                                               result.numbering, this.idService));
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

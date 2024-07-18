/* Linter is disabled because most methods have very long signatures and folding the methods
   does not work properly with the wanted format. */
/* eslint @typescript-eslint/brace-style: OFF */

import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RadioWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/radio.dialog.component';
import { ElementFactory } from 'common/util/element.factory';
import {
  DimensionProperties, PlayerProperties,
  PositionProperties,
  PropertyGroupGenerators
} from 'common/models/elements/property-group-interfaces';
import { Section, SectionProperties } from 'common/models/section';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { IDService } from 'editor/src/app/services/id.service';
import { DragNDropValueObject, TextImageLabel, TextLabel } from 'common/models/elements/label-interfaces';
import { PositionedUIElement, UIElement, UIElementType } from 'common/models/elements/element';
import { TextWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/text.dialog.component';
import { LikertWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/likert.dialog.component';
import { InputWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/input.dialog.component';
import { RadioImagesWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/radio2.dialog.component';
import { Text2WizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/text2.dialog.component';
import { LikertRowElement, LikertRowProperties } from 'common/models/elements/compound-elements/likert/likert-row';
import { AudioWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/audio.dialog.component';
import { GeometryWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/geometry.dialog.component';
import { DroplistWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/droplist.dialog.component';
import { MathTableWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/mathtable.dialog.component';
import { SelectionService } from 'editor/src/app/services/selection.service';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  readonly dialog = inject(MatDialog);

  constructor(private unitService: UnitService,
              private selectionService: SelectionService,
              private idService: IDService) { }

  static tooltipSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAABKCAYAAAAG7CL/AAABhWlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw1AUhU9TtaIVBzuIOGSoLloQFXGUKhbBQmkrtOpg8tI/aNKQpLg4Cq4FB38Wqw4uzro6uAqC4A+Io5OToouUeF9SaBHjhcf7OO+ew3v3AUK9zFSzYwJQNctIxqJiJrsqBl7hQxd64ceYxEw9nlpMw7O+7qmb6i7Cs7z7/qw+JWcywCcSzzHdsIg3iGc2LZ3zPnGIFSWF+Jx43KALEj9yXXb5jXPBYYFnhox0cp44RCwW2lhuY1Y0VOJp4rCiapQvZFxWOG9xVstV1rwnf2Ewp62kuE5rGDEsIY4ERMioooQyLERo10gxkaTzqId/yPEnyCWTqwRGjgVUoEJy/OB/8Hu2Zn5q0k0KRoHOF9v+GAECu0CjZtvfx7bdOAH8z8CV1vJX6sDsJ+m1lhY+Avq3gYvrlibvAZc7wOCTLhmSI/lpCfk88H5G35QFBm6BnjV3bs1znD4AaZrV8g1wcAiMFih73ePd3e1z+7enOb8fLtxyjG2CMSAAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQfmAQYQGwCh0ky5AAATlElEQVR42u2ce3RV1Z3HP/uccx9Jbh6QBAiQEAQEREQkCDUVC3S0VcdH21EcB2tbZtpaS9th0VZrK3ZYTseuLuuasXUqVu3DtlqhC20VpwgFqgLykGcSHuF1Q8g7N/d9zzl7/rgn9557cm8g4Wln9lp7cck9OY/v/j2+v+9vnwgppeQSHoFAgKKiogt+XYVLfPj9/oty3UsaGMMw6Onp+X9gnKOjo4OSkpL/S8DIHJ8zx9GjR6moqPi/AIwTENP22Zq2XNDa2orP5zuDc9rnh9Zi0g8RjUYscHqnBJH8zjQNpJQIIU5zng+1xdgfovfBdZ57bgVSJgDDNpPfd3d3UV5enuVUfc+Vew5+aBcelKR1CKHT1OTHNKOoqmqtkQIkP/v9J6iqqrT9rrAsiizAYDuGzOMRl6LF2FfPtCxCB+IIEaew0EssFgBi1kxYU6e1tYXS0iEOEOznNHJMM8vxl4zFyCzg9IKipx5+5MihRCKd5OcLa41cqakoEk0T1oOKLEHbEZtQrONU25rLQVvOeQJGOKzFDkjcmgmqqsro6WmjtNRr3Upy1U1Tx+fzWMeptofGBrJpndO0XVNxLIoyaLfSzq8LZbpP2mWSwIwZU0ow2AmUWQDogIGuQ2VlmXWsak3hsBjd5j69D6/ZPossMWcAS3tui0h7MOwFJWEDJZoBjGkmSCR0PB639fAu6+Fcts+qw2rMHDHF7opux++Li+lKzlRp2NzHDkovMDqKYuLxiIw0nX5g3bo9xQGM02KkLbbYP6u2c4qLFXxzgWJ3n0xQ0kFTOFwPhwsqtukMvtncSLU+9x6jOlL+BQMmV0pOOABJOIKl4ogHiuPG7cApjusZtu/t51IcLnZRLMYZmpyBNp4DFGFzDSUFiJRgGCbxeALTNBECXC4Nl0tDiGzgO4HpPa/zuwvOY0SWuJCwuYt96tZxauoBpBR0dAQ5ePAY+/cfYteuenbvbsDvP0UoFMbl0hgxooxp0yZRUzOF6dMnMXFiFXl5WpYiVOTgNmcOipQSXddxuVxnk5Wkw6yNLFYSt/EXUoC0tQXYvn0/a9Zs4ve/f5Njx5qTay4EqirQNBVNE4QjOoZhppdBwE03XceXv/wPzJ07g8JCT5bg6wG8QL41vbbsJHLGme7ubnbv3s2sWbPOAhhpr1fMHPGk133MVEBsbu5k1aq1PPnkC2DGuO2Ts7lm2jgqRgyluDCf/HwveV43qqaiKgrBcIRTLV0c97exv8HPhvf28847u0kkDG6+uZZHHlnErFmTURRszNcF5FmzFxi3DZi+abuuro7Dhw9z4403omnaIHlMH1CMHOk4DUooFGf16r/w2GNPM3pEEV/90m3MnjGRkuICy/BkX4sXaTInhEA3JUdPhTh0tIVNf93JM8+sJBpL8MQTX2fRojvIz3fbMpLHYTEeW9pPA2OaJhs2bEAIwZw5c/rIGwMARmbJCrnImwEIDh7089hjP+Wll/7E448u5PP/dCPFvjyklLYQIHHegehDWAWGlJxoixKMGTQe8fPEE79ky9Y6vvWt+/nOd75AYWGedbDTajzWz9JELxQK8eqrrzJ9+nSmTp2a9WnVZcuWLRuYBGlk4SlRh6Uo7Nx5kAULlrJx4zZ+/vRi7v/Hj5PncYNpOoQ6G5fpk1lFCkBFQGGeRiiiU+DzMWvWlTQe8fOb37wFCGprr0HTVFt6Vx3MOQlKc/MpVqxYwR133MH48eMHUhLIHFZiz0D2YtAOStJS9u5t5O67l9DQcJQXn/kGd976EUuYs4MizzxpWFaDAMOU1J8IYQCnTrWx9JtPUVd/ghdfXM7ChbdaLuG23KjXcpJxZv/+Bt5+ex0LFy48ba/KAYzsR/8wbe5jjyu9AJmWThvgnnuWsnbtFp558svcd898FARIiTSlTYUbJENA0BmM03gqgsulsG/fIR5c/EPyCwpYv/4FJk++zLKYXmC8gJd3332fcDjKDTd8zAqy4kyFqmxKm+HQUexWErEFW92SKwUrVrzK2rVb+MLC+dzzmRvOHSikY1JxgQuXCrpucsWUcXz7m/fR0tLJT37yO3TddLi8SSIRY/jwYcyfP89ytzOqrk2ZXVSyEyXToafEHIE2Sd4aGvxcffWn0VTBxjeeYNKE0SBNpMnZg+KIzi2dMY62hnG5VCQGy5b9N39+ezs7dqziqqsut+KLx2Y1/aftLBYjbL4uHWA4KX48C1cxUqdas+Zd4nGDf/7sTVw+flTSUlLx5OwoupM2DCl0IUiWEaqqcecdczFNyeuvr0dKkaXgHFjdpJyZ0GR3J91W8qcLvUhE56WXXgfg9ptnowjLQjKY+eDFaedwqQKfV8MwJIZuMm5cJb4CDy+8sJKurlA/PSc5AGDEmahczkJOZkiKx4+3sG3bPqorh1ouZMs+g1TRTkcjigs0TFNiGBKfr4CamskcOHCM+vojNplzcC0VJfuPhEMg6u+zAmgcO9aMYRjc9snZFBXmpfs/56UnlgTY59WQUmJaYfLKK5O8ZO/eA46q3xwwSKniIBDoQUqT4uKiLHJgLp81UgVcU1MbUsI108YhEKRYgDyHhuIYXreCIgSmmQRn9KhhCCHYtasOKYXFoNNW3tjYSHd3CIHA4/VSVVVFfn5Bf8AICgt9bNy4ic7OdubNm0dhYUE/IpIzkKl0dgaQUjJ82JD09+cRFABNVXBpgrieDPLFxYUANDQ0YhiGlZrT+s3YsWOy1k39upIQCnPmzGHWtbN59tnn2LBhk8UJeqm1ZhOZ3Q7BWiEWSwDgdmuWlQ4eEdOU9AQjnK6ME0LiUpMil2lKS1SHjo5udN3IQk7NAQZf2xhRMYLFixej6yaPP/4fHD16HCkVm3rvts20Cu92J28qkdAHmHllZhEiYfWbm9myvYFNm/efNtaoikg9rBBJF3a7NZscMTgBS8t2MU3TmDdvHlOnXsnvfvcy5eWl3HrrLRQU2BtjWoYYXVxciBCCQCBs1YTyDCzD5Llf/xmXpjL3+qsYM7qc7kAy1c6fM421Gz4gGIriK/DmPoctlJlmkklWVAyz+uFOcV2mitzTCeT99q7Ly8t54IEHmDZtOj/72QoOHDhsy0qZjbDhw5M7E06cbE/772m8KRbXCQYj3PuZG9ix6xD+k+20tHYxcsRQAEaPLKO1rbtfl4vEDIQQCCAeiwMwfnw1qpqrtHHowTK7BSmnM1VFUZg0aSJf/eqDhMNhotF4ll4PVFUldz59sOcwpjQzNRXrwvG4znF/Wyq9ul0a3YEQiqLwyY/PYP1f96Db5ExFEcQSidT/T57qyLi7YFRPHS8EBEMRAC6/vDpLmyXb59yh8Ax3Owg0zcW0aVfj9eY5uE4vMCO54opxrN+4m2Ao6jDT5L8HDjdx+30/4pXVm9ANE1VVqKocRktrFx63i2gsjq/AS3NLJwBNJzsYUpTcUeU/2c67W+sz7qormEgapgChCDo6AgCMG1fliCt2i8nWXulrNYPYBmInf+mUV1SUz8KFn+bw0VaOHGvJqj1PnDCaT98ynW27mnnxt2uJxRLUzpzEur/uRkpJJBKjvKyYfXXH6Q6E2NdwnPKyIto6Ajz0b79gyqSqDCPsCeuASLqSgCNHmvB63VRXV+ZoAmbbMpJ9r80ggRGO/lBy3HLLXFRVYdvOgyBEH3fSVIX77p6HpkQYOXwojz/5Ml6vm6bmDtZt2k2e10Oe182smoks+vp/csXESrbvOsxvV27AV+BlzOj0DqtI3KAnqiOEQFEgEU+wdds+br55LiNGlNkW0M5ZZD+ZKtPtzwIYJ0mSTJp0GV/84r288oeNVizqu9tg9Mgyrpw8htKhhXx2wXx++fI69tYd599//AptHQF+9co6NryzhyVfuZPOriDRaJy7br+esWOG4/G6U2dr7YohZTIOCUWhubmdQ4eauPvuv7daIHaKoeVo8xo50/cAxXCnvBm1SZvJ8mDnznpmz76Tt1cvZ8ZV4yzpIbNm6g6EWf6j37L84YW43RqRaBxNVWluTcaWkcOHZghKe+uO0Xj0FLfeNNNK0ZKdh7pJGBJFEWgulT/+aSN/emMrb731a8rKih3tXfuOCdUx7T9LL7wyOBfKViokV2Dq1MtZuvRLvLJqI4a0cQWRBri4KJ/5c6axeVs9Qgjy8zy43RpVo8qpGlXeR2VrPNpMddWwNLDBBLGETN6BIggGQ6xatY6HH15MWVmpjaV7bNNOShVH79xZ1MmBACP7ASvdVlFVyaJFd7Hqje3UNRy3Yk1f6eH6j0xh9ZotqVKiv1F/qInhw0pSzLipPYoQEqEk49iba96hsmosn/jEfFsJ47J1Jj1k7pnRssSfTLcfUIyRfciQpO8WsARVVcP57ncX88zzbxDXdRBKH8JXkO9lbu1UPth75LTs+Li/laLCfAB6wgl6ogaKoqCogoOHTvD0T37P4sWL8PkKbLHF7Zh2UJyyiTI4HmOaBvX1DUQi4RzxxsyQQoVI8KlP/R2HT4T4n3U7U1zDuTLXXTuZ19/aktGj7sOOYzqapuJ2JauXlu5Yck0ViEaiPPfzP1BbO4vrr59ty5RaFiC0LPFFzSKtiDMDJhgMsnnzZiorR5Ofn99PujMzRPMhQ/L53vce5BsPP8ueumNgmT02txpS4qO6chhHT7TkvH4oEmVURSmmKQlGdNoD8WSBKCWrX9/Iho0fsGTJAxQWFuZotCkOQqrkcCNx5hbT09NDXV0d1147ywaKzAGKE5w4tbVX87kv3MuDS3/KcX+bFW8yXWru9Vex4Z296IZBS2sXR461EI+nK/RwOMbwsmL8J9t5a+N+2jsDIAS7dh/gv55+hbvuuo2PfeyjDmtR+3l4kSOZZLLRfoEpKCigpmYGqqqcpjsps/S2dVTV5CtfuRfNU8S3l71AZ3fI8qkkOKZhYhgmf3lnDzt3N+JyaYypLE9qOtaIJ3RKhxZRXFJCReUoSkoKicXivPCL11AUhSVLHrRUuGzuIlKbknJnUzHwIlJRnPtrc6XubKuTBKi8vJgf/OBbrH7zfZ79xZsYpkzS92MtbNqyn+LCfD53z3zyvG6GlPj67DpwuTRcHg8HmoJIKVGEgv9EC9u21bN06deZMWNGDvdJW0LuFzVy75k5Cx6jONQ9e8Czlwoms2dfzfe//68s/+HLHGxsIhCMoGkqc66bQnlZMTOmjaelrSvrVUdVlDJkWAWxRHKbmkTS3t6Fz+fj85//LKrqzpFtzq4zoQzuVxRH9HenesSZhCpJzVVV5f7772bsZdVs3d5AUWE+laPKbC7r5YbrpmbdjtPYHCYcT7d329u62L27gdtvv42xY8c7JFaNzC3zg5dXtTO3FpmlurZ/3wuU7hDLk8ePGDGcr33tX3hs+Q8YPbKMj9RMslKwTGkvztEVitPSFSMcjtJ4xM/77+9l175WKsdUM7tmEqrqymEZZ6/AawNzpd5Y46TTvUBlewNEpqystnY2x5s6+fbyVVw5oZRbb5zO5ZeNoqy0iLw8D5qqYEpJNBqnsytIQ+MpVq/dxeYtDUy4YiYTJ9/A9NpRHGk8YAVcJcc9ciGBsS6cIrtKlniTrWJNbzmtqqqmurqK8ePHcdfC+6ivP8Da3+zn0KFDdHe1oevJitnlLmDkqNFMmDCBa2fdzMyP3oMu1ZSUbJpYXQBxqQCDYx+YHaBeLqOR7Y22ZO9qKNdddx11dfUUFPioqamhpqYG0zDRDQPDSOq3qqqiqmoqmzT6u+gJx9NvKZgGkUgkRwF4bsYgX+TqDYb9Zae+L0yoqpsZM66htbWNeDyRCrBCUXC5XHi9XjweD5qmpUAxTEk8YaTWRAhIJOKEw+HzYimDtxj7jWS8hpeLE2SSp2HDRtDZ2UkikcDr9fZ7lYRucKw5QFw3Mgw1EU8QO88vLZ6jV/+yqXoiS30i8Hg8hMNhEolEv53GYDjOYX8Xvjw3ZSX5Gd/phk4oFOJ8/lkK7dyAcroAmLYql8uNaZok4omMYxO6STAcJ54wiMZ1VEUwpqIYr1ujtTPkuIKgp6fnNK8fX3RgBgaex+OxVt3IOEJVBYX5biQSRVGs1it9KL2U4Ha76TwVxDRNq2z50AKTWZgCRKOxTJ8WAkXLvvqamvnw3rx8QqFQqiV7CceYMx9J3QTaOroJhuMZncdcw6WpyV1rMpmVkjpv8LwCc8EtpqSkBFVVScRC+PLdp913ICUEQrFUupYyaW09PT0YDnf80ANTWlpKS0vLaRmIYUqaWnvoCcUz0nU8FiMQCKDr+t+OK/l8PiZPnszhw4f7TbfRmI6/JUCB18WYiuKU9fQy3/OVjS4aMJqmMW3aNHbu3Ek0Gs0hvktiCZ3Rw4oYWpyHx22VB1LS0tzErh1bWbJkSSpe/U0AI4SgtrYWv9/P/v37swZQRREU+7wpKUKaJu2n/Kz540p+9dyP+eKi+1i0aNF5S9Vwzl9IP7MRiUR46qmnePTRR1mwYAHz589n5MiR1i4oi93qOi0tLezbt4/169ezd+9eHnroIRYsWEBVVdV5dyVxsf7cm2EYbN26leeff56VK1cyfvx4pkyZQkFBAYFAgD179rBjx45U5nnvvfeYOXPmebUSRzq8uEPXdXny5En5yCOPSFVVpaqqsrCwMNV6EELIhQsXykAgcEHvS1wqfyCwvb2d1157jdbWVkpLS6murqa0tJTi4mIqKipSpcSFGv8LfyImffebTbQAAAAASUVORK5CYII=';

  async applyTemplate(templateName: string) {
    const templateSection: Section = await this.createTemplateSection(templateName);

    const selectedPage = this.unitService.getSelectedPage();
    const selectedSectionIndex = this.selectionService.selectedSectionIndex;
    if (this.unitService.getSelectedSection().isEmpty()) {
      selectedPage.replaceSection(selectedSectionIndex, templateSection);
    } else {
      selectedPage.addSection(templateSection, selectedSectionIndex + 1);
    }

    await this.unitService.updateUnitDefinition();
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
        case 'text2':
          this.dialog.open(Text2WizardDialogComponent, {})
            .afterClosed().subscribe((result: { text1: string, showHelper: boolean }) => {
              if (result) resolve(this.createText2Section(result));
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
        case 'radio_images':
          this.dialog.open(RadioImagesWizardDialogComponent, {})
            .afterClosed().subscribe((result: { label1: string, options: TextLabel[], itemsPerRow: number }) => {
              if (result) resolve(this.createRadioImagesSection(result));
            });
          break;
        case 'likert':
          this.dialog.open(LikertWizardDialogComponent, {})
            .afterClosed().subscribe((result: {
              text1: string, text2: string, options: TextImageLabel[], rows: TextImageLabel[] }) => {
              if (result) resolve(this.createLikertSection(result));
            });
          break;
        case 'audio':
          this.dialog.open(AudioWizardDialogComponent, { autoFocus: false })
            .afterClosed().subscribe((result: {
              variant: 'a' | 'b', src1: string, maxRuns1: number, src2: string, maxRuns2: number
              lang: 'german' | 'english' | 'french', text: string }) => {
              if (result.variant === 'a') resolve(this.createAudioSectionA(result));
              if (result.variant === 'b') resolve(this.createAudioSectionB(result));
            });
          break;
        case 'geometry':
          this.dialog.open(GeometryWizardDialogComponent, {})
            .afterClosed().subscribe((result: {
              text1: string, geometryAppDefinition: string, text2: string, showHelper: boolean }) => {
              if (result) resolve(this.createGeometrySection(result));
            });
          break;
        case 'mathtable':
          this.dialog.open(MathTableWizardDialogComponent, {})
            .afterClosed().subscribe((result: {
              operation: 'addition' | 'subtraction' | 'multiplication', terms: string[] }) => {
              if (result) resolve(this.createMathTableSection(result));
            });
          break;
        case 'droplist':
          this.dialog.open(DroplistWizardDialogComponent, { autoFocus: false })
            .afterClosed().subscribe((result: {
              variant: 'classic' | 'sort', alignment: 'column' | 'row', text1: string, headingSourceList: string,
              options: DragNDropValueObject[], optionLength: 'long' | 'medium' | 'short' | 'very-short',
              headingTargetLists: string, targetLength: 'medium' | 'short' | 'very-short',
              targetLabels: TextLabel[], numbering: boolean }) => {
              if (result.variant === 'classic') resolve(this.createDroplistSection(result));
              if (result.variant === 'sort') resolve(this.createSortlistSection(result));
            });
          break;
        default:
          throw Error(`Template name not found: ${templateName}`);
      }
    });
  }

  private createTextSection(config: { text1: string, text2: string,
    highlightableOrange: boolean, highlightableTurquoise: boolean, highlightableYellow: boolean }): Section
  {
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
          { text: config.text2, styling: { fontSize: 14, lineHeight: 100 } }
        )
      ]
    } as SectionProperties);
  }

  private createText2Section(config: { text1: string, showHelper: boolean }): Section {
    const sectionElements: UIElement[] = [
      this.createElement(
        'text',
        {
          gridRow: 1,
          gridColumn: 1,
          gridRowRange: config.showHelper ? 2 : 1,
          marginBottom: { value: 40, unit: 'px' }
        },
        {
          text: config.text1
        })
    ];
    if (config.showHelper) {
      sectionElements.push(
        this.createElement(
          'button',
          { gridRow: 1, gridColumn: 2 },
          {
            imageSrc: TemplateService.tooltipSrc,
            tooltipText: 'Drücke kurz auf den Knopf mit dem Stift. Drücke danach auf den Anfang ' +
              'eines Wortes. Halte gedrückt und ziehe im Text so weit, wie du markieren möchtest.',
            tooltipPosition: 'left'
          })
      );
    }
    return new Section({
      elements: sectionElements,
      ...config.showHelper && { autoColumnSize: false },
      ...config.showHelper && { gridColumnSizes: [{ value: 1, unit: 'fr' }, { value: 45, unit: 'px' }] }
    } as SectionProperties);
  }

  private createInputSection(config: { text: string, answerCount: number, useTextAreas: boolean,
    numbering: 'latin' | 'decimal' | 'bullets' | 'none', fieldLength: 'very-small' | 'small' | 'medium' | 'large',
    expectedCharsCount: number }): Section
  {
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
            { gridRow: i + 2, gridColumn: 1, marginTop: { value: 16, unit: 'px' } },
            { text: `${numberingChars[i]}` }
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
            } as DimensionProperties,
            ...!config.useTextAreas ? {
              showSoftwareKeyboard: true,
              addInputAssistanceToKeyboard: true,
              label: ''
            } : {
              showSoftwareKeyboard: true,
              addInputAssistanceToKeyboard: true,
              hasDynamicRowCount: true,
              expectedCharactersCount: Math.ceil(config.expectedCharsCount * 1.5) || 136,
              label: ''
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
    const latinChars = ['a)', 'b)', 'c)', 'd)', 'e)', 'f)', 'g)', 'h)', 'i)'];
    switch (numbering) {
      case 'latin': return latinChars.slice(0, answerCount);
      case 'decimal': return Array.from(Array(answerCount).keys()).map(char => `${String(char + 1)})`);
      case 'bullets': return Array(answerCount).fill('&#x2022;');
      case 'none': return [];
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

  private createRadioImagesSection(config: { label1: string, options: TextLabel[], itemsPerRow: number }): Section {
    return new Section({
      elements: [
        this.createElement(
          'text',
          { gridRow: 1, gridColumn: 1, marginBottom: { value: 5, unit: 'px' } },
          { text: config.label1 }),
        this.createElement(
          'radio-group-images',
          { gridRow: 2, gridColumn: 1 },
          { label: '', options: config.options, itemsPerRow: config.itemsPerRow })
      ]
    } as SectionProperties);
  }

  private createLikertSection(config: { text1: string, text2: string, options: TextImageLabel[],
    rows: TextImageLabel[] }): Section
  {
    return new Section({
      elements: [
        this.createElement(
          'text',
          { gridRow: 1, gridColumn: 1, marginBottom: { value: 10, unit: 'px' } },
          { text: config.text1 }),
        this.createElement(
          'likert',
          { gridRow: 2, gridColumn: 1, marginBottom: { value: 35, unit: 'px' } },
          {
            options: config.options,
            rows: config.rows.map(row => new LikertRowElement({
              id: this.idService.getAndRegisterNewID('likert-row'),
              rowLabel: {
                ...row
              },
              columnCount: config.options.length
            } as LikertRowProperties)),
            label: config.text2,
            label2: '',
            stickyHeader: true,
            firstColumnSizeRatio: 3
          })
      ]
    } as SectionProperties);
  }

  private createAudioSectionA(config: { src1: string, maxRuns1: number, src2: string, maxRuns2: number,
    lang: 'german' | 'english' | 'french' | undefined, text: string })
  {
    return new Section({
      elements: [
        this.createElement(
          'text',
          { gridRow: 1, gridColumn: 1, marginBottom: { value: 10, unit: 'px' } },
          { text: 'Drücke zuerst auf das Dreieck, dann startet der Hörtext.' }),
        this.createElement(
          'audio',
          { gridRow: 2, gridColumn: 1, marginBottom: { value: 15, unit: 'px' } },
          {
            dimensions: { maxWidth: 500 } as DimensionProperties,
            src: config.src1,
            player: {
              maxRuns: config.maxRuns1,
              showRestRuns: config.maxRuns1 > 1,
              ...TemplateService.getAudioSettings()
            } as PlayerProperties
          })
      ]
    } as SectionProperties);
  }

  private createAudioSectionB(config: { src1: string, maxRuns1: number, src2: string, maxRuns2: number, lang: 'german' | 'english' | 'french', text: string }) {
    return new Section({
      elements: [
        this.createElement(
          'text',
          { gridRow: 1, gridColumn: 1, marginBottom: { value: 10, unit: 'px' } },
          { text: `${TemplateService.getAudioTranslation(config.lang, 'instruction')}:` }),
        this.createElement(
          'audio',
          { gridRow: 2, gridColumn: 1, marginBottom: { value: 15, unit: 'px' } },
          {
            src: config.src1,
            dimensions: { maxWidth: 500 } as DimensionProperties,
            player: {
              maxRuns: config.maxRuns1,
              showRestRuns: config.maxRuns1 > 1,
              ...TemplateService.getAudioSettings()
            } as PlayerProperties
          }),
        this.createElement(
          'text',
          { gridRow: 3, gridColumn: 1, marginBottom: { value: 20, unit: 'px' } },
          { text: config.text }),
        this.createElement(
          'text',
          { gridRow: 4, gridColumn: 1, marginBottom: { value: 10, unit: 'px' } },
          { text: `${TemplateService.getAudioTranslation(config.lang, 'audio')}:` }),
        this.createElement(
          'audio',
          { gridRow: 5, gridColumn: 1, marginBottom: { value: 30, unit: 'px' } },
          {
            dimensions: { maxWidth: 500 } as DimensionProperties,
            src: config.src2,
            player: {
              maxRuns: config.maxRuns2,
              showRestRuns: config.maxRuns2 > 1,
              ...TemplateService.getAudioSettings()
            } as PlayerProperties
          })
      ]
    } as SectionProperties);
  }

  private static getAudioTranslation(lang: 'german' | 'english' | 'french', type: 'instruction' | 'audio'): string {
    switch (lang) {
      case 'german': return type === 'instruction' ? 'Instruktion' : 'Hörtext';
      case 'english': return type === 'instruction' ? 'instruction' : 'audio recording';
      case 'french': return type === 'instruction' ? 'l\'instruction ' : 'texte audio';
      default: throw Error();
    }
  }

  private static getAudioSettings(): Record<string, boolean | string | number> {
    return {
      muteControl: false,
      interactiveMuteControl: false,
      hintLabel: 'Bitte starten.',
      hintLabelDelay: 5000,
      minVolume: 0.2
    };
  }

  private createGeometrySection(config: { text1: string, geometryAppDefinition: string, text2: string, showHelper: boolean }) {
    const sectionElements: UIElement[] = [
      this.createElement(
        'text',
        { gridRow: 1, gridColumn: 1, marginBottom: { value: 20, unit: 'px' } },
        { text: config.text1 }),
      this.createElement(
        'geometry',
        { gridRow: 2, gridColumn: 1, marginBottom: { value: 30, unit: 'px' } },
        {
          appDefinition: config.geometryAppDefinition,
          enableShiftDragZoom: false,
          showZoomButtons: false,
          showFullscreenButton: false
        }),
      this.createElement(
        'text',
        { gridRow: 3, gridColumn: 1, marginBottom: { value: 30, unit: 'px' } },
        {
          text: 'Erstellt mit GeoGebra, https://www.geogebra.org (es gelten die GeoGebra-Lizenzbedingungen), ' +
            'Copyright Text, Grafik und Teilaufgaben: IQB e. V., Lizenz: Creative Commons (CC BY). Volltext ' +
            'unter: https://creativecommons.org/licenses/by/4.0/de/legalcode',
          styling: { fontSize: 14, lineHeight: 100 }
        })
    ];

    if (config.showHelper) {
      sectionElements.push(
        this.createElement(
          'button',
          { gridRow: 1, gridColumn: 2 },
          {
            imageSrc: TemplateService.tooltipSrc,
            tooltipText: 'Drücke jeweils auf die Stelle, wo eine Linie beginnen und wo sie enden soll. ' +
              'Zeichne Linie für Linie.',
            tooltipPosition: 'left'
          })
      );
    }

    return new Section({
      elements: sectionElements,
      ...config.showHelper && { autoColumnSize: false },
      ...config.showHelper && { gridColumnSizes: [{ value: 1, unit: 'fr' }, { value: 45, unit: 'px' }] }
    } as SectionProperties);
  }

  private createMathTableSection(config: { operation: 'addition' | 'subtraction' | 'multiplication', terms: string[] }) {
    const showTooltip = config.operation === 'subtraction';
    const text = config.operation === 'multiplication' ? '<p style="padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0" indentsize="20">Rechne schriftlich.</p><p style="padding-left: 0px; text-indent: 0px; margin-bottom: 10px; margin-top: 0" indent="0" indentsize="20"><strong>Tipp:</strong></p><p style="padding-left: 0px; text-indent: 0px; margin-bottom: 10px; margin-top: 0" indent="0" indentsize="20"><span style="font-size: 30px"><img style="display: inline-block; height: 1em; vertical-align: middle" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAATF3pUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjapZprdhw3soT/YxWzhMIzgeXgec7s4C5/vkC3aEqmLOmatLqb1VUFIDMyMgJlt//vv8f9h5/sQ3IpWy2tlIef1FILnQ/1ef30++qfdF/vTwzv7/z3x93HF4FDUWe+/qzlff634/7jBq+3zqf86UZ1vr8Y33/R0vv+9YcbvQeKmpEmsd43avNjyvcL/75Bfy3rKa3a5yWM/Xp/X/8KA/+cXua+9378e7Qf/05G9FbmYAxhRw7zGmJ9TSDqX3Kx88Hf1xD0KfI5xcIrX79nQkC+itPHT2NGR1NNX570XVY+Pvmvj7sfs5XC+5T4Q5DLx/uXx53PX2flhv7TyKm+P4Xvjw/Q+JrRD9HXv3NWPXfNrKKnQqjLe1HflnI/cd5gCA1dHVMrj/Evcwu7v43fCqonUFjPfAa/0zcfSNfxyS/f/fH7vk8/mWIK2wXjQwgzxHuwRgstzJvJpF9/gsUWV6xkcZL2yNHwMRd/h23PdHe0ysjLc2rw3MxzyR//uj+94ByVgvdP/YgV8wpBwWYaypxeOY2M+PMOar4B/vb744/yGslgVpRVIo3AjtctSOZfTBBvoiMnZt5fNehtvW9AiBia5BMKMkDWfMy++MdCMO8JZCVBnalTIWGQAZ9zWEwypBgLualBQ3OJ+XtqyIHDjuOQGZnI1JeRmxY7yUopgx9LFQz1HHPKOZdsueaWe4kllVxKsSJS7BYtOctWzKxas15jTTXXUq3W2mpvoUVIM7fSrNXWWu+M2blz5+rOCb2PMOJII7tRho062ugT+Mw08yzTZp1t9hVWXPDHKstWXW317TdQ2mnnXbbtutvuB6id6E46+ZRjp552+kfW3mn92+8fZM2/sxZupnSifWSNo2bfbuFFJ1k5I2HBJU/GTSkA0EE5e6pPKShzytnTAlWRA5PMytnyyhgZTNuHfPy33Lnwyqgy96/y5ix9l7fw/82cU+r+MHN/z9tXWVtqQ/Nm7FWFCuoTqT7O6aHyH73q7++upzCZKu3xZHWNQVA2k7fWVMO5jsMCew55pTastsfySVCet9wtp7kT2OrelQGtMpt8TvA51blCLCSnzTNyFKVVeiEhGvAtDY90ZD9S7zZ8rzNwVtjrFNfVOOazYtKIybpO4zUyR1+7SDi09ekLTxuZI/S6Z+kpc38imsgabaRwR5Y49qJXjE3k/YknjLNT6CW3BV4g9NZn28lKTAcerqNO8OK5iAa63bPBweDI6C2WgwTYY9fQd0+zpkOQ+8xnTvRFGimHp+QIK/vTPQiQyFDEaUffPvzTew+tAMcK4e/uqw2iFpncqsB6IgoaXeRY37GU2A4Im8toOnxLV6rkRjInsWyibWVtYM/MkAdrtxTqhAvbqYphfVypaZoRVH+nQCRT5r/np+9PKqWRDN1t6QC1Ev1yu6bCFBmLrFXJIUosUrewwo4DcAzw3Lat0k8nsRNdUzuzeepeOc7IIh5qrdkTtQouXEnhqJ3irMvC7rmesQgxK7vz+fqdDMwOsgkRLKIWjRjthayXM4fwuIqlEfYphUm0uEfiz2ZUIaWmldHaoI67Xu8sxL7ifJTfQnb49jXcfH4noR/v7tOBBIWlGUb1xAMVoj+JWm1ntrzWsDiszWJ95TH8SnGvtovtPUqZbtrxBZnAUmxkzoVdFlAcvYg0INmSXhA+YXEemrCtufohASWzxsZN60yurgmPMP5jvQEZOCqmseiJfZfVVwm5zTHn8mFb6IRkL1VKJSCfl+f40HzdPrVLDs9qfsKkHKJwIDGwymLns+1MkGeAcOwJYb3WWNCwinZwUMGNtbI2mUd809VH0J/fe3c/P8HnvftaodQAsqCaiCIwTxh2oJ7GI1jOekJrcx+3iOiEG6YRbGbeuIiwtq0KnFAlzBybQhhGp2ZHnAQTgqKXoeBQFAWKnN3Z2tQBMnFQwgoq4Spr0m/qyRRxawseT+1Za804PESS6lqP8Arz5pE1s7Pdsl3C4OwRYcBnL257QO3jdzXwb8zvaeSPnFBfZKr4dqDDoEIWcHdK5SwX925nZ7Ve7ryhN6iQwmxwOA0ijBGpimKeTECvkCEBbFR4VWWvbxFFjP5RIfz8/e83AvR5kxJEMnxL24j7LHD0CG40bLpIEZxy33sxqU0TQFm4fqjpVal7ekQV+1PZ/RDJug8asZMJW0Sl0ViGqVQqAY+E1e+9IQy6cssVzkZj9w0rndWAaj9xnWeuk/JRhZhXr8YE1F2jRDgjY+DQoDsV0bSgEdGQ0GMF/36uUkS6aSYBZ+a8SDCLqjse2i1NgyQjDqryCT/RZkU8VVbz0shPevnnd1gtLZ/HTCvME5S3frJZoa6McoT9trOZbdM6Y2PCtPOzW6bX+FHDhH48uiYuXC2tOXHRUadrVA8ddEscMJrvy6ZD86G66KnlGXbQIxkVgDPZg1aRF0zcWx4dkC/gsit8ZTAZxItOhPwZYTVi4tBPwrrs/QCRGdJoj+bwnLRRaQP1Q/MqEhkxZHiQsmHIjVLLFHVGIoHU7qT4miebM1bT+DOiyl7R4eCavwLkU1FkaMgZhRaWMYUWuexNea5Ikae+6DPdapyU4PlQDNPv1hWdkujMSMqabDjqBs07TKEGIlmUmohHY5KsceMOcVfK+ApDXJ1t0mH3zuRnwcv1oAytuLyRH/f+tYFx/CJdzQDlEe1majhmXWVkgyaBZLDsFxAgBVKu+yA5kS8OlJzb1fPzu9zqaxMOSMcnHLjzgsHQF59xAD4uErQLAhZ2xxdzeNZO2d27CCRl7HtOrcJRwNvdGy3SpndSe/K2eY+dwpAgL8ahT5uYsPp6AMRnULgfUZFRwlOir6RRBVBknMYO9DqYgE4kJc3liPHHDu35wmA7IJR+l8N2GJlhSR18ZA1PtM9Dj/Zws6MtbL9GI12J4NmcJc/Z0yZH68m07g1UMXfd1jqTtssCV/fXkaS1IYn4cL07jQZM7yShz96QYALpCIPa68EUBS6/1Lx/0TbdMyFHtBdUymyxJdOoeJiwos5FIHmSMpRGsAm9Rkl7aApOoQ7QHEwPeYsakYZieEMOFgRKVKbCExAtZw8a2gsAYBeFzN3O2UUwgDZfRdI3oM09OyjKw9fwd+zBpx6D/qvHcomLDG26maHWj4rkHKYdzwtzSbJipwspdPZ67GIIuXLH2FIbmepHIIlzD5Op9ewwrYaiM5LHkDG02GdKVqFSV3OFxjkjdYvDo2TGBCHI357xYavPhAxGr+wy0yi706IFOKbvpWtl/FBN4jGHHRidn0MXrwt9jyktNF961DwFnAThD8kTPYKCcs7EiuhvusQqc1Y/ZoWZXQADdLKaI+jGG/xTVPIJNfu81EFnH+AOjxOUNYgte9on/kEF+Vfovohco2ghDKY4sT4JipJ3TfRf5YYZMZ3A9TQvopxWh/STqhx1xKTGDlG1hh/AmtBYNd1SyTJ2APwM5YR2UNxFg+V52pIMV2FPNCMtE1Y9KYJBgpvPA8QQQJfwNMQpl1D7Gni3loOUv/erGXXWtt/Y24aXXCe/+f+J5Wd9Mz5naokygZ2WzbWQhUbCVWe1hECyA2aFPm5Fi7uNkHY/mhgJdFf8Zo3PxIfAAT1vZpRocVRjF5hQ1AeZpo3EP/URbqZ/ptCfMiiLN30LXdiYcPYLMWUAkgs85MxRTm9YqVsBI0UiG0HCPuMuk+FQqa/PhiYYxwGpEc7UviDhDltFP2mHXJyAe/mrY7OMr3s2PiwemZqmbaoLpJfdtKdBgb9wpN/eS6amaRNOi6Hy4IQxXiIF/fZgOyJS5NSK+tqgMI1RLWdNGL4fWjvWr+JwKHec/eNwBI05VOz3u2d2G9gzvBMkSY3mla55Su0f+6j7aSP9iaD6mZ5yaqIIkkS4IcSKJ94YDDUbnESrSdY3HZT8Qhmzyi2tikKh6cMoNSTkFvIgu0bPGaG3It2v/e+98cJw1pDgW/HghUjUBQPNNmAjlyRkFL5WRDa2W5/Yde0SYRbP3e2wjh9FsU50B2bqARoeARnwtFgZekcpSB6ggfIL2gPsBmgQ5u6BzbBFWB9kF4xFb9e+LGQbIVZFLU+I45dKxX2LMB0W/wIJYXLiJXlfoqxNqbnkgugCy1ArohiIMwcbDyaYFi5XbOb8oXsCfaSgqYe/W3g5UVQKIcuL3ycIrxaOl0dKoKKBXqSF38q0k1zxWX4ZED1qlTjiUDwXwx11Fql1DA2ZKN3PXfDv6WuQu9+ogt96d28fSDqRn7YzJMvMc8Dl4A3Egd5qK6JWRMpsOCT8Cs5HFNmK/EocGCfXMjqFr+CITHk1xDAAprNmGv3VbFhlOtzlasi++YUy31ATOr332qLJflBrhg7ZIAneDXn4ATwNJq6J5ieVFJe4lCD3kMrdVOjwNM1cWwq1L8n+koJjOvRVu6pDzx9nz3dTiipmyQNmuYaW8xsyBwX02PqKhd2/d7N/3agGJGqpBW+pJMi7joNljUORTge8gKG7H0ChTMoLPUTZk4ijjenCgeNQedoneabBZnRZBEvSVoK9tyEo1LrwsAQkyo3Ygd7pNuNl/tEjyBIoH32kLXesMGgcF5ARFudensAHgKldYfmky0lEm3Khwugss8PR2qLU8qZbcCj+rRRyhwUpnd4KH40SUkLRgI27r1ArHkhaKF6Ro72dAo5YIs58I63cIxlLgf7mLuRP392PB+5mzc7aWS4TKjTtm8EvCzZJ8UkduqkQp1QM9heWh8COzwCSleagXUtoZGDdUWim3WTEokniIyKN7qDnfzg3Sx74dpJYFm5uaNsbApE8ZuRZVogDeVC4Q41JhsxoSPgY/BpUXp5UZ4tryW2bjeJLQ3VDUUi3JlA43bdpN0Euo9KwgRNJbNruD3Q+0dePqqZ2RJ5nXXvNgSJE/SVH91koyGrIdQgATkSFkuXgQVr21hflt0Am1P9MX7IUfqcy4XN/UG5wPz2+OXAD1JokGjJU4oyp4smaYo4IjNFoS7mWC05Ml+iDyrahYkXdhclQ9XE0gYxbRSmbnvx0Pf3g74rPOTjcpQwcv6rd/c6iLZ8GjzcS2uSpoyZRWnWe6P5LCCEJUGyyT4XVr5igCNxYphn0slD7CNedADznTclTML7VYMgWppsQaacA5zD0yMhtPXIox5Q3vLhKSZurZJyVwwkNy8WdPYIb/5i0F/I0Gu2cqKhENdKhQEV00FaUY+hhchJp4HZDVox8tBDwK0tbd5P0WSd2B6XANEz7hK82rjue6ZiYF1zIenj8QqAyhXV/kQSTOi+A5m4bN7KxH/zwYtacWn/c9P3uAHDIiSb+YBACvZUDFfeKFdpG6imx5COuk14oICCgUVBPOU5PVjKSvUPii0rD9SZcFPWUAjKCfPiWhopjdrQcPMe1vUhUYLd7pksXAB5kRfFOd5evEbMZtGMwLDftn18gGUXNIX9LGSbGdVPyhb5SVfxYacJYHHqREns4Zx20dsHjFT0wRhyINCvatGkfSHuIJT/cG1RqN4+zUJBG8RD7ltygGkzfeew5XmGFpu1L5B7YuWYEiN+zEWnUCIsaejbCGtSmtnaDMq3RoeqQY/q/QSRGn1Z+2Xte3RyypkOinN7PPtwqiUqtNTIwk7BNg4BukN9wIXABQFLTfVJrBbMF3UB1HXo6SeIgSO9BAq5SLwieWBWyvfCucCERA2UYedoqGcIwaEVVMgFE4woYBFgX7SnSmY20uXCfUQHGMEnpWdq0RKWP3rR9of1cet3BK1bUAlIyPg0eg1YQhA/6xAbMjHRzavpkZISlbQfJsxkpWWtZedYe+VDPRODAPJ3uSgavgoGeTtcE4GU8ucMG9anNF9Qjr+1pEWLrEhEh6dlF2vV3tmHdJybeCdYu2u2Vib7Glnb6LJkHiaOM+aBh45o8wyIEqh4OoFZGns3lw8VGPCFpvHzIDzgZehQZHz1YWJA/FB1Snn4eTLQk8M7p4K4l8xPX0GeGYwV0PW0DosiTnkUjXm9klKXTU0c+SIuXbYlEDRXwPqEujVRoiq0qiw6hdnTgCi3bOIaX3fKvDUK8OBjfa+wba7I/KMHKIZgUlDBjZWNHR1/UHhntpwof2jSZty+iDstU5LuQTAJRdhnGk3bX05gHpxbpM3YqETSXvMfeWdr0N8w53iLiVvQtzX3qUTGMpklOQquGNXNqjzZiJrzkOxxQnoWqRclvjwVjuIojvT4NbXTv5IPdMbQpe8fw7zHs7lgV3NZ+MiBswVyL5AMDjj+CYqlm9dIztvYZuHli+WCsQHFkf95HAACaFknv3Vol04UB8SJQjgbBu4Ai7oWD8BibYCBpw5gVpw63PHpGrJRGilIpLZTzvCntCV/nLON7A00OJboIBMADLyhLEo30+cgojvRm1M5HPrN4UOI8gyXnk7VE4CoTABAv1iAYmCl/ubfiEUifdsbUKC+dIvsHMgaxSfXiVVeJDnyq/kKIckmJJHZtioKC15OPZPiqGX3Yqyqz2tSueG1E6i+eHZG3JW/xP/RejJJawfQKAAABhWlDQ1BJQ0MgcHJvZmlsZQAAeJx9kT1Iw1AUhU9TtSIVBzuIOGSoTlZERRxLFYtgobQVWnUweekfNGlIUlwcBdeCgz+LVQcXZ10dXAVB8AfE2cFJ0UVKvC8ptIjxwuN9nHfP4b37AKFRYarZNQmommWk4jExm1sVA6/wQUAQE+iRmKkn0osZeNbXPXVT3UV4lnffn9Wv5E0G+ETiKNMNi3iDeHbT0jnvE4dYSVKIz4nHDbog8SPXZZffOBcdFnhmyMik5olDxGKxg+UOZiVDJZ4hDiuqRvlC1mWF8xZntVJjrXvyFwbz2kqa67RGEMcSEkhChIwayqjAQoR2jRQTKTqPefiHHX+SXDK5ymDkWEAVKiTHD/4Hv2drFqan3KRgDOh+se2PUSCwCzTrtv19bNvNE8D/DFxpbX+1Acx9kl5va+EjYGAbuLhua/IecLkDDD3pkiE5kp+WUCgA72f0TTlg8BboW3Pn1jrH6QOQoVkt3wAHh8BYkbLXPd7d2zm3f3ta8/sBO6NykbCHUB0AAA0YaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA0LjQuMC1FeGl2MiI+CiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgICB4bWxuczpHSU1QPSJodHRwOi8vd3d3LmdpbXAub3JnL3htcC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOmViYmYwZTRiLTczOTctNDE0Yy04MTExLWQwOGEyMzdiMTU1MCIKICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpkZWYzODJhNi0wZTdlLTQ5YmMtOTJhYS1kOGVhN2E5NjhkZGYiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpjZDg1MWY4OC1iMGU0LTRjNzctOTBmNy05NTdkODc5ODZkOWMiCiAgIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIgogICBHSU1QOkFQST0iMi4wIgogICBHSU1QOlBsYXRmb3JtPSJXaW5kb3dzIgogICBHSU1QOlRpbWVTdGFtcD0iMTcwNDE5OTU4NDg4MzQ1NyIKICAgR0lNUDpWZXJzaW9uPSIyLjEwLjI4IgogICB0aWZmOk9yaWVudGF0aW9uPSIxIgogICB4bXA6Q3JlYXRvclRvb2w9IkdJTVAgMi4xMCI+CiAgIDx4bXBNTTpIaXN0b3J5PgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjY3Mjc5NjA4LWI4M2YtNGU1YS1iNmFkLWQ0ZTE3ODY5MzY5MyIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iR2ltcCAyLjEwIChXaW5kb3dzKSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyNC0wMS0wMlQxMzo0NjoyNCIvPgogICAgPC9yZGY6U2VxPgogICA8L3htcE1NOkhpc3Rvcnk+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz5grt1HAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH6AECDC4YsNu6agAABXtJREFUaN7VmslOG1kUhj+X63oobDyEIaRJIGYSJGxIiFpI2bTE2/QrZJVX6KfoRRbZsuqAUATdidTEoJihIRBBwLHLA8ZFlat6YdeFhEEMBuxfsixdl++tz+ece849ZY/jOA51kGVZGIaBaZqYpkmlUsG2bWzbBkBRFBRFwev1IoRACIHf70dV1Xosj+c6IJZlUSqVKJVKWJZ1pTlUVUXTNDRNuxbUlUAODw8pFAocHBwcnwpFUfB43JcH8NTeobqMg+M4OI6N47jWOlo+GAwSDofx+Xw3C2JZFvl8nlKpJMcUxYuiqCiK90q/pG1XsG0L267IMU3TaG1tvZSFLgyyv79PLpeTPu/1CrxeQT1VqZhUKqaMqUgkQktLS/1AdF2nWCxKC3i9Ao9H4SbkODaViiktFAqFiEaj1wNxHIdMJiNjQVV9KIrKbci2LSzrUMZOPB6X8XaalPMg0ul0DcKDEIFbg6haXkWIAODh4OCAjx8/nrszngmSyWQwDAOPR0EI/4250rnuUlt7Y+MLc3NzTE1NXQ5E13VpCVX13QnEcZiurl/QtBY2NjaYnp6+GMj+/r4M7LuyxM8KhcK8ePErAMlkkqWlpfNBLMsil8vJwG4ECFfx+D3Gxp4DMDs7S6FQOBskn89j27ZMco2m3t4E3d0PMU2T+fn500EODw9lxq53oqunRkaeApBKpdjZ2TkJ4prqJpNdveJlaGgYgIWFhR9BLMuSSa+RreGqv38QgNXVVXRdPwJxXeqqhd9ty+/309v7GIDl5eXTQOob4MnXz+jsvMeL15/qDtPd/QiAtbW16r1bllVL/Z6msQhAR0cnfn+AbDaLrusohmHIsrnZ1N7eDsD29jaKaZqyFGg2xWJxANLpdHODRCLVc0o2m0WpVCo1EE/TgWiaJnOg5+vXr45t2wgRvDJM8vUzfvtj/dLf6/n9L+ZePb1WC+rt2zcIIVDcM3gzWsRtTpimiWdzc9MB8Pm0ui/kWuq6v/x5evPmT3fXVY71nZpL7tFXCHEEcrxR1iwql6v1YSAQQPF6vU1rEbe0CofDKEII2U9qNuVyei0xxpobJJvNANDW1obq9/sBZCu0nnry6h++vbo5kL29PQC6urpQVFWt7cfOD43kRtfu7jcMo0wsFiMajVbPI26qt22raUC2tr4AkEgkjg5WRyDNYRHDMFhf/w+AgYGBIxBVVQkGgwCyrd/IWllJAdDX1yc79bJ2D4fDEqSRd7BiscDnz9VO4+jo6Ml2kM/nky7WyFZZXKye/wcHB7l///5JEIDW1lYURZGPwxpN6+trbG1tIoRgfHz8h8+Un8viSCRSK8gOG8rFMpnvfPjwNwATExMyFE4FAWhpaSEUCtXqfKMhYIrFAnNz76tJ9skThoeHT1xz6kE9Go3WdjGHlZUUxWLhTiHev5+lVNqnp6eHly9fnnrdmR2HeDzO7u4uCwv/MjPzjkzm+52408zMO/L5HA8ePGBycvLMa899GGpZFlNTU2xsbAAwNvac3t7ErQW2GxM9PT1MTk6e+9z9Qo+np6enSSaTAHR3P2Rk5CmhUPjGXGlx8RNbW5syJs5yp0uDACwtLTE7O4vbBxsaGqa/fxC3eq5H2bGykpLJTgjBxMTEqYF9LRC3fzQ/P08qlZJjvb2P6e5+REdH55Wr2K2tL7J2cpPd+Pj4iS22biCudnZ2WFhYYHV1VY75/QHa29uJxeJEIlE0TSMQCEq/tiyLcvmAUqlELqeTzWbY29vDMMpyjr6+PkZHR3/I2DcK4krXdZaXl1lbWyObzV5pjlgsRiKRYGBg4EJ/1bgRkJ+htre3SafTZLNZCoUC5XJZxpQQgkAgQDgcJhaL0dbWRldX17Vu/rj+B4fOkslK7fDMAAAAAElFTkSuQmCC"></span> Mit dem Plus fügst du eine weitere Zeile zum Rechnen ein.</p><p style="padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0" indent="0" indentsize="20"><span style="font-size: 30px"><img style="display: inline-block; height: 1em; vertical-align: middle" src="data:image/png;base64,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Lm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgIHhtcE1NOkRvY3VtZW50SUQ9ImdpbXA6ZG9jaWQ6Z2ltcDo3YjkxODE4OC05YzViLTQxOWMtYjhkMS03ZmZjMmE4M2U0OTEiCiAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzVjOGVmOWQtYTNhYi00YWU0LWI1OTctM2E5MGE0ZjRlMWVjIgogICB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6ZGIxNTFkZTUtY2M2ZC00NWI4LTg3N2YtNjcyNGFmYjU4Mzg1IgogICBkYzpGb3JtYXQ9ImltYWdlL3BuZyIKICAgR0lNUDpBUEk9IjIuMCIKICAgR0lNUDpQbGF0Zm9ybT0iV2luZG93cyIKICAgR0lNUDpUaW1lU3RhbXA9IjE3MDQxOTk1ODczOTU0MDYiCiAgIEdJTVA6VmVyc2lvbj0iMi4xMC4yOCIKICAgdGlmZjpPcmllbnRhdGlvbj0iMSIKICAgeG1wOkNyZWF0b3JUb29sPSJHSU1QIDIuMTAiPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoyZTA1MWI4Zi1kY2ZjLTQzOTMtYWYxZi1lMjdlZTg4Y2I4M2EiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjQtMDEtMDJUMTM6NDY6MjciLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogIDwvcmRmOkRlc2NyaXB0aW9uPgogPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSJ3Ij8+qlz6cQAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAAd0SU1FB+gBAgwuGynS69AAAAXjSURBVGje1ZrNTyN1GMc/nbfOTDulxW4WMAoLsgnusgnZNCHoGhPltokx/g1ePHg03jzq1cSj/4SJNzbRiOJmOZANIAnsYpuNwkJDy7S089YZD2UG3KWEtrz1e5yU3/TDPN/nbRoLgiDgHOR5HrZt47ouruvSaDTwfR/f9wEQBAFBEBBFEVmWkWWZeDyOJEnncXti3YB4nketVqNWq+F5XkdnSJKEruvout4VVEcgjuNQqVSo1+tHB8ViSJKMJEmIoogoisRiMWIxAYAg8AmCgEajQaPRwPM8PM/l+O01TcMwDBRFuVgQz/MwTZNarRZdU5Q4iqIgy0pH/0nXdXAcB8exo2u6rpNKpdp6QmcGOTg4YH9/P4p5VdVQVY1YLHYuMR4EAZZVx7Lqkaf6+vpIJBLnB1Iul6lWqwDIsoKu6wiCyEXI9xvUajVc1wEgmUySTqe7AwmCgL29vcgLup4kHo9zGbJtm1qtGnmnv7//1KffEiQIAorFIrZtIwgCiYRxbqmyHU8eHFTwfZ+dnR3u3bvX8jsIrQ7Z29vDtm1EUcQwUpcOEaZmw0jx4sULnjx5wtzcXMvPCq08Ua/XEQSBZNK4MD+cRYIgcuvWKMlkkkKhwPz8/NlADg4OImMnElcLEcowUrz//gcArK6usra2djqI53ns7+9Hxr6KcGqlGzduMD09A8DCwgKVSqU1iGma+L6PLCuXlp3a0fj4OMPDI7iuy+Li4skgjuNEFVvXda6rpqamAFhfX2d7e/t1kPBRqap2LXxxml/u3p0EYHl5+SjDhd4Ii56qal3eyuHvn77nx8dF/Fce/hvTn/PlJ6MoXd5hYuJdVlaWef78OblcjnQ63SyIpmlimiaKEieRSLZ98D8/f8cPf5Ta/rvMe1/y1cM3O4L5888Fnj3b4P79++RyuWZohd7opH2+Ko2MjACwubnZDK3mXOARi8U6bsXffPg13z68XJDBwSFUVaVUKlEul5Fs2z5sB+SuDm43vLoJq1A3bw5QKOTZ2tpCcF036mt6TdlsFoBisXgEIopiz4FkMhkASqUSQqPR6FmQZDIZ1UAhHF3Pa2S9TGlas+ZZlnUcROg5kDBBua5L7337lnOLcLR36jV5nnu4EJGPgwQ9B3LUH6oIYbYKs1cvKZxkDcNAkGW5Z0FKpVJUTyKQTpfQV6lisRhVeCEcaUPjdJ7T2xuN45rWNcjLl9uHDeQggiRJSJJEEATRmrIT9X/4GR+/pZ8hnwvob83y6Yf9XUFsbf2LZVlkMhnS6XRzQtR1HdM0cRyn41Ye8W0++uIbPrqksMrn8wCMjo4ezezhssFx7J5Iw5Zl8ezZRrRZiUAkSTrWt9SvPcja2l8AjI2NRZt64Wg7YUQgvn99U3GlYrKy0tyeTE5Ovr4OUhQlCrHjb6Sum5aWlgC4ffs2AwMDr4MApFIpBEHAdR3CEfg6aWNjg0IhjyzL5HK5V3Lh/9piib6+vsOnUr1WRXJ3d5fHjxcAmJmZiaxwIghAIpGIJq/mS5bGtfDF77//BsCdO3eYmJg4oTqdoHQ6jaZp+L7PysoylYp5pRC//voL1WqV4eFhHjx40KLMtqrU/f3s7Ozw9OlTHj2aY3d390rC6dGjOcrlMkNDQ8zOzrb87KkvQz3PY25ujkKhAMD09ExUgC7D2KEnhoeHmZ2dPXVldabX0/Pz86yurh4eOsLU1BSGkbqwUFpaWqJQyEeeaBVObYM0q+kaCwsLhHuwu3cnmZh4F1VVz63tWFv7Kyp2siwzMzNzorG7Agn3R4uLi6yvr0fX3nlnnJGREQYHhzruYvP5fNQ7hcUul8u9lmLPDSTU9vY2y8vN9xOhVFXl5s0BstksmUyGZDKJpmnRysbzXOr1OtVqlVKpRLFY5OXLbSzLis4YGxtjcnLyfxX7QkFClctlNjY22NzcjMbOdpXJZBgdHWV8fPxMP9W4EJBXoba2tigWi5RKJSqVCpZlRZ6SZRlVVTEMg0wmQzabZXBwsKsvf1z/Ac73tmF0wgR1AAAAAElFTkSuQmCC"></span> Mit dem Papierkorb kannst du die eingefügte Zeile wieder entfernen.</p>' : 'Rechne schriftlich.';
    const sectionElements: UIElement[] = [
      this.createElement(
        'text',
        {
          gridRow: 1,
          gridColumn: 1,
          marginBottom: { value: config.operation === 'multiplication' ? 30 : 10, unit: 'px' }
        },
        { text }),
      this.createElement(
        'math-table',
        {
          gridRow: 2,
          gridColumn: 1,
          gridRowRange: showTooltip ? 3 : 1,
          marginBottom: { value: 30, unit: 'px' }
        },
        {
          text: 'Rechne schriftlich.',
          operation: config.operation,
          terms: config.terms,
          inputAssistancePreset: config.operation === 'multiplication' ? 'numbersAndOperators' : 'numbers',
          inputAssistanceFloatingStartPosition: 'endCenter',
          hasArrowKeys: true,
          hideNativeKeyboard: true
        })
    ];
    if (showTooltip) {
      sectionElements.push(
        this.createElement(
          'button',
          { gridRow: 2, gridColumn: 2 },
          {
            imageSrc: TemplateService.tooltipSrc,
            tooltipText: 'In den kleinen Feldern oberhalb der Rechnung kannst du mehrstellige Überträge eintragen. ' +
              'Wenn du einen Übertrag durchstreichen möchtest, drücke zweimal hintereinander auf das jeweilige Feld.',
            tooltipPosition: 'left'
          })
      );
    }
    return new Section({
      elements: sectionElements,
      ...showTooltip && { autoColumnSize: false },
      ...showTooltip && { gridColumnSizes: [{ value: 1, unit: 'fr' }, { value: 45, unit: 'px' }] }
    } as SectionProperties);
  }

  private createDroplistSection(config: {
    alignment: 'column' | 'row', text1: string,
    headingSourceList: string, options: DragNDropValueObject[],
    optionLength: 'long' | 'medium' | 'short' | 'very-short', headingTargetLists: string,
    targetLength: 'medium' | 'short' | 'very-short', targetLabels: TextLabel[] })
  {
    const sectionElements: UIElement[] = [
      this.createElement(
        'text',
        {
          gridRow: 1,
          gridColumn: 1,
          gridColumnRange: 2,
          marginBottom: { value: 20, unit: 'px' }
        },
        { text: config.text1 }),
      this.createElement(
        'text',
        {
          gridRow: 2,
          gridColumn: 1,
          gridColumnRange: 2,
          marginBottom: { value: 20, unit: 'px' }
        },
        {
          text: config.alignment === 'column' ? config.headingSourceList : config.headingTargetLists,
          styling: { bold: true }
        }),
      this.createElement(
        'drop-list',
        {
          gridRow: 3,
          gridColumn: config.alignment === 'column' ? 1 : 3,
          ...config.alignment === 'row' && { gridRowRange: config.targetLabels.length },
          gridColumnRange: config.alignment === 'column' ? 2 : 1,
          marginBottom: { value: config.alignment === 'column' ? 20 : 40, unit: 'px' },
          ...config.alignment === 'row' && { marginLeft: { value: 5, unit: 'px' } }
        },
        {
          dimensions: { minHeight: 58 } as DimensionProperties,
          value: config.options.map(option => ({
            text: option.text,
            id: this.unitService.getNewValueID(),
            originListID: 'id_placeholder'
          })),
          orientation: config.alignment === 'column' ? 'flex' : 'vertical',
          highlightReceivingDropList: true
        }),
      this.createElement(
        'text',
        {
          gridRow: config.alignment === 'column' ? 4 : 2,
          gridColumn: config.alignment === 'column' ? 1 : 3,
          gridColumnRange: 2,
          marginBottom: { value: 20, unit: 'px' }
        },
        {
          text: config.alignment === 'column' ? config.headingTargetLists : config.headingSourceList,
          styling: { bold: true }
        })
    ];
    const targetListOffset = config.alignment === 'column' ? 5 : 3;
    config.targetLabels.forEach((label: TextLabel, i: number) => {
      sectionElements.push(this.createElement(
        'text',
        {
          gridRow: i + targetListOffset,
          gridColumn: 1,
          marginTop: { value: 16, unit: 'px' },
          marginRight: { value: 5, unit: 'px' }
        },
        { text: label.text })
      );
      sectionElements.push(this.createElement(
        'drop-list',
        {
          gridRow: i + targetListOffset,
          gridColumn: 2,
          marginBottom: { value: i === (config.targetLabels.length - 1) ? 40 : 5, unit: 'px' }
        },
        {
          dimensions: { minHeight: 58 } as DimensionProperties,
          orientation: 'vertical',
          onlyOneItem: true,
          allowReplacement: true,
          highlightReceivingDropList: true
        })
      );
    });

    const section = new Section({
      elements: sectionElements,
      autoColumnSize: false,
      gridColumnSizes: config.alignment === 'column' ?
        TemplateService.getDrolistColSizesVertical(config.optionLength, config.targetLength) :
        TemplateService.getDrolistColSizesHorizontal(
          config.optionLength as 'medium' | 'short' | 'very-short', config.targetLength)
    } as SectionProperties);

    this.unitService.connectAllDropLists(section);
    return section;
  }

  private static getDrolistColSizesVertical(optionLength: 'long' | 'medium' | 'short' | 'very-short',
                                            targetLength: 'long' | 'medium' | 'short' | 'very-short')
    : [ { value: number; unit: string }, { value: number; unit: string } ]
  {
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

  private static getDrolistColSizesHorizontal(optionLength: 'medium' | 'short' | 'very-short',
                                              targetLength: 'medium' | 'short' | 'very-short')
    : { value: number; unit: string }[]
  {
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

  private createSortlistSection(config: {
    text1: string, options: DragNDropValueObject[],
    optionLength: 'long' | 'medium' | 'short' | 'very-short', numbering: boolean })
  {
    const sectionElements: UIElement[] = [
      this.createElement(
        'text',
        {
          gridRow: 1,
          gridColumn: 1,
          gridColumnRange: 1,
          marginBottom: { value: 20, unit: 'px' }
        },
        { text: config.text1 }),
      this.createElement(
        'drop-list',
        { gridRow: 2, gridColumn: 1, marginBottom: { value: 40, unit: 'px' } },
        {
          dimensions: {
            // eslint-disable-next-line no-nested-ternary
            maxWidth: config.optionLength === 'medium' ? 500 : config.optionLength === 'short' ? 250 : 125
          } as DimensionProperties,
          value: config.options.map(option => ({
            text: option.text,
            id: this.unitService.getNewValueID(),
            originListID: 'id_placeholder'
          })),
          orientation: 'vertical',
          isSortList: true,
          highlightReceivingDropList: true,
          showNumbering: config.numbering
        })
    ];

    return new Section({
      elements: sectionElements
    } as SectionProperties);
  }

  private createElement(elType: UIElementType, coords: Partial<PositionProperties>,
                        params?: Partial<UIElement>): PositionedUIElement {
    return ElementFactory.createElement({
      type: elType,
      id: this.idService.getAndRegisterNewID(elType),
      position: PropertyGroupGenerators.generatePositionProps(coords),
      ...params
    }) as PositionedUIElement;
  }
}

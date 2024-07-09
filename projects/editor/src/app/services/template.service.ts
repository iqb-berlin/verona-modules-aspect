import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RadioWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/radio.dialog.component';
import { ElementFactory } from 'common/util/element.factory';
import { PositionProperties, PropertyGroupGenerators } from 'common/models/elements/property-group-interfaces';
import { Section, SectionProperties } from 'common/models/section';
import { UnitService } from 'editor/src/app/services/unit-services/unit.service';
import { IDService } from 'editor/src/app/services/id.service';
import { TextImageLabel, TextLabel } from 'common/models/elements/label-interfaces';
import { PositionedUIElement, UIElement, UIElementType } from 'common/models/elements/element';
import { TextWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/text.dialog.component';
import { LikertWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/likert.dialog.component';
import { InputWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/input.dialog.component';
import { RadioImagesWizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/radio2.dialog.component';
import { Text2WizardDialogComponent } from 'editor/src/app/components/dialogs/wizards/text2.dialog.component';
import { LikertRowElement, LikertRowProperties } from 'common/models/elements/compound-elements/likert/likert-row';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  readonly dialog = inject(MatDialog);

  constructor(private unitService: UnitService, private idService: IDService) { }

  async applyTemplate(templateName: string) {
    const templateSection: Section = await this.createTemplateSection(templateName);
    this.unitService.getSelectedPage().addSection(templateSection);
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
            .afterClosed().subscribe((result: { text1: string, text2: string, options: TextImageLabel[], rows: TextImageLabel[] }) => {
              if (result) resolve(this.createLikertSection(result));
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

  private createText2Section(config: { text1: string, showHelper: boolean }): Section {
    const sectionElements: UIElement[] = [
      this.createElement(
        'text',
        { gridRow: 1, gridColumn: 1, gridRowRange: 2, marginBottom: { value: 40, unit: 'px' } },
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
            imageSrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAABKCAYAAAAG7CL/AAABhWlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw1AUhU9TtaIVBzuIOGSoLloQFXGUKhbBQmkrtOpg8tI/aNKQpLg4Cq4FB38Wqw4uzro6uAqC4A+Io5OToouUeF9SaBHjhcf7OO+ew3v3AUK9zFSzYwJQNctIxqJiJrsqBl7hQxd64ceYxEw9nlpMw7O+7qmb6i7Cs7z7/qw+JWcywCcSzzHdsIg3iGc2LZ3zPnGIFSWF+Jx43KALEj9yXXb5jXPBYYFnhox0cp44RCwW2lhuY1Y0VOJp4rCiapQvZFxWOG9xVstV1rwnf2Ewp62kuE5rGDEsIY4ERMioooQyLERo10gxkaTzqId/yPEnyCWTqwRGjgVUoEJy/OB/8Hu2Zn5q0k0KRoHOF9v+GAECu0CjZtvfx7bdOAH8z8CV1vJX6sDsJ+m1lhY+Avq3gYvrlibvAZc7wOCTLhmSI/lpCfk88H5G35QFBm6BnjV3bs1znD4AaZrV8g1wcAiMFih73ePd3e1z+7enOb8fLtxyjG2CMSAAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQfmAQYQGwCh0ky5AAATlElEQVR42u2ce3RV1Z3HP/uccx9Jbh6QBAiQEAQEREQkCDUVC3S0VcdH21EcB2tbZtpaS9th0VZrK3ZYTseuLuuasXUqVu3DtlqhC20VpwgFqgLykGcSHuF1Q8g7N/d9zzl7/rgn9557cm8g4Wln9lp7cck9OY/v/j2+v+9vnwgppeQSHoFAgKKiogt+XYVLfPj9/oty3UsaGMMw6Onp+X9gnKOjo4OSkpL/S8DIHJ8zx9GjR6moqPi/AIwTENP22Zq2XNDa2orP5zuDc9rnh9Zi0g8RjUYscHqnBJH8zjQNpJQIIU5zng+1xdgfovfBdZ57bgVSJgDDNpPfd3d3UV5enuVUfc+Vew5+aBcelKR1CKHT1OTHNKOoqmqtkQIkP/v9J6iqqrT9rrAsiizAYDuGzOMRl6LF2FfPtCxCB+IIEaew0EssFgBi1kxYU6e1tYXS0iEOEOznNHJMM8vxl4zFyCzg9IKipx5+5MihRCKd5OcLa41cqakoEk0T1oOKLEHbEZtQrONU25rLQVvOeQJGOKzFDkjcmgmqqsro6WmjtNRr3Upy1U1Tx+fzWMeptofGBrJpndO0XVNxLIoyaLfSzq8LZbpP2mWSwIwZU0ow2AmUWQDogIGuQ2VlmXWsak3hsBjd5j69D6/ZPossMWcAS3tui0h7MOwFJWEDJZoBjGkmSCR0PB639fAu6+Fcts+qw2rMHDHF7opux++Li+lKzlRp2NzHDkovMDqKYuLxiIw0nX5g3bo9xQGM02KkLbbYP6u2c4qLFXxzgWJ3n0xQ0kFTOFwPhwsqtukMvtncSLU+9x6jOlL+BQMmV0pOOABJOIKl4ogHiuPG7cApjusZtu/t51IcLnZRLMYZmpyBNp4DFGFzDSUFiJRgGCbxeALTNBECXC4Nl0tDiGzgO4HpPa/zuwvOY0SWuJCwuYt96tZxauoBpBR0dAQ5ePAY+/cfYteuenbvbsDvP0UoFMbl0hgxooxp0yZRUzOF6dMnMXFiFXl5WpYiVOTgNmcOipQSXddxuVxnk5Wkw6yNLFYSt/EXUoC0tQXYvn0/a9Zs4ve/f5Njx5qTay4EqirQNBVNE4QjOoZhppdBwE03XceXv/wPzJ07g8JCT5bg6wG8QL41vbbsJHLGme7ubnbv3s2sWbPOAhhpr1fMHPGk133MVEBsbu5k1aq1PPnkC2DGuO2Ts7lm2jgqRgyluDCf/HwveV43qqaiKgrBcIRTLV0c97exv8HPhvf28847u0kkDG6+uZZHHlnErFmTURRszNcF5FmzFxi3DZi+abuuro7Dhw9z4403omnaIHlMH1CMHOk4DUooFGf16r/w2GNPM3pEEV/90m3MnjGRkuICy/BkX4sXaTInhEA3JUdPhTh0tIVNf93JM8+sJBpL8MQTX2fRojvIz3fbMpLHYTEeW9pPA2OaJhs2bEAIwZw5c/rIGwMARmbJCrnImwEIDh7089hjP+Wll/7E448u5PP/dCPFvjyklLYQIHHegehDWAWGlJxoixKMGTQe8fPEE79ky9Y6vvWt+/nOd75AYWGedbDTajzWz9JELxQK8eqrrzJ9+nSmTp2a9WnVZcuWLRuYBGlk4SlRh6Uo7Nx5kAULlrJx4zZ+/vRi7v/Hj5PncYNpOoQ6G5fpk1lFCkBFQGGeRiiiU+DzMWvWlTQe8fOb37wFCGprr0HTVFt6Vx3MOQlKc/MpVqxYwR133MH48eMHUhLIHFZiz0D2YtAOStJS9u5t5O67l9DQcJQXn/kGd976EUuYs4MizzxpWFaDAMOU1J8IYQCnTrWx9JtPUVd/ghdfXM7ChbdaLuG23KjXcpJxZv/+Bt5+ex0LFy48ba/KAYzsR/8wbe5jjyu9AJmWThvgnnuWsnbtFp558svcd898FARIiTSlTYUbJENA0BmM03gqgsulsG/fIR5c/EPyCwpYv/4FJk++zLKYXmC8gJd3332fcDjKDTd8zAqy4kyFqmxKm+HQUexWErEFW92SKwUrVrzK2rVb+MLC+dzzmRvOHSikY1JxgQuXCrpucsWUcXz7m/fR0tLJT37yO3TddLi8SSIRY/jwYcyfP89ytzOqrk2ZXVSyEyXToafEHIE2Sd4aGvxcffWn0VTBxjeeYNKE0SBNpMnZg+KIzi2dMY62hnG5VCQGy5b9N39+ezs7dqziqqsut+KLx2Y1/aftLBYjbL4uHWA4KX48C1cxUqdas+Zd4nGDf/7sTVw+flTSUlLx5OwoupM2DCl0IUiWEaqqcecdczFNyeuvr0dKkaXgHFjdpJyZ0GR3J91W8qcLvUhE56WXXgfg9ptnowjLQjKY+eDFaedwqQKfV8MwJIZuMm5cJb4CDy+8sJKurlA/PSc5AGDEmahczkJOZkiKx4+3sG3bPqorh1ouZMs+g1TRTkcjigs0TFNiGBKfr4CamskcOHCM+vojNplzcC0VJfuPhEMg6u+zAmgcO9aMYRjc9snZFBXmpfs/56UnlgTY59WQUmJaYfLKK5O8ZO/eA46q3xwwSKniIBDoQUqT4uKiLHJgLp81UgVcU1MbUsI108YhEKRYgDyHhuIYXreCIgSmmQRn9KhhCCHYtasOKYXFoNNW3tjYSHd3CIHA4/VSVVVFfn5Bf8AICgt9bNy4ic7OdubNm0dhYUE/IpIzkKl0dgaQUjJ82JD09+cRFABNVXBpgrieDPLFxYUANDQ0YhiGlZrT+s3YsWOy1k39upIQCnPmzGHWtbN59tnn2LBhk8UJeqm1ZhOZ3Q7BWiEWSwDgdmuWlQ4eEdOU9AQjnK6ME0LiUpMil2lKS1SHjo5udN3IQk7NAQZf2xhRMYLFixej6yaPP/4fHD16HCkVm3rvts20Cu92J28qkdAHmHllZhEiYfWbm9myvYFNm/efNtaoikg9rBBJF3a7NZscMTgBS8t2MU3TmDdvHlOnXsnvfvcy5eWl3HrrLRQU2BtjWoYYXVxciBCCQCBs1YTyDCzD5Llf/xmXpjL3+qsYM7qc7kAy1c6fM421Gz4gGIriK/DmPoctlJlmkklWVAyz+uFOcV2mitzTCeT99q7Ly8t54IEHmDZtOj/72QoOHDhsy0qZjbDhw5M7E06cbE/772m8KRbXCQYj3PuZG9ix6xD+k+20tHYxcsRQAEaPLKO1rbtfl4vEDIQQCCAeiwMwfnw1qpqrtHHowTK7BSmnM1VFUZg0aSJf/eqDhMNhotF4ll4PVFUldz59sOcwpjQzNRXrwvG4znF/Wyq9ul0a3YEQiqLwyY/PYP1f96Db5ExFEcQSidT/T57qyLi7YFRPHS8EBEMRAC6/vDpLmyXb59yh8Ax3Owg0zcW0aVfj9eY5uE4vMCO54opxrN+4m2Ao6jDT5L8HDjdx+30/4pXVm9ANE1VVqKocRktrFx63i2gsjq/AS3NLJwBNJzsYUpTcUeU/2c67W+sz7qormEgapgChCDo6AgCMG1fliCt2i8nWXulrNYPYBmInf+mUV1SUz8KFn+bw0VaOHGvJqj1PnDCaT98ynW27mnnxt2uJxRLUzpzEur/uRkpJJBKjvKyYfXXH6Q6E2NdwnPKyIto6Ajz0b79gyqSqDCPsCeuASLqSgCNHmvB63VRXV+ZoAmbbMpJ9r80ggRGO/lBy3HLLXFRVYdvOgyBEH3fSVIX77p6HpkQYOXwojz/5Ml6vm6bmDtZt2k2e10Oe182smoks+vp/csXESrbvOsxvV27AV+BlzOj0DqtI3KAnqiOEQFEgEU+wdds+br55LiNGlNkW0M5ZZD+ZKtPtzwIYJ0mSTJp0GV/84r288oeNVizqu9tg9Mgyrpw8htKhhXx2wXx++fI69tYd599//AptHQF+9co6NryzhyVfuZPOriDRaJy7br+esWOG4/G6U2dr7YohZTIOCUWhubmdQ4eauPvuv7daIHaKoeVo8xo50/cAxXCnvBm1SZvJ8mDnznpmz76Tt1cvZ8ZV4yzpIbNm6g6EWf6j37L84YW43RqRaBxNVWluTcaWkcOHZghKe+uO0Xj0FLfeNNNK0ZKdh7pJGBJFEWgulT/+aSN/emMrb731a8rKih3tXfuOCdUx7T9LL7wyOBfKViokV2Dq1MtZuvRLvLJqI4a0cQWRBri4KJ/5c6axeVs9Qgjy8zy43RpVo8qpGlXeR2VrPNpMddWwNLDBBLGETN6BIggGQ6xatY6HH15MWVmpjaV7bNNOShVH79xZ1MmBACP7ASvdVlFVyaJFd7Hqje3UNRy3Yk1f6eH6j0xh9ZotqVKiv1F/qInhw0pSzLipPYoQEqEk49iba96hsmosn/jEfFsJ47J1Jj1k7pnRssSfTLcfUIyRfciQpO8WsARVVcP57ncX88zzbxDXdRBKH8JXkO9lbu1UPth75LTs+Li/laLCfAB6wgl6ogaKoqCogoOHTvD0T37P4sWL8PkKbLHF7Zh2UJyyiTI4HmOaBvX1DUQi4RzxxsyQQoVI8KlP/R2HT4T4n3U7U1zDuTLXXTuZ19/aktGj7sOOYzqapuJ2JauXlu5Yck0ViEaiPPfzP1BbO4vrr59ty5RaFiC0LPFFzSKtiDMDJhgMsnnzZiorR5Ofn99PujMzRPMhQ/L53vce5BsPP8ueumNgmT02txpS4qO6chhHT7TkvH4oEmVURSmmKQlGdNoD8WSBKCWrX9/Iho0fsGTJAxQWFuZotCkOQqrkcCNx5hbT09NDXV0d1147ywaKzAGKE5w4tbVX87kv3MuDS3/KcX+bFW8yXWru9Vex4Z296IZBS2sXR461EI+nK/RwOMbwsmL8J9t5a+N+2jsDIAS7dh/gv55+hbvuuo2PfeyjDmtR+3l4kSOZZLLRfoEpKCigpmYGqqqcpjsps/S2dVTV5CtfuRfNU8S3l71AZ3fI8qkkOKZhYhgmf3lnDzt3N+JyaYypLE9qOtaIJ3RKhxZRXFJCReUoSkoKicXivPCL11AUhSVLHrRUuGzuIlKbknJnUzHwIlJRnPtrc6XubKuTBKi8vJgf/OBbrH7zfZ79xZsYpkzS92MtbNqyn+LCfD53z3zyvG6GlPj67DpwuTRcHg8HmoJIKVGEgv9EC9u21bN06deZMWNGDvdJW0LuFzVy75k5Cx6jONQ9e8Czlwoms2dfzfe//68s/+HLHGxsIhCMoGkqc66bQnlZMTOmjaelrSvrVUdVlDJkWAWxRHKbmkTS3t6Fz+fj85//LKrqzpFtzq4zoQzuVxRH9HenesSZhCpJzVVV5f7772bsZdVs3d5AUWE+laPKbC7r5YbrpmbdjtPYHCYcT7d329u62L27gdtvv42xY8c7JFaNzC3zg5dXtTO3FpmlurZ/3wuU7hDLk8ePGDGcr33tX3hs+Q8YPbKMj9RMslKwTGkvztEVitPSFSMcjtJ4xM/77+9l175WKsdUM7tmEqrqymEZZ6/AawNzpd5Y46TTvUBlewNEpqystnY2x5s6+fbyVVw5oZRbb5zO5ZeNoqy0iLw8D5qqYEpJNBqnsytIQ+MpVq/dxeYtDUy4YiYTJ9/A9NpRHGk8YAVcJcc9ciGBsS6cIrtKlniTrWJNbzmtqqqmurqK8ePHcdfC+6ivP8Da3+zn0KFDdHe1oevJitnlLmDkqNFMmDCBa2fdzMyP3oMu1ZSUbJpYXQBxqQCDYx+YHaBeLqOR7Y22ZO9qKNdddx11dfUUFPioqamhpqYG0zDRDQPDSOq3qqqiqmoqmzT6u+gJx9NvKZgGkUgkRwF4bsYgX+TqDYb9Zae+L0yoqpsZM66htbWNeDyRCrBCUXC5XHi9XjweD5qmpUAxTEk8YaTWRAhIJOKEw+HzYimDtxj7jWS8hpeLE2SSp2HDRtDZ2UkikcDr9fZ7lYRucKw5QFw3Mgw1EU8QO88vLZ6jV/+yqXoiS30i8Hg8hMNhEolEv53GYDjOYX8Xvjw3ZSX5Gd/phk4oFOJ8/lkK7dyAcroAmLYql8uNaZok4omMYxO6STAcJ54wiMZ1VEUwpqIYr1ujtTPkuIKgp6fnNK8fX3RgBgaex+OxVt3IOEJVBYX5biQSRVGs1it9KL2U4Ha76TwVxDRNq2z50AKTWZgCRKOxTJ8WAkXLvvqamvnw3rx8QqFQqiV7CceYMx9J3QTaOroJhuMZncdcw6WpyV1rMpmVkjpv8LwCc8EtpqSkBFVVScRC+PLdp913ICUEQrFUupYyaW09PT0YDnf80ANTWlpKS0vLaRmIYUqaWnvoCcUz0nU8FiMQCKDr+t+OK/l8PiZPnszhw4f7TbfRmI6/JUCB18WYiuKU9fQy3/OVjS4aMJqmMW3aNHbu3Ek0Gs0hvktiCZ3Rw4oYWpyHx22VB1LS0tzErh1bWbJkSSpe/U0AI4SgtrYWv9/P/v37swZQRREU+7wpKUKaJu2n/Kz540p+9dyP+eKi+1i0aNF5S9Vwzl9IP7MRiUR46qmnePTRR1mwYAHz589n5MiR1i4oi93qOi0tLezbt4/169ezd+9eHnroIRYsWEBVVdV5dyVxsf7cm2EYbN26leeff56VK1cyfvx4pkyZQkFBAYFAgD179rBjx45U5nnvvfeYOXPmebUSRzq8uEPXdXny5En5yCOPSFVVpaqqsrCwMNV6EELIhQsXykAgcEHvS1wqfyCwvb2d1157jdbWVkpLS6murqa0tJTi4mIqKipSpcSFGv8LfyImffebTbQAAAAASUVORK5CYII=',
            tooltipText: 'Drücke kurz auf den Knopf mit dem Stift. Drücke danach auf den Anfang' +
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
            },
            ...!config.useTextAreas ? {
              showSoftwareKeyboard: true,
              addInputAssistanceToKeyboard: true,
              label: ''
            } : {
              showSoftwareKeyboard: true,
              addInputAssistanceToKeyboard: true,
              hasDynamicRowCount: true,
              expectedCharactersCount: config.expectedCharsCount * 1.5 || 136,
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
          { options: config.options, itemsPerRow: config.itemsPerRow })
      ]
    } as SectionProperties);
  }

  private createLikertSection(config: { text1: string, text2: string, options: TextImageLabel[], rows: TextImageLabel[] }): Section {
    return new Section({
      elements: [
        this.createElement(
          'text',
          { gridRow: 1, gridColumn: 1, marginBottom: { value: 10, unit: 'px' } },
          { text: config.text1 }),
        this.createElement(
          'likert',
          { gridRow: 2, gridColumn: 1 },
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
            stickyHeader: true,
            firstColumnSizeRatio: 3
          })
      ]
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
